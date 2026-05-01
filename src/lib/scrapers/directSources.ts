// Free, no-auth job APIs — no Apify required. Used as primary/fallback alongside Apify.

import type { RawJob } from './types'

const FETCH_TIMEOUT_MS = 10_000

function withTimeout(ms: number): AbortSignal {
  return AbortController.prototype.constructor
    ? (() => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal })()
    : AbortSignal.timeout(ms)
}

// ─── Greenhouse ───────────────────────────────────────────────────────────────
// GET https://boards-api.greenhouse.io/v1/boards/{company}/jobs  (no auth)

const GREENHOUSE_COMPANIES = [
  'anthropic', 'openai', 'notion', 'figma', 'linear', 'vercel', 'stripe',
  'shopify', 'airbnb', 'netflix', 'spotify', 'palantir', 'databricks',
  'huggingface', 'cohere', 'scale-ai', 'labelbox', 'weights-biases',
  'modal', 'replicate', 'together', 'groq', 'mistral', 'elevenlabs',
  'retool', 'zapier', 'airtable', 'loom', 'deel', 'remote',
]

interface GreenhouseJob {
  title: string
  location: { name: string }
  absolute_url: string
  content?: string
  updated_at?: string
}

async function fetchGreenhouseCompany(company: string, query: string): Promise<RawJob[]> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`,
      { signal: withTimeout(FETCH_TIMEOUT_MS) }
    )
    if (!res.ok) return []
    const data = await res.json() as { jobs?: GreenhouseJob[] }
    const jobs = data.jobs ?? []
    const q = query.toLowerCase()
    return jobs
      .filter(j => j.title.toLowerCase().includes(q) || q.split(' ').some(w => j.title.toLowerCase().includes(w)))
      .map(j => ({
        title: j.title,
        company: company.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        location: j.location?.name ?? '',
        description: j.content ? j.content.replace(/<[^>]+>/g, '').slice(0, 1000) : '',
        url: j.absolute_url,
        source: 'greenhouse',
      }))
  } catch {
    return []
  }
}

export async function searchGreenhouseJobs(query: string, limit: number): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(c => fetchGreenhouseCompany(c, query))
  )
  const jobs: RawJob[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') jobs.push(...r.value)
    if (jobs.length >= limit) break
  }
  return jobs.slice(0, limit)
}

// ─── Lever ────────────────────────────────────────────────────────────────────
// GET https://api.lever.co/v0/postings/{company}  (no auth)

const LEVER_COMPANIES = [
  'notion', 'linear', 'figma', 'vercel', 'retool', 'zapier',
  'airtable', 'miro', 'loom', 'deel', 'remote', 'lattice',
  'rippling', 'brex', 'mercury', 'plaid', 'checkr',
]

interface LeverJob {
  text: string
  categories: { location?: string; team?: string }
  hostedUrl: string
  descriptionPlain?: string
  createdAt?: number
}

async function fetchLeverCompany(company: string, query: string): Promise<RawJob[]> {
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${company}`,
      { signal: withTimeout(FETCH_TIMEOUT_MS) }
    )
    if (!res.ok) return []
    const jobs = await res.json() as LeverJob[]
    if (!Array.isArray(jobs)) return []
    const q = query.toLowerCase()
    return jobs
      .filter(j => j.text.toLowerCase().includes(q) || q.split(' ').some(w => j.text.toLowerCase().includes(w)))
      .map(j => ({
        title: j.text,
        company: company.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        location: j.categories?.location ?? '',
        description: j.descriptionPlain?.slice(0, 1000) ?? '',
        url: j.hostedUrl,
        source: 'lever',
      }))
  } catch {
    return []
  }
}

export async function searchLeverJobs(query: string, limit: number): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    LEVER_COMPANIES.map(c => fetchLeverCompany(c, query))
  )
  const jobs: RawJob[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') jobs.push(...r.value)
    if (jobs.length >= limit) break
  }
  return jobs.slice(0, limit)
}

// ─── RemoteOK ─────────────────────────────────────────────────────────────────
// GET https://remoteok.com/api  (public JSON, no auth)

interface RemoteOKJob {
  position?: string
  company?: string
  location?: string
  description?: string
  url?: string
  tags?: string[]
  slug?: string
}

export async function searchRemoteOK(query: string, limit: number): Promise<RawJob[]> {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'lakshya/1.0 (job search app)' },
      signal: withTimeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const raw = await res.json() as RemoteOKJob[]
    const items = Array.isArray(raw) ? raw.slice(1) : [] // first item is metadata
    const q = query.toLowerCase()
    return items
      .filter(j =>
        j.position && (
          j.position.toLowerCase().includes(q) ||
          j.tags?.some(t => t.toLowerCase().includes(q)) ||
          q.split(' ').some(w => j.position!.toLowerCase().includes(w))
        )
      )
      .slice(0, limit)
      .map(j => ({
        title: j.position ?? '',
        company: j.company ?? '',
        location: j.location ?? 'Remote',
        description: j.description?.replace(/<[^>]+>/g, '').slice(0, 1000) ?? '',
        url: j.url ?? `https://remoteok.com/remote-jobs/${j.slug ?? ''}`,
        source: 'remoteok',
      }))
  } catch {
    return []
  }
}

// ─── Combined entry point ─────────────────────────────────────────────────────

export async function searchDirectSources(
  query: string,
  _location: string,
  limit: number,
): Promise<{ jobs: RawJob[]; errors: string[] }> {
  const errors: string[] = []
  const seen = new Set<string>()
  const allJobs: RawJob[] = []

  const [greenhouse, lever, remoteok] = await Promise.allSettled([
    searchGreenhouseJobs(query, limit),
    searchLeverJobs(query, limit),
    searchRemoteOK(query, Math.min(limit, 30)),
  ])

  for (const [label, result] of [
    ['Greenhouse', greenhouse],
    ['Lever', lever],
    ['RemoteOK', remoteok],
  ] as [string, PromiseSettledResult<RawJob[]>][]) {
    if (result.status === 'rejected') {
      errors.push(`${label}: ${String(result.reason)}`)
    } else {
      for (const job of result.value) {
        const key = `${job.title.toLowerCase()}::${job.company.toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          allJobs.push(job)
        }
      }
    }
  }

  return { jobs: allJobs.slice(0, limit * 2), errors }
}
