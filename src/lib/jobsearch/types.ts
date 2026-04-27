/**
 * Unified job-search adapter pattern.
 *
 * Every source (Remotive, RemoteOK, Naukri, ATS portals, etc.) implements
 * `JobSearchAdapter`. The aggregator fans out a single user query to all
 * configured adapters in parallel, normalizes results to `JobSearchResult`,
 * dedupes by URL, and ranks.
 *
 * Adapters are intentionally simple — no cleverness, no caching. Caching
 * lives one level up in the route handler so we can rotate between
 * "fresh" and "cached" without changing the source code per adapter.
 */

export type JobRegion = 'IN' | 'GLOBAL' | 'REMOTE'

export interface JobSearchInput {
  /** User-typed search query — title keywords, comma-OK. */
  query: string
  /** Region filter. 'REMOTE' overrides location to anywhere remote. */
  region: JobRegion
  /** Cap per-adapter results (defense vs. flood). */
  limitPerAdapter?: number
}

export interface JobSearchResult {
  /** Stable URL — also used as dedupe key. */
  url: string
  title: string
  company: string
  location: string | null
  /** Plain-text snippet, ≤500 chars. Strip HTML at adapter boundary. */
  description: string | null
  /** ISO timestamp of when the posting was published, if known. */
  postedAt: string | null
  /** Adapter name — used for source badges in UI. */
  source: string
  /** Salary range if exposed by source. Free-form (every site formats differently). */
  salary: string | null
  /** Tags/categories from source (stack, role family, remote-flag). */
  tags: string[]
}

export interface JobSearchAdapter {
  name: string
  /** Indication of which regions this adapter is useful for. */
  regions: JobRegion[]
  /** Hard timeout in ms — aggregator will Promise.race against this. */
  timeoutMs: number
  /** Optional probe — when false, aggregator skips silently (e.g. missing API key). */
  isAvailable?: () => boolean
  search: (input: JobSearchInput) => Promise<JobSearchResult[]>
}

export interface AdapterRunResult {
  adapter: string
  jobs: JobSearchResult[]
  durationMs: number
  error?: string
}
