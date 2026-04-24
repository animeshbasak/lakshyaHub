'use server'
import { createClient } from '@/lib/supabase/server'
import { ResumeData } from '@/types'
import { syncResumeProfile } from '@/lib/syncResumeProfile'

export async function clearAllCloudData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const uid = user.id
  const tables = [
    'scrape_sessions',
    'applications',
    'jobs',
    'resumes',
  ] as const

  const counts: Record<string, number> = {}
  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .delete({ count: 'exact' })
      .eq('user_id', uid)
    if (error) throw new Error(`Failed to clear ${t}: ${error.message}`)
    counts[t] = count ?? 0
  }

  const { error: profileErr } = await supabase
    .from('resume_profiles')
    .delete()
    .eq('id', uid)
  if (profileErr) throw new Error(`Failed to clear resume_profiles: ${profileErr.message}`)
  counts['resume_profiles'] = 1

  return { success: true, counts }
}

export async function saveResume(data: ResumeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('resumes')
    .upsert({ id: data.id, user_id: user.id, name: data.name || 'Untitled', data, template: data.template, updated_at: new Date().toISOString() })

  if (error) throw error
  return { success: true }
}

export async function loadResume(id: string): Promise<ResumeData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  // IDOR guard: scope to owner (prevents any authenticated user from reading any resume by UUID)
  const { data } = await supabase
    .from('resumes')
    .select('data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  return data?.data ?? null
}

export async function listResumes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('resumes').select('id, name, template, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false })
  return data ?? []
}

export async function deleteResume(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  // IDOR guard: scope to owner (prevents any authenticated user from deleting any resume by UUID)
  await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
}

export async function saveAndSyncProfile(data: ResumeData) {
  await saveResume(data)
  await syncResumeProfile(data)
  return { success: true }
}
