import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, regionMatch, FETCH_HEADERS } from '../util'

interface AdzunaJob {
  id?: string
  title?: string
  description?: string
  redirect_url?: string
  company?: { display_name?: string }
  location?: { display_name?: string; area?: string[] }
  salary_min?: number
  salary_max?: number
  salary_is_predicted?: string
  created?: string
  category?: { tag?: string; label?: string }
}

interface AdzunaResponse {
  count?: number
  results?: AdzunaJob[]
}

/**
 * Adzuna — aggregator with broad LinkedIn / Indeed / company-board coverage.
 * Free tier: 1000 calls/day per app_id. Best free option for India listings
 * outside the Naukri sitemap.
 *
 * Region routing:
 *   IN     → /jobs/in/search/1
 *   GLOBAL → /jobs/us/search/1 (largest dataset; covers LinkedIn-sourced)
 *   REMOTE → /jobs/us/search/1 + remote-keyword filter (Adzuna doesn't have
 *            a native remote flag; we filter location text server-side)
 *
 * Activates only when ADZUNA_APP_ID + ADZUNA_APP_KEY are both set in env;
 * isAvailable() returns false otherwise so the aggregator skips silently.
 */
const COUNTRY_FOR_REGION: Record<JobSearchInput['region'], string> = {
  IN: 'in',
  GLOBAL: 'us',
  REMOTE: 'us',
}

export const adzunaAdapter: JobSearchAdapter = {
  name: 'adzuna',
  regions: ['IN', 'GLOBAL', 'REMOTE'],
  timeoutMs: 10_000,

  isAvailable: () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY
    if (!appId || !appKey) return []
    if (!input.query.trim()) return []

    const country = COUNTRY_FOR_REGION[input.region]
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`)
    url.searchParams.set('app_id', appId)
    url.searchParams.set('app_key', appKey)
    url.searchParams.set('results_per_page', String(Math.min(input.limitPerAdapter ?? 30, 50)))
    url.searchParams.set('what', input.query)
    url.searchParams.set('content-type', 'application/json')
    if (input.region === 'REMOTE') {
      // Adzuna doesn't have a `remote=1` flag, but `where=remote` biases
      // results toward remote postings. Combined with our region filter
      // (which checks location text), this is enough to surface remote roles.
      url.searchParams.set('where', 'remote')
    }

    // AbortSignal so a slow Adzuna response actually cancels at the
    // network layer; aggregator's withTimeout just races the promise.
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 9_500)
    let res: Response
    try {
      res = await fetch(url, { headers: FETCH_HEADERS, signal: ac.signal })
    } catch {
      return []   // aborted, network error, etc.
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return []
    const data = (await res.json()) as AdzunaResponse
    const jobs = data.results ?? []

    return jobs
      .filter((j): j is AdzunaJob & { redirect_url: string; title: string } =>
        Boolean(j.redirect_url && j.title)
      )
      .map((j): JobSearchResult => ({
        url: j.redirect_url,
        title: j.title,
        company: j.company?.display_name ?? '',
        location: j.location?.display_name ?? null,
        description: snippet(j.description ?? null, 500),
        postedAt: j.created ?? null,
        source: 'adzuna',
        salary: formatSalary(j),
        tags: j.category?.label ? [j.category.label] : [],
      }))
      .filter(j => regionMatch(j.location, input))
  },
}

function formatSalary(j: AdzunaJob): string | null {
  if (!j.salary_min && !j.salary_max) return null
  const isPredicted = j.salary_is_predicted === '1'
  const min = j.salary_min ? Math.round(j.salary_min).toLocaleString() : null
  const max = j.salary_max ? Math.round(j.salary_max).toLocaleString() : null
  const range = min && max ? `${min} – ${max}` : (min ?? max)
  return isPredicted ? `~${range}` : (range ?? null)
}
