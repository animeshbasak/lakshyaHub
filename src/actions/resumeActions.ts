'use server'
import { createClient } from '@/lib/supabase/server'
import { ResumeData } from '@/types'
import { syncResumeProfile } from '@/lib/syncResumeProfile'

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
  const { data } = await supabase.from('resumes').select('data').eq('id', id).single()
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
  await supabase.from('resumes').delete().eq('id', id)
}

export async function saveAndSyncProfile(data: ResumeData) {
  await saveResume(data)
  await syncResumeProfile(data)
  return { success: true }
}
