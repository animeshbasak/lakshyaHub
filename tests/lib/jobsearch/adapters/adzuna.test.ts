import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adzunaAdapter } from '@/lib/jobsearch/adapters/adzuna'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
  global.fetch = vi.fn() as unknown as typeof fetch
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.restoreAllMocks()
})

function mockFetchOnce(json: unknown, opts: { ok?: boolean; status?: number } = {}) {
  ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    json: async () => json,
  })
}

const ADZUNA_RESPONSE = {
  count: 2,
  results: [
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      description: '<p>Looking for a Senior Frontend Engineer in Bangalore</p>',
      redirect_url: 'https://adzuna.com/details/1?utm=test',
      company: { display_name: 'Acme Corp' },
      location: { display_name: 'Bangalore, Karnataka', area: ['Karnataka', 'Bangalore'] },
      salary_min: 1500000,
      salary_max: 2500000,
      created: '2026-04-25T10:00:00Z',
      category: { tag: 'it-jobs', label: 'IT Jobs' },
    },
    {
      id: '2',
      title: 'React Developer',
      description: 'Remote-friendly React role',
      redirect_url: 'https://adzuna.com/details/2',
      company: { display_name: 'RemoteCo' },
      location: { display_name: 'Remote' },
      created: '2026-04-26T08:00:00Z',
    },
  ],
}

describe('adzunaAdapter.isAvailable', () => {
  it('returns false when neither env var is set', () => {
    delete process.env.ADZUNA_APP_ID
    delete process.env.ADZUNA_APP_KEY
    expect(adzunaAdapter.isAvailable!()).toBe(false)
  })

  it('returns false when only one env var is set', () => {
    process.env.ADZUNA_APP_ID = 'x'
    delete process.env.ADZUNA_APP_KEY
    expect(adzunaAdapter.isAvailable!()).toBe(false)
  })

  it('returns true when both are set', () => {
    process.env.ADZUNA_APP_ID = 'x'
    process.env.ADZUNA_APP_KEY = 'y'
    expect(adzunaAdapter.isAvailable!()).toBe(true)
  })
})

describe('adzunaAdapter.search', () => {
  beforeEach(() => {
    process.env.ADZUNA_APP_ID = 'test-app-id'
    process.env.ADZUNA_APP_KEY = 'test-app-key'
  })

  it('returns [] when keys are missing (defense-in-depth even if isAvailable bypassed)', async () => {
    delete process.env.ADZUNA_APP_ID
    const r = await adzunaAdapter.search({ query: 'frontend', region: 'IN' })
    expect(r).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns [] when query is empty', async () => {
    const r = await adzunaAdapter.search({ query: '', region: 'IN' })
    expect(r).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('routes IN region to /jobs/in/ endpoint', async () => {
    mockFetchOnce(ADZUNA_RESPONSE)
    await adzunaAdapter.search({ query: 'frontend', region: 'IN' })
    const callArgs = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const url = String(callArgs[0])
    expect(url).toContain('/jobs/in/search/1')
  })

  it('routes GLOBAL region to /jobs/us/ endpoint (largest dataset)', async () => {
    mockFetchOnce(ADZUNA_RESPONSE)
    await adzunaAdapter.search({ query: 'frontend', region: 'GLOBAL' })
    const url = String((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(url).toContain('/jobs/us/search/1')
  })

  it('passes app_id, app_key, and search query as URL params', async () => {
    mockFetchOnce(ADZUNA_RESPONSE)
    await adzunaAdapter.search({ query: 'react engineer', region: 'IN' })
    const url = String((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(url).toContain('app_id=test-app-id')
    expect(url).toContain('app_key=test-app-key')
    expect(url).toContain('what=react+engineer')
  })

  it('returns [] gracefully on a non-2xx response (e.g. 401 invalid key)', async () => {
    mockFetchOnce(null, { ok: false, status: 401 })
    const r = await adzunaAdapter.search({ query: 'frontend', region: 'IN' })
    expect(r).toEqual([])
  })

  it('parses Adzuna JSON into JobSearchResult shape', async () => {
    mockFetchOnce(ADZUNA_RESPONSE)
    const r = await adzunaAdapter.search({ query: 'frontend', region: 'IN' })
    expect(r.length).toBeGreaterThan(0)
    const first = r[0]
    expect(first).toMatchObject({
      title: expect.any(String),
      company: expect.any(String),
      url: expect.stringContaining('https://'),
      source: 'adzuna',
    })
  })

  it('strips HTML from descriptions', async () => {
    mockFetchOnce(ADZUNA_RESPONSE)
    const r = await adzunaAdapter.search({ query: 'frontend', region: 'IN' })
    const withDesc = r.find(j => j.description && j.description.includes('Senior Frontend'))
    expect(withDesc?.description).not.toMatch(/<\/?p>/)
  })

  it('handles missing optional fields without throwing', async () => {
    mockFetchOnce({ count: 1, results: [{ title: 'Bare', redirect_url: 'https://x.com/1' }] })
    const r = await adzunaAdapter.search({ query: 'bare', region: 'GLOBAL' })
    expect(r.length).toBe(1)
    expect(r[0].title).toBe('Bare')
  })

  it('drops jobs without a redirect_url or title (broken Adzuna payload)', async () => {
    mockFetchOnce({ count: 2, results: [
      { title: 'no-url' },
      { redirect_url: 'https://x.com/no-title' },
      { title: 'good', redirect_url: 'https://x.com/good' },
    ] })
    const r = await adzunaAdapter.search({ query: 'good', region: 'GLOBAL' })
    const titles = r.map(j => j.title)
    expect(titles).toContain('good')
    expect(titles).not.toContain('no-url')
  })
})
