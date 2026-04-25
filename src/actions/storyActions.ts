'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ARCHETYPES } from '@/lib/careerops/archetypes'

export interface Story {
  id: string
  title: string
  situation: string | null
  task: string | null
  action: string | null
  result: string | null
  reflection: string | null
  tags: string[]
  archetype: string | null
  created_at: string | null
  updated_at: string | null
}

interface ActionResult {
  ok: boolean
  story?: Story
  error?: string
}

const ARCHETYPE_VALUES = new Set<string>([...ARCHETYPES])

function validate(input: Partial<Story>): string | null {
  if (!input.title || input.title.trim().length < 3) return 'Title must be at least 3 characters'
  if (input.title.length > 200) return 'Title too long'
  if (input.archetype && !ARCHETYPE_VALUES.has(input.archetype)) return 'Unknown archetype'
  return null
}

export async function listStories(): Promise<Story[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('story_bank')
    .select('id, title, situation, task, action, result, reflection, tags, archetype, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  return (data ?? []) as Story[]
}

export async function createStory(input: Partial<Story>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const err = validate(input)
  if (err) return { ok: false, error: err }

  const { data, error } = await supabase
    .from('story_bank')
    .insert({
      user_id: user.id,
      title: input.title!.trim(),
      situation: input.situation ?? null,
      task: input.task ?? null,
      action: input.action ?? null,
      result: input.result ?? null,
      reflection: input.reflection ?? null,
      tags: input.tags ?? [],
      archetype: input.archetype ?? null,
    })
    .select()
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? 'Insert failed' }
  revalidatePath('/stories')
  return { ok: true, story: data as Story }
}

export async function updateStory(id: string, input: Partial<Story>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const err = validate(input)
  if (err) return { ok: false, error: err }

  const { data, error } = await supabase
    .from('story_bank')
    .update({
      title: input.title?.trim(),
      situation: input.situation ?? null,
      task: input.task ?? null,
      action: input.action ?? null,
      result: input.result ?? null,
      reflection: input.reflection ?? null,
      tags: input.tags ?? [],
      archetype: input.archetype ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? 'Update failed' }
  revalidatePath('/stories')
  return { ok: true, story: data as Story }
}

export async function deleteStory(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('story_bank')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/stories')
  return { ok: true }
}
