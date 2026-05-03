import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { matchesQuery, snippet, tokenize, FETCH_HEADERS } from '../util'

interface YcCompany {
  id?: number | string
  name?: string
  slug?: string
  one_liner?: string
  long_description?: string
  status?: string             // 'Active' | 'Acquired' | 'Public'
  team_size?: number
  jobs?: YcJob[]
}

interface YcJob {
  id?: number | string
  title?: string
  type?: string               // 'Full-time' | 'Contractor' | 'Intern'
  remote?: 'yes' | 'no' | string
  locations?: string[]
  url?: string
  apply_url?: string
  description?: string
  posted_at?: string
  // Salary fields can vary
  salary_min?: number
  salary_max?: number
  salary_range?: string
  equity_min?: number
  equity_max?: number
}

/**
 * YC Work-at-a-Startup — every YC-funded company that's actively hiring.
 *
 * Why this matters for the lakshya operator persona: many YC-backed startups
 * hire senior IC engineers remotely (incl. India), with comp competitive to
 * top product cos. Strong signal-to-noise — every posting comes from a
 * curated list (YC-funded), so no IT-services / body-shop spam.
 *
 * Endpoint: best-effort — workatastartup.com is auth-gated for the full
 * candidate experience, but the company directory is publicly browseable
 * and the underlying JSON used by the SPA is reachable. If the schema
 * shifts, the parser fails gracefully (returns []).
 *
 * Region: 'GLOBAL' + 'REMOTE'. Filtered post-fetch by:
 *   - REMOTE → keep only postings with remote='yes'
 *   - GLOBAL → keep all, dedupe later
 *   - IN → would need location-text filter (locations[] array contains
 *     'Bangalore, India' etc.); deferred until we have a curated list.
 *
 * Env: gated behind YC_WAAS_ENABLED=true so it ships dormant until the
 * endpoint is smoke-tested. Flip on after a manual probe.
 */
export const ycWaasAdapter: JobSearchAdapter = {
  name: 'yc-waas',
  regions: ['GLOBAL', 'REMOTE'],
  timeoutMs: 12_000,

  isAvailable: () => process.env.YC_WAAS_ENABLED === 'true',

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    if (!input.query.trim()) return []

    const url = new URL('https://www.workatastartup.com/companies.json')
    // No native query param on the YC companies feed; we filter results
    // post-fetch by query tokens against title + company name.
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 11_000)
    let res: Response
    try {
      res = await fetch(url, { headers: FETCH_HEADERS, signal: ac.signal })
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return []

    let companies: YcCompany[]
    try {
      const data = (await res.json()) as { companies?: YcCompany[] } | YcCompany[]
      companies = Array.isArray(data) ? data : (data?.companies ?? [])
    } catch {
      return []
    }

    const tokens = tokenize(input.query)
    const limit = Math.min(input.limitPerAdapter ?? 30, 80)
    const results: JobSearchResult[] = []

    for (const co of companies) {
      if (results.length >= limit) break
      if (!co.name || !co.jobs) continue
      for (const job of co.jobs) {
        if (results.length >= limit) break
        if (!job.title) continue

        // Region filter: REMOTE rejects non-remote postings explicitly
        if (input.region === 'REMOTE' && job.remote !== 'yes') continue

        // Title-match — at least one query token must hit the title or
        // company name. Without this, the YC feed dumps 5k unrelated jobs.
        const text = `${job.title} ${co.name}`
        if (tokens.length > 0 && !matchesQuery(text, tokens)) continue

        const apply =
          job.apply_url ??
          job.url ??
          (co.slug && job.id
            ? `https://www.workatastartup.com/jobs/${job.id}`
            : `https://www.workatastartup.com/companies/${co.slug ?? co.id}`)

        const salary =
          job.salary_range ??
          (job.salary_min && job.salary_max
            ? `$${job.salary_min}-${job.salary_max}`
            : null)

        results.push({
          url: apply,
          title: job.title,
          company: co.name,
          location: (job.locations ?? []).join(', ') || (job.remote === 'yes' ? 'Remote' : null),
          description: snippet(job.description ?? co.one_liner),
          postedAt: job.posted_at ?? null,
          source: 'yc-waas',
          salary,
          tags: [
            'yc',
            job.remote === 'yes' ? 'remote' : null,
            job.type?.toLowerCase() ?? null,
          ].filter((t): t is string => Boolean(t)),
        })
      }
    }
    return results
  },
}
