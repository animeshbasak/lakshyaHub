import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, matchesQuery, tokenize, regionMatch, FETCH_HEADERS } from '../util'

interface RemoteOkJob {
  id?: string
  slug?: string
  url?: string
  position?: string
  company?: string
  location?: string
  description?: string
  date?: string
  tags?: string[]
  salary?: string
  apply_url?: string
}

/**
 * RemoteOK — public JSON, no auth. Returns ~all roles in one ~500KB payload,
 * no server-side search. We tokenize the user query and title-match locally.
 *
 * Their TOS asks for a backlink; we set User-Agent identifying Lakshya so
 * they can see the source if they care.
 */
export const remoteOkAdapter: JobSearchAdapter = {
  name: 'remoteok',
  regions: ['REMOTE', 'GLOBAL', 'IN'],
  timeoutMs: 10_000,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    const res = await fetch('https://remoteok.com/api', { headers: FETCH_HEADERS })
    if (!res.ok) return []
    const data = await res.json() as RemoteOkJob[] | unknown
    if (!Array.isArray(data)) return []

    // First element is a "legal" / metadata sentinel — skip anything without a slug or position.
    const jobs = (data as RemoteOkJob[]).filter(j => j && j.position && (j.url || j.slug))
    const tokens = tokenize(input.query)
    const limit = input.limitPerAdapter ?? 30

    return jobs
      .filter(j => matchesQuery(j.position, tokens))
      .map((j): JobSearchResult => ({
        url: j.url ?? `https://remoteok.com/remote-jobs/${j.slug}`,
        title: j.position!,
        company: j.company ?? '',
        location: j.location || 'Remote',
        description: snippet(j.description, 400),
        postedAt: j.date ?? null,
        source: 'remoteok',
        salary: j.salary || null,
        tags: j.tags ?? [],
      }))
      .filter(j => regionMatch(j.location, input, true))
      .slice(0, limit)
  },
}
