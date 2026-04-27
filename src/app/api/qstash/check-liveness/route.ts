export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'
// Vercel function memory MUST be ≥1769 MB to accommodate @sparticuz/chromium.
// Set in Vercel project → Settings → Functions → Memory: 3008 MB.
// On smaller deployments this will OOM — verify the dashboard before merging.
export const preferredRegion = 'auto'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createSb } from '@supabase/supabase-js'
import { probeLiveness } from '@/lib/careerops/livenessDriver'
import { verifyQStashSignature } from '@/lib/qstash/verify'

/**
 * QStash receiver — probes ONE job URL with a headless Chromium, classifies
 * the result, persists liveness_status + liveness_checked_at on the
 * matching jobs row.
 *
 * Trust model identical to /api/qstash/scan-portal:
 *   - Public route, signature-authenticated
 *   - userId comes ONLY from the verified payload, never from request alone
 *   - Service-role client writes on behalf of payload.userId
 *
 * Cost considerations (per call):
 *   - 200-300 MB RAM peak (Chromium)
 *   - 4-15s wall clock depending on the page
 *   - 1 LLM call: zero. Pure HTTP + DOM inspection.
 */

const Body = z.object({
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
  url: z.string().url(),
})

export async function POST(req: NextRequest) {
  const signature = req.headers.get('upstash-signature') ?? ''
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 401 })
  }

  const rawBody = await req.text()
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
  try { json = JSON.parse(rawBody) } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { userId, jobId, url } = parsed.data

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !supaKey) {
    return NextResponse.json({ ok: false, error: 'service_role_missing' }, { status: 500 })
  }
  const admin = createSb(supaUrl, supaKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const start = Date.now()
  let liveness
  try {
    liveness = await probeLiveness(url)
  } catch (e) {
    // probeLiveness already swallows recoverable errors and returns
    // 'uncertain'. A throw here means an unrecoverable browser-launch fail
    // — typically OOM (Vercel mem too low) or chromium binary missing.
    return NextResponse.json({
      ok: false,
      error: 'browser_failed',
      detail: e instanceof Error ? e.message : 'unknown',
      hint: 'Confirm Vercel function memory ≥ 1769 MB for /api/qstash/check-liveness.',
    }, { status: 500 })
  }

  // Persist on the jobs table — RLS-bypassing service-role write,
  // gated to (id=jobId AND user_id=userId) so a forged payload can't
  // tamper with someone else's row.
  const { error: updateErr } = await admin
    .from('jobs')
    .update({
      liveness_status: liveness.status,
      liveness_checked_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('user_id', userId)

  if (updateErr) {
    return NextResponse.json({ ok: false, error: 'persist_failed', detail: updateErr.message }, { status: 500 })
  }

  // Audit log (fire-and-forget so a transient audit fail doesn't trigger
  // QStash retry on a real liveness probe success).
  admin.from('audit_events').insert({
    user_id: userId,
    action: 'qstash_check_liveness',
    resource_type: 'jobs',
    resource_id: jobId,
    metadata: {
      url,
      status: liveness.status,
      reason: liveness.reason,
      duration_ms: Date.now() - start,
    },
  }).then(() => {}, () => {})

  return NextResponse.json({
    ok: true,
    jobId,
    status: liveness.status,
    reason: liveness.reason,
    durationMs: Date.now() - start,
  })
}
