import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { fetchPortalJobs } from '@/lib/careerops/scanAtsApi'
import { PORTAL_SEEDS } from '@/data/portal-seeds'
import { matchesQuery, tokenize, regionMatch } from '../util'

/**
 * ATS portals — Greenhouse / Ashby / Lever public job-board APIs against
 * our curated seed list. This is the same engine `/api/scan/ats` uses; it
 * just lives behind the unified search adapter pattern so users get one
 * search box instead of two scattered cards.
 *
 * Seed list (35-40 portals) is deliberately curated; expanding it gives
 * better results but takes manual verification (see scripts/smoke-ats-scan.mjs).
 *
 * Region behavior:
 *   - input.region='IN'      → only seeds tagged country='IN'
 *   - input.region='GLOBAL'  → all seeds
 *   - input.region='REMOTE'  → all seeds, but result-side filter
 *                              for "remote" location keywords (since job
 *                              location lives in the JD, not the seed)
 */
export const atsPortalsAdapter: JobSearchAdapter = {
  name: 'ats-portals',
  regions: ['IN', 'GLOBAL', 'REMOTE'],
  timeoutMs: 15_000,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    const seeds = input.region === 'IN'
      ? PORTAL_SEEDS.filter(s => s.country === 'IN')
      : PORTAL_SEEDS

    const tokens = tokenize(input.query)
    const limit = input.limitPerAdapter ?? 50

    // Fan out — each fetch already has its own internal 10s AbortController.
    const fetched = await Promise.allSettled(
      seeds.map(s => fetchPortalJobs({ portal: s.portal, slug: s.slug, company: s.company }))
    )

    const out: JobSearchResult[] = []
    for (let i = 0; i < fetched.length; i++) {
      const res = fetched[i]
      if (res.status !== 'fulfilled') continue
      const seed = seeds[i]
      for (const j of res.value) {
        if (!matchesQuery(j.title, tokens)) continue
        const result: JobSearchResult = {
          url: j.url,
          title: j.title,
          company: j.company || seed.company,
          location: j.location || null,
          description: null,    // ATS APIs don't include descriptions in the list call
          postedAt: null,
          source: 'ats-portals',
          salary: null,
          tags: [seed.hint, j.portal].filter((x): x is NonNullable<typeof x> => Boolean(x)).map(String),
        }
        if (regionMatch(result.location, input)) out.push(result)
        if (out.length >= limit) return out
      }
    }
    return out
  },
}
