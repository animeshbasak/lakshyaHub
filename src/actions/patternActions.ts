'use server'

import { createClient } from '@/lib/supabase/server'
import {
  analyzePatterns,
  type PatternAnalysis,
  type EvaluationRow,
  type ApplicationRow,
} from '@/lib/careerops/patternAnalysis'

interface Result {
  ok: boolean
  data?: PatternAnalysis
  error?: string
}

/**
 * Pull the current user's evaluations + applications (RLS-bound) and run
 * pattern analysis. No LLM calls — pure SQL aggregation + JS shaping.
 */
export async function getPatternAnalysis(): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  const [evalsRes, appsRes] = await Promise.all([
    supabase
      .from('evaluations')
      .select('id, archetype, score, legitimacy_tier, company, role, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('applications')
      .select('id, status, applied_at, job_id')
      .eq('user_id', user.id)
      .limit(500),
  ])

  if (evalsRes.error) return { ok: false, error: evalsRes.error.message }
  if (appsRes.error) return { ok: false, error: appsRes.error.message }

  const data = analyzePatterns(
    (evalsRes.data ?? []) as EvaluationRow[],
    (appsRes.data ?? []) as ApplicationRow[]
  )

  return { ok: true, data }
}
