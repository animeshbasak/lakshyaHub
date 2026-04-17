'use server'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/types'

interface AddJobToBoardInput {
  title: string
  company: string
  location?: string
  url?: string
  notes?: string
  source?: string
}

export async function addJobToBoard(
  input: AddJobToBoardInput
): Promise<{ success: boolean; job?: Job; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { title, company, location, url, notes, source = 'manual' } = input

  // 1. Insert into jobs
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      session_id: null,
      source,
      title,
      company,
      location: location ?? null,
      description: notes ?? null,
      url: url ?? null,
      salary_range: null,
      fit_score: 0,
      fit_breakdown: null,
      raw_data: null,
      dedup_hash: `manual-${user.id}-${Date.now()}`,
      scraped_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (jobError) return { success: false, error: jobError.message }

  // 2. Insert into applications
  const { error: appError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      job_id: (job as Job).id,
      status: 'saved',
      updated_at: new Date().toISOString(),
    })

  if (appError) return { success: false, error: appError.message }

  return { success: true, job: job as Job }
}
