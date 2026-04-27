import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, regionMatch, FETCH_HEADERS } from '../util'

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  category: string
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
  tags?: string[]
}

/**
 * Remotive — public, no-auth API. Always remote, global. Works as the
 * "remote" workhorse adapter. Search-param `?search=` is a fuzzy server-side
 * filter; we still re-filter client-side for region/keyword consistency.
 *
 * Free tier: no documented hard limits, but informally cap at ~60 req/min.
 */
export const remotiveAdapter: JobSearchAdapter = {
  name: 'remotive',
  regions: ['REMOTE', 'GLOBAL', 'IN'],
  timeoutMs: 8_000,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    const url = new URL('https://remotive.com/api/remote-jobs')
    if (input.query) url.searchParams.set('search', input.query)
    url.searchParams.set('limit', String(input.limitPerAdapter ?? 50))

    const res = await fetch(url, { headers: FETCH_HEADERS })
    if (!res.ok) return []
    const json = await res.json() as { jobs?: RemotiveJob[] }
    const jobs = json.jobs ?? []

    return jobs
      .map((j): JobSearchResult => ({
        url: j.url,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || 'Remote',
        description: snippet(j.description, 400),
        postedAt: j.publication_date || null,
        source: 'remotive',
        salary: j.salary || null,
        tags: [j.category, j.job_type, ...(j.tags ?? [])].filter(Boolean),
      }))
      .filter(j => regionMatch(j.location, input, true))
  },
}
