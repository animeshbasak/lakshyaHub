import type {
  JobSearchAdapter,
  JobSearchInput,
  JobSearchResult,
  AdapterRunResult,
} from './types'
import { remotiveAdapter } from './adapters/remotive'
import { remoteOkAdapter } from './adapters/remoteok'
import { hnAlgoliaAdapter } from './adapters/hn-algolia'
import { weworkremotelyAdapter } from './adapters/weworkremotely'
import { naukriSitemapAdapter } from './adapters/naukri-sitemap'
import { atsPortalsAdapter } from './adapters/ats-portals'
import { adzunaAdapter } from './adapters/adzuna'
import { instahyreAdapter } from './adapters/instahyre'
import { ycWaasAdapter } from './adapters/yc-waas'
import { withTimeout, rankByRecency } from './util'

const ADAPTERS: JobSearchAdapter[] = [
  remotiveAdapter,
  remoteOkAdapter,
  hnAlgoliaAdapter,
  weworkremotelyAdapter,
  naukriSitemapAdapter,
  atsPortalsAdapter,
  // Activates only when ADZUNA_APP_ID + ADZUNA_APP_KEY are set; otherwise
  // the aggregator skips it via isAvailable().
  adzunaAdapter,
  // India-focused product-co board (Razorpay/CRED/Phonepe/etc.). Gated
  // behind INSTAHYRE_ENABLED=true while we verify the JSON endpoint
  // shape against production traffic.
  instahyreAdapter,
  // YC Work-at-a-Startup — every YC-funded company hiring. GLOBAL +
  // REMOTE regions. Gated behind YC_WAAS_ENABLED=true pending smoke test.
  ycWaasAdapter,
]

export interface AggregateOutput {
  jobs: JobSearchResult[]
  byAdapter: AdapterRunResult[]
  totalRaw: number
  totalDeduped: number
  durationMs: number
}

/**
 * Run every relevant adapter in parallel, dedupe by URL, rank by recency.
 * Each adapter has its own internal timeout; we cap the whole call at
 * (max-adapter-timeout + 2s) as a safety net.
 */
export async function aggregate(input: JobSearchInput): Promise<AggregateOutput> {
  const start = Date.now()
  const relevant = ADAPTERS.filter(a => a.regions.includes(input.region) && (a.isAvailable?.() ?? true))

  const runs: Promise<AdapterRunResult>[] = relevant.map(async (a) => {
    const t0 = Date.now()
    const { value, timedOut } = await withTimeout(a.search(input), a.timeoutMs, [])
    return {
      adapter: a.name,
      jobs: value,
      durationMs: Date.now() - t0,
      error: timedOut ? `timeout after ${a.timeoutMs}ms` : undefined,
    }
  })

  const byAdapter = await Promise.all(runs)
  const allJobs = byAdapter.flatMap(r => r.jobs)
  const deduped = dedupeByUrl(allJobs)
  const ranked = rankByRecency(deduped)

  return {
    jobs: ranked,
    byAdapter,
    totalRaw: allJobs.length,
    totalDeduped: ranked.length,
    durationMs: Date.now() - start,
  }
}

/** Dedupe by URL — keep the first occurrence (preserves source order across adapters). */
function dedupeByUrl(jobs: JobSearchResult[]): JobSearchResult[] {
  const seen = new Set<string>()
  const out: JobSearchResult[] = []
  for (const j of jobs) {
    const key = canonicalize(j.url)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(j)
  }
  return out
}

/** Strip query string + trailing slash so the same job posted on remoteok.com/api and remoteok.com both match. */
function canonicalize(url: string): string {
  try {
    const u = new URL(url)
    u.search = ''
    u.hash = ''
    let path = u.pathname.replace(/\/$/, '')
    return `${u.host}${path}`
  } catch {
    return url
  }
}
