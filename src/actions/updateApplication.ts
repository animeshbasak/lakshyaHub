// src/actions/updateApplication.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { ApplicationStatus } from '@/types'

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('user_id', user.id)  // RLS + explicit check

  return error ? { error: error.message } : { success: true }
}

export async function updateApplicationNotes(applicationId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('applications')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  return error ? { error: error.message } : { success: true }
}

export async function saveJobToBoard(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('applications')
    .upsert({
      user_id: user.id,
      job_id: jobId,
      status: 'saved',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,job_id' })

  return error ? { error: error.message } : { success: true }
}
