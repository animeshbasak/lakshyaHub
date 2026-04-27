import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock all adapters BEFORE importing the aggregator. Each adapter exports
// a singleton with a `search` method we replace per-test.
vi.mock('@/lib/jobsearch/adapters/remotive',       () => ({ remotiveAdapter:        mkAdapter('remotive', ['REMOTE', 'GLOBAL', 'IN']) }))
vi.mock('@/lib/jobsearch/adapters/remoteok',       () => ({ remoteOkAdapter:        mkAdapter('remoteok', ['REMOTE', 'GLOBAL', 'IN']) }))
vi.mock('@/lib/jobsearch/adapters/hn-algolia',     () => ({ hnAlgoliaAdapter:       mkAdapter('hn-whos-hiring', ['REMOTE', 'GLOBAL', 'IN']) }))
vi.mock('@/lib/jobsearch/adapters/weworkremotely', () => ({ weworkremotelyAdapter:  mkAdapter('weworkremotely', ['REMOTE', 'GLOBAL', 'IN']) }))
vi.mock('@/lib/jobsearch/adapters/naukri-sitemap', () => ({ naukriSitemapAdapter:   mkAdapter('naukri', ['IN']) }))
vi.mock('@/lib/jobsearch/adapters/ats-portals',    () => ({ atsPortalsAdapter:      mkAdapter('ats-portals', ['IN', 'GLOBAL', 'REMOTE']) }))

import { aggregate } from '@/lib/jobsearch/aggregator'
import { remotiveAdapter } from '@/lib/jobsearch/adapters/remotive'
import { remoteOkAdapter } from '@/lib/jobsearch/adapters/remoteok'
import { hnAlgoliaAdapter } from '@/lib/jobsearch/adapters/hn-algolia'
import { weworkremotelyAdapter } from '@/lib/jobsearch/adapters/weworkremotely'
import { naukriSitemapAdapter } from '@/lib/jobsearch/adapters/naukri-sitemap'
import { atsPortalsAdapter } from '@/lib/jobsearch/adapters/ats-portals'

import type { JobSearchAdapter, JobSearchResult, JobRegion } from '@/lib/jobsearch/types'

afterEach(() => { vi.clearAllMocks() })

function mkAdapter(name: string, regions: JobRegion[]): JobSearchAdapter {
  return {
    name,
    regions,
    timeoutMs: 1000,
    search: vi.fn(async () => []) as JobSearchAdapter['search'],
  }
}

function jobResult(over: Partial<JobSearchResult>): JobSearchResult {
  return {
    url: over.url ?? `https://example.com/${Math.random()}`,
    title: over.title ?? 'Engineer',
    company: over.company ?? 'Acme',
    location: over.location ?? 'Remote',
    description: over.description ?? null,
    postedAt: over.postedAt ?? null,
    source: over.source ?? 'remotive',
    salary: over.salary ?? null,
    tags: over.tags ?? [],
  }
}

describe('aggregate', () => {
  it('runs only adapters whose regions include the query region', async () => {
    const r = await aggregate({ query: 'engineer', region: 'IN' })
    // naukri (IN) + remotive/remoteok/hn/wwr/ats (all support IN) = 6
    const names = r.byAdapter.map(b => b.adapter)
    expect(names).toContain('naukri')
    expect(names).toContain('ats-portals')
    expect(names.length).toBe(6)
  })

  it('skips adapters that do NOT include the region', async () => {
    const r = await aggregate({ query: 'engineer', region: 'GLOBAL' })
    const names = r.byAdapter.map(b => b.adapter)
    // naukri only supports IN, so it must NOT appear in GLOBAL
    expect(names).not.toContain('naukri')
  })

  it('dedupes results by canonical URL across adapters', async () => {
    vi.mocked(remotiveAdapter.search).mockResolvedValueOnce([
      jobResult({ url: 'https://example.com/jobs/abc?utm=remotive' }),
    ])
    vi.mocked(remoteOkAdapter.search).mockResolvedValueOnce([
      jobResult({ url: 'https://example.com/jobs/abc' }),  // same path, no query
    ])

    const r = await aggregate({ query: 'engineer', region: 'GLOBAL' })
    expect(r.totalRaw).toBe(2)
    expect(r.totalDeduped).toBe(1)
  })

  it('absorbs adapter failures without poisoning the batch', async () => {
    vi.mocked(remotiveAdapter.search).mockRejectedValueOnce(new Error('upstream 500'))
    vi.mocked(remoteOkAdapter.search).mockResolvedValueOnce([
      jobResult({ url: 'https://example.com/ok' }),
    ])

    const r = await aggregate({ query: 'engineer', region: 'GLOBAL' })
    expect(r.totalDeduped).toBe(1)
    const failed = r.byAdapter.find(a => a.adapter === 'remotive')
    expect(failed?.jobs).toEqual([])
  })

  it('orders by recency (newest first)', async () => {
    vi.mocked(remotiveAdapter.search).mockResolvedValueOnce([
      jobResult({ url: 'https://a.example/old',    postedAt: '2026-01-01T00:00:00Z' }),
      jobResult({ url: 'https://a.example/newest', postedAt: '2026-04-25T00:00:00Z' }),
      jobResult({ url: 'https://a.example/mid',    postedAt: '2026-03-15T00:00:00Z' }),
    ])

    const r = await aggregate({ query: 'engineer', region: 'GLOBAL' })
    expect(r.jobs[0].url).toBe('https://a.example/newest')
    expect(r.jobs.at(-1)?.url).toBe('https://a.example/old')
  })

  it('reports per-adapter timing + counts in summary', async () => {
    vi.mocked(remotiveAdapter.search).mockResolvedValueOnce([jobResult({})])
    vi.mocked(remoteOkAdapter.search).mockResolvedValueOnce([])
    const r = await aggregate({ query: 'engineer', region: 'GLOBAL' })
    const remotive = r.byAdapter.find(a => a.adapter === 'remotive')
    expect(remotive?.jobs.length).toBe(1)
    expect(remotive?.durationMs).toBeGreaterThanOrEqual(0)
  })
})
