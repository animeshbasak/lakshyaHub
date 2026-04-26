'use server'

import { createClient } from '@/lib/supabase/server'
import {
  rankByCadence,
  type ApplicationWithCadence,
  type ApplicationCadenceSource,
} from '@/lib/careerops/followupCadence'

interface DueListResult {
  ok: boolean
  data?: { dueNow: ApplicationWithCadence[]; later: ApplicationWithCadence[] }
  error?: string
}

/**
 * Returns user's applications sorted by cadence priority. Applications with
 * an actionable flag (overdue/urgent) go in `dueNow`; everything else (ok/cold)
 * goes in `later`. Pure computation — no LLM, no email send. The user clicks
 * through to /board to act.
 */
export async function getDueFollowups(): Promise<DueListResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  // Pull applications + the most recent followup per application in two
  // queries. We can do this client-side since both tables are RLS-bound.
  const [appsRes, followupsRes] = await Promise.all([
    supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        job_id,
        jobs!inner(company, title)
      `)
      .eq('user_id', user.id)
      .in('status', ['applied', 'interview', 'rejected'])
      .order('applied_at', { ascending: false })
      .limit(500),
    supabase
      .from('followups')
      .select('application_id, sent_at')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(500),
  ])

  if (appsRes.error) return { ok: false, error: appsRes.error.message }
  if (followupsRes.error) return { ok: false, error: followupsRes.error.message }

  // Build app → most-recent followup_at map (followups already sorted desc).
  const latestByApp = new Map<string, string>()
  for (const f of followupsRes.data ?? []) {
    if (!f.application_id || !f.sent_at) continue
    if (!latestByApp.has(f.application_id)) {
      latestByApp.set(f.application_id, f.sent_at)
    }
  }

  type RawApp = {
    id: string
    status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
    applied_at: string | null
    job_id: string | null
    jobs: { company: string | null; title: string | null } | { company: string | null; title: string | null }[] | null
  }
  const sources: ApplicationCadenceSource[] = ((appsRes.data ?? []) as RawApp[]).map(a => {
    // Supabase nested-select returns `jobs` as an array OR object depending on FK; normalize.
    const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs
    return {
      id: a.id,
      status: a.status,
      applied_at: a.applied_at,
      company: job?.company ?? null,
      role: job?.title ?? null,
    }
  })

  const ranked = rankByCadence(sources, latestByApp)
  const dueNow = ranked.filter(r => r.flag === 'overdue' || r.flag === 'urgent')
  const later = ranked.filter(r => r.flag === 'ok' || r.flag === 'cold')

  return { ok: true, data: { dueNow, later } }
}
