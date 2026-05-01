export type PortalType = 'greenhouse' | 'ashby' | 'lever'
export type Source = 'greenhouse-api' | 'ashby-api' | 'lever-api'

export interface ScanJob {
  title: string
  url: string
  company: string
  location: string
  portal: Source
}

interface FetchInput {
  portal: PortalType
  slug: string
  company: string
}

const TIMEOUT_MS = 10_000
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/i

const ALLOWED_HOSTS: Record<PortalType, string> = {
  greenhouse: 'boards-api.greenhouse.io',
  ashby: 'api.ashbyhq.com',
  lever: 'api.lever.co',
}

const SOURCE_MAP: Record<PortalType, Source> = {
  greenhouse: 'greenhouse-api',
  ashby: 'ashby-api',
  lever: 'lever-api',
}

function buildUrl(portal: PortalType, slug: string): string | null {
  if (!SLUG_RE.test(slug)) return null
  switch (portal) {
    case 'greenhouse': return `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
    case 'ashby':      return `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`
    case 'lever':      return `https://api.lever.co/v0/postings/${slug}`
  }
}

export async function fetchPortalJobs(input: FetchInput): Promise<ScanJob[]> {
  const url = buildUrl(input.portal, input.slug)
  if (!url) return []
  // Belt + suspenders: confirm hostname matches expected allowlist
  if (new URL(url).hostname !== ALLOWED_HOSTS[input.portal]) return []

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return []
    const data = await res.json()
    return parse(input, data)
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

type GreenhouseShape = { jobs?: Array<{ title: string; absolute_url: string; location?: { name?: string } }> }
type AshbyShape = { jobs?: Array<{ title: string; jobUrl: string; location?: string }> }
type LeverShape = Array<{ text: string; hostedUrl: string; categories?: { location?: string } }>

function parse(input: FetchInput, data: unknown): ScanJob[] {
  const source = SOURCE_MAP[input.portal]
  if (input.portal === 'greenhouse') {
    const jobs = (data as GreenhouseShape).jobs ?? []
    return jobs.map(j => ({
      title: j.title,
      url: j.absolute_url,
      company: input.company,
      location: j.location?.name ?? '',
      portal: source,
    }))
  }
  if (input.portal === 'ashby') {
    const jobs = (data as AshbyShape).jobs ?? []
    return jobs.map(j => ({
      title: j.title,
      url: j.jobUrl,
      company: input.company,
      location: j.location ?? '',
      portal: source,
    }))
  }
  if (input.portal === 'lever') {
    const jobs = Array.isArray(data) ? (data as LeverShape) : []
    return jobs.map(j => ({
      title: j.text,
      url: j.hostedUrl,
      company: input.company,
      location: j.categories?.location ?? '',
      portal: source,
    }))
  }
  return []
}
