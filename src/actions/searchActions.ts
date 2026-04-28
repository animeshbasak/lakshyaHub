'use server'

import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SearchResultInput {
  url: string
  title: string
  company: string | null
  location: string | null
  description: string | null
  source: string
  salary?: string | null
}

interface SaveResult {
  ok: boolean
  jobId?: string
  applicationId?: string
  alreadySaved?: boolean
  error?: string
}

/**
 * Save a unified-search result into the user's jobs + applications.
 *
 * Idempotent on (user_id, dedup_hash) — re-saving the same URL just returns
 * the existing jobId so the UI can update its "Saved" badge.
 *
 * Side-effects:
 *   - inserts/upserts into `jobs` (status: scraped via search)
 *   - inserts into `applications` with status='saved' (the entry point of
 *     the user's pipeline) — only if no existing application for this job
 *   - revalidates /board so the new card appears immediately
 */
export async function saveSearchResult(input: SearchResultInput): Promise<SaveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  if (!input.url || !input.title) {
    return { ok: false, error: 'invalid_input' }
  }

  const dedupHash = hashFor(user.id, input.url)

  // Upsert job by (user_id, dedup_hash). select() returns the row regardless.
  const { data: jobRow, error: jobErr } = await supabase
    .from('jobs')
    .upsert({
      user_id: user.id,
      source: input.source,
      title: input.title,
      company: input.company ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
      url: input.url,
      salary_range: input.salary ?? null,
      dedup_hash: dedupHash,
    }, { onConflict: 'user_id,dedup_hash' })
    .select('id')
    .single()

  if (jobErr || !jobRow) {
    return { ok: false, error: jobErr?.message ?? 'job_upsert_failed' }
  }

  // Check for an existing application — if present, signal alreadySaved.
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', jobRow.id)
    .maybeSingle()

  if (existing) {
    return { ok: true, jobId: jobRow.id, applicationId: existing.id, alreadySaved: true }
  }

  const { data: appRow, error: appErr } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      job_id: jobRow.id,
      status: 'saved',
    })
    .select('id')
    .single()

  if (appErr || !appRow) {
    return { ok: false, error: appErr?.message ?? 'application_insert_failed' }
  }

  revalidatePath('/board')
  return { ok: true, jobId: jobRow.id, applicationId: appRow.id, alreadySaved: false }
}

/**
 * Canonicalize URL before hashing so the same posting from different
 * referral paths (?utm_source=remotive, ?ref=hn, …) and trailing slashes
 * collapse to one dedup key. Mirrors the canonicalize() helper in
 * src/lib/jobsearch/aggregator.ts so save+search-dedupe stay in sync.
 */
function canonicalize(url: string): string {
  try {
    const u = new URL(url)
    u.search = ''
    u.hash = ''
    return `${u.host}${u.pathname.replace(/\/$/, '')}`
  } catch {
    return url
  }
}

function hashFor(userId: string, url: string): string {
  return createHash('sha256').update(`${userId}|${canonicalize(url)}`).digest('hex').slice(0, 32)
}
