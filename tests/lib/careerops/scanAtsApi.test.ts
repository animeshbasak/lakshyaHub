import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPortalJobs } from '@/lib/careerops/scanAtsApi'

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch
})

describe('scanAtsApi.fetchPortalJobs', () => {
  it('parses Greenhouse response', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [
          { title: 'Senior ML Engineer', absolute_url: 'https://job-boards.greenhouse.io/anthropic/jobs/123', location: { name: 'San Francisco' } },
        ],
      }),
    })
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'anthropic', company: 'Anthropic' })
    expect(jobs).toHaveLength(1)
    expect(jobs[0]).toMatchObject({
      title: 'Senior ML Engineer',
      company: 'Anthropic',
      location: 'San Francisco',
      portal: 'greenhouse-api',
    })
  })

  it('parses Ashby response', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [{ title: 'AI Engineer', jobUrl: 'https://jobs.ashbyhq.com/x/abc', location: 'Remote' }],
      }),
    })
    const jobs = await fetchPortalJobs({ portal: 'ashby', slug: 'x', company: 'X' })
    expect(jobs[0].portal).toBe('ashby-api')
    expect(jobs[0].url).toBe('https://jobs.ashbyhq.com/x/abc')
  })

  it('parses Lever response (array shape)', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [
        { text: 'Staff Engineer', hostedUrl: 'https://jobs.lever.co/y/xyz', categories: { location: 'NYC' } },
      ],
    })
    const jobs = await fetchPortalJobs({ portal: 'lever', slug: 'y', company: 'Y' })
    expect(jobs[0].portal).toBe('lever-api')
    expect(jobs[0].location).toBe('NYC')
  })

  it('returns [] on fetch network error', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'))
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'anthropic', company: 'X' })
    expect(jobs).toEqual([])
  })

  it('returns [] on non-ok response', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 404, json: async () => ({}) })
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'missing', company: 'X' })
    expect(jobs).toEqual([])
  })

  it('rejects slug with path traversal', async () => {
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: '../evil', company: 'X' })
    expect(jobs).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects slug with special characters', async () => {
    const jobs = await fetchPortalJobs({ portal: 'ashby', slug: 'evil/../../etc', company: 'X' })
    expect(jobs).toEqual([])
  })

  it('handles empty response gracefully', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [] }),
    })
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'anthropic', company: 'X' })
    expect(jobs).toEqual([])
  })
})
