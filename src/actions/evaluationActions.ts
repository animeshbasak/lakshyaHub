'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AnonLevel = 'full_anon' | 'company_only' | 'user_named'

interface ToggleResult {
  ok: boolean
  is_public?: boolean
  shared_at?: string | null
  error?: string
}

/**
 * Flip is_public + anon_level on an evaluation. Owner-scoped via RLS plus
 * explicit user_id filter (defense in depth — see security audit IDOR notes).
 */
export async function setEvaluationPublic(
  id: string,
  isPublic: boolean,
  anonLevel: AnonLevel = 'full_anon'
): Promise<ToggleResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const sharedAt = isPublic ? new Date().toISOString() : null
  const { data, error } = await supabase
    .from('evaluations')
    .update({ is_public: isPublic, anon_level: anonLevel, shared_at: sharedAt })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, is_public, shared_at')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Evaluation not found' }
  }

  revalidatePath(`/eval/${id}`)
  if (isPublic) revalidatePath(`/share/${id}`)

  return { ok: true, is_public: data.is_public as boolean, shared_at: (data.shared_at as string | null) }
}
