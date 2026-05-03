import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, FETCH_HEADERS } from '../util'

interface InstahyreJob {
  id?: number | string
  title?: string
  company?: { name?: string; logo?: string; size?: string }
  location?: string
  city?: string
  experience_min?: number
  experience_max?: number
  job_description?: string
  description?: string
  url?: string
  apply_url?: string
  posted_on?: string
  created?: string
  skills?: string[] | { name: string }[]
  function_area?: string
  ctc_min?: number
  ctc_max?: number
}

interface InstahyreResponse {
  results?: InstahyreJob[]
  objects?: InstahyreJob[]   // some Instahyre responses use `objects` instead of `results`
  count?: number
}

/**
 * Instahyre — India-focused product-co engineering board.
 *
 * Why this matters for the lakshya operator persona: Instahyre is where
 * Indian product cos like Razorpay, CRED, Phonepe, Zerodha post their
 * IC engineering roles directly (vs Naukri which is mass-market). High
 * signal-to-noise for the senior-IC + product-co target.
 *
 * Endpoint: best-effort — the public board (instahyre.com/jobs) is an SPA
 * that hits an internal JSON API. The path can shift; if Instahyre ever
 * changes the response shape, the parser falls back to {results: []} via
 * defensive null-coalesce on every field. If the path 404s, the adapter
 * returns [] cleanly.
 *
 * Region: only registers for 'IN' since Instahyre is India-focused.
 *
 * Env: gated behind INSTAHYRE_ENABLED=true so the adapter ships dormant
 * until verified in production. Flip it on after one manual smoke test.
 */
export const instahyreAdapter: JobSearchAdapter = {
  name: 'instahyre',
  regions: ['IN'],
  timeoutMs: 10_000,

  isAvailable: () => process.env.INSTAHYRE_ENABLED === 'true',

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    if (!input.query.trim()) return []

    // Public job-search endpoint. Params shaped to match Instahyre's
    // documented filter set; unknown params are ignored server-side.
    const url = new URL('https://www.instahyre.com/api/v1/job_search/')
    url.searchParams.set('q', input.query)
    url.searchParams.set('limit', String(Math.min(input.limitPerAdapter ?? 30, 50)))
    // company_size filter biases away from small body shops toward the
    // 50-10000 employee band where senior-IC roles concentrate.
    url.searchParams.set(
      'company_size',
      '51-200,201-500,501-1000,1001-5000,5001-10000',
    )

    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 9_500)
    let res: Response
    try {
      res = await fetch(url, { headers: FETCH_HEADERS, signal: ac.signal })
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return []

    let data: InstahyreResponse
    try {
      data = (await res.json()) as InstahyreResponse
    } catch {
      return []
    }

    const jobs = data.results ?? data.objects ?? []
    return jobs
      .filter((j): j is InstahyreJob & { title: string } => Boolean(j.title))
      .map((j): JobSearchResult => {
        // Apply URL preference: explicit apply_url > url > deeplink
        const apply =
          j.apply_url ?? j.url ?? `https://www.instahyre.com/jobs/${j.id ?? ''}`
        const skills = Array.isArray(j.skills)
          ? j.skills
              .map((s) => (typeof s === 'string' ? s : s?.name))
              .filter((s): s is string => Boolean(s))
          : []
        const salary =
          j.ctc_min && j.ctc_max
            ? `₹${j.ctc_min}-${j.ctc_max} LPA`
            : j.ctc_min
              ? `₹${j.ctc_min}+ LPA`
              : null
        return {
          url: apply,
          title: j.title,
          company: j.company?.name ?? 'Unknown',
          location: j.location ?? j.city ?? null,
          description: snippet(j.job_description ?? j.description),
          postedAt: j.posted_on ?? j.created ?? null,
          source: 'instahyre',
          salary,
          tags: skills.slice(0, 8),
        }
      })
  },
}
