export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createSb } from '@supabase/supabase-js'
import { fetchPortalJobs } from '@/lib/careerops/scanAtsApi'
import { verifyQStashSignature } from '@/lib/qstash/verify'

/**
 * QStash receiver — runs ONE portal scan, dedupes against scan_history,
 * inserts new jobs into the user's pipeline.
 *
 * Trust model:
 *   - Public route (no Supabase user auth — QStash can't carry user cookies)
 *   - Authenticated by HMAC signature on Upstash-Signature header
 *   - Each enqueued payload carries the user_id; we trust the signature, not
 *     the body alone, so a forged body without a valid signature is rejected
 *
 * Why service-role: Supabase's anon-key client uses the user's session.
 * QStash has no session; the signed payload IS the auth proof. We use the
 * service-role client to write on behalf of `payload.userId`.
 */

const Body = z.object({
  userId: z.string().uuid(),
  portal: z.enum(['greenhouse', 'ashby', 'lever']),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/i),
  company: z.string().min(1).max(80),
  /** Optional title-keyword filter — same rules as the inline scanner. */
  titles: z.array(z.string().min(2).max(80)).max(40).optional(),
})

const NEGATIVE_KEYWORDS = ['intern', 'internship', 'recruiter', 'sales development representative', 'sdr ', 'hr ', 'human resources']

function matchesTitleFilter(title: string, positives: string[]): boolean {
  const t = title.toLowerCase()
  if (NEGATIVE_KEYWORDS.some(n => t.includes(n))) return false
  if (positives.length === 0) return true
  return positives.some(p => t.includes(p.toLowerCase()))
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('upstash-signature') ?? ''
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 401 })
  }

  const rawBody = await req.text()  // MUST be the raw bytes; do not JSON.parse first

  const verify = verifyQStashSignature({
    signature,
    rawBody,
    url: req.url,
    currentKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  })
  if (!verify.ok) {
    return NextResponse.json({ ok: false, error: 'invalid_signature', reason: verify.reason }, { status: 401 })
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { userId, portal, slug, company, titles = [] } = parsed.data

  // Service-role client — QStash carries no user session, so we authenticate
  // the request via signature and act on behalf of `userId`. The user_id is
  // NEVER taken from the request *outside* the signed JWT body.
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !supaKey) {
    return NextResponse.json({ ok: false, error: 'service_role_missing' }, { status: 500 })
  }
  const admin = createSb(supaUrl, supaKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const start = Date.now()
  const jobs = await fetchPortalJobs({ portal, slug, company })
  const filtered = jobs.filter(j => matchesTitleFilter(j.title, titles))

  // Dedupe against existing scan_history rows for this user.
  const existing = await admin
    .from('scan_history')
    .select('url')
    .eq('user_id', userId)
    .in('url', filtered.map(j => j.url))
  const seen = new Set((existing.data ?? []).map(r => r.url as string))
  const fresh = filtered.filter(j => !seen.has(j.url))

  if (fresh.length > 0) {
    await admin.from('scan_history').insert(
      fresh.map(j => ({
        user_id: userId,
        url: j.url,
        portal: j.portal,
        title: j.title,
        company: j.company,
        status: 'new',
      }))
    )
    await admin.from('jobs').insert(
      fresh.map(j => ({
        user_id: userId,
        source: j.portal,
        title: j.title,
        company: j.company,
        location: j.location || null,
        url: j.url,
      }))
    )
  }

  // Audit log — also fire-and-forget so a transient failure doesn't bubble up
  // and trigger a QStash retry storm on a successful job.
  admin.from('audit_events').insert({
    user_id: userId,
    action: 'qstash_scan_portal',
    resource_type: 'scan_history',
    metadata: {
      portal, slug, company,
      jobs_returned: jobs.length,
      jobs_after_filter: filtered.length,
      jobs_inserted: fresh.length,
      duration_ms: Date.now() - start,
    },
  }).then(() => {}, () => {})

  return NextResponse.json({
    ok: true,
    portal, slug, company,
    jobsReturned: jobs.length,
    jobsAfterFilter: filtered.length,
    newJobs: fresh.length,
    durationMs: Date.now() - start,
  })
}
