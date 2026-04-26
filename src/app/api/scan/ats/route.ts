export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { fetchPortalJobs } from '@/lib/careerops/scanAtsApi'
import { PORTAL_SEEDS, type PortalSeed } from '@/data/portal-seeds'

const Body = z.object({
  // optional title-keyword filter; defaults to user's resume_profile.target_titles
  titles: z.array(z.string().min(2).max(80)).max(40).optional(),
  // optional country filter; default = both IN + GLOBAL
  country: z.enum(['IN', 'GLOBAL', 'BOTH']).optional().default('BOTH'),
  // optional override of the seed list (operator/test usage)
  portals: z
    .array(z.object({
      slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/i),
      portal: z.enum(['greenhouse', 'ashby', 'lever']),
      company: z.string().min(1).max(80),
    }))
    .max(60)
    .optional(),
})

const NEGATIVE_KEYWORDS = ['intern', 'internship', 'recruiter', 'sales development representative', 'sdr ', 'hr ', 'human resources']

function matchesTitleFilter(title: string, positives: string[]): boolean {
  const t = title.toLowerCase()
  if (NEGATIVE_KEYWORDS.some(n => t.includes(n))) return false
  if (positives.length === 0) return true   // empty filter ⇒ pass everything (after negative gate)
  return positives.some(p => t.includes(p.toLowerCase()))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { titles: titlesIn, country, portals: portalsIn } = parsed.data

  // Resolve title filter — caller param wins, else fall back to resume_profile.
  let titles = titlesIn ?? []
  if (!titlesIn || titlesIn.length === 0) {
    const { data: prof } = await supabase
      .from('resume_profiles')
      .select('target_titles')
      .eq('id', user.id)
      .maybeSingle()
    titles = (prof?.target_titles as string[] | null) ?? []
  }

  // Resolve seed list — caller-supplied overrides the curated set.
  const seeds: PortalSeed[] = portalsIn
    ? portalsIn.map(p => ({ ...p, country: 'GLOBAL', hint: undefined }))
    : country === 'BOTH'
      ? PORTAL_SEEDS
      : PORTAL_SEEDS.filter(s => s.country === country)

  const start = Date.now()

  // Fetch all portals in parallel — each call has its own 10s AbortController.
  const fetched = await Promise.allSettled(
    seeds.map(s => fetchPortalJobs({ portal: s.portal, slug: s.slug, company: s.company }))
  )

  // Flatten + tag each job with its source company (in case the portal payload
  // doesn't include it).
  type ScanJob = Awaited<ReturnType<typeof fetchPortalJobs>>[number]
  const allJobs: ScanJob[] = fetched.flatMap((r, i) =>
    r.status === 'fulfilled' ? r.value.map(j => ({ ...j, company: j.company || seeds[i].company })) : []
  )
  const errors = fetched
    .map((r, i) => r.status === 'rejected' ? { portal: seeds[i].slug, error: String(r.reason) } : null)
    .filter(Boolean)

  // Apply title filter
  const filtered = allJobs.filter(j => matchesTitleFilter(j.title, titles))

  // Dedupe against existing scan_history for this user
  const existing = await supabase
    .from('scan_history')
    .select('url')
    .eq('user_id', user.id)
    .in('url', filtered.map(j => j.url))
  const seen = new Set((existing.data ?? []).map(r => r.url as string))
  const fresh = filtered.filter(j => !seen.has(j.url))

  // Insert into scan_history (PRIMARY append-only intent log)
  if (fresh.length > 0) {
    await supabase.from('scan_history').insert(
      fresh.map(j => ({
        user_id: user.id,
        url: j.url,
        portal: j.portal,
        title: j.title,
        company: j.company,
        status: 'new',
      }))
    )
  }

  // Mirror into jobs table so /discover + /board can pick them up
  if (fresh.length > 0) {
    await supabase.from('jobs').insert(
      fresh.map(j => ({
        user_id: user.id,
        source: j.portal,
        title: j.title,
        company: j.company,
        location: j.location || null,
        url: j.url,
      }))
    ).select('id')
  }

  // Audit-log the run
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createSb } = await import('@supabase/supabase-js')
    const admin = createSb(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.from('audit_events').insert({
      user_id: user.id,
      action: 'ats_scan_run',
      resource_type: 'scan_history',
      metadata: {
        portals_attempted: seeds.length,
        jobs_returned: allJobs.length,
        jobs_after_filter: filtered.length,
        jobs_inserted: fresh.length,
        errors_count: errors.length,
        duration_ms: Date.now() - start,
      },
    })
  }

  return NextResponse.json({
    ok: true,
    summary: {
      portalsAttempted: seeds.length,
      jobsReturned: allJobs.length,
      jobsAfterTitleFilter: filtered.length,
      newJobs: fresh.length,
      errors: errors.length,
      durationMs: Date.now() - start,
    },
    jobs: fresh.map(j => ({ title: j.title, company: j.company, url: j.url, portal: j.portal })),
  })
}
