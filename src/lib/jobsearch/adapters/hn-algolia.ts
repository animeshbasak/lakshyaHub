import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, FETCH_HEADERS } from '../util'

interface AlgoliaHit {
  objectID: string
  comment_text?: string
  story_id?: number
  parent_id?: number
  created_at?: string
  author?: string
  story_title?: string
}

/**
 * HN "Who's Hiring" — searches comments under the most recent monthly
 * @whoishiring threads. Two-step:
 *
 *   1. /search_by_date?tags=story,author_whoishiring&hitsPerPage=4
 *      → latest threads (filter to "Who is hiring", skip "Who wants to be
 *      hired" companion threads). We pick the most recent 2 to cover
 *      month-rollover edge cases.
 *   2. /search?query=<q>&tags=comment,story_<id>
 *      Algolia handles the keyword match server-side; we just normalize.
 *
 * No author filter beyond `story_<id>` — comment authors are individual
 * employers, never @whoishiring themselves. The comment IS the JD.
 */
export const hnAlgoliaAdapter: JobSearchAdapter = {
  name: 'hn-whos-hiring',
  regions: ['REMOTE', 'GLOBAL', 'IN'],
  timeoutMs: 10_000,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    if (!input.query.trim()) return []

    const storyIds = await fetchLatestThreadIds(2)
    if (storyIds.length === 0) return []

    const hits: AlgoliaHit[] = []
    const limit = input.limitPerAdapter ?? 30

    // Hit each thread's comments in parallel, merge.
    await Promise.all(storyIds.map(async (id) => {
      const url = new URL('https://hn.algolia.com/api/v1/search')
      url.searchParams.set('query', input.query)
      url.searchParams.set('tags', `comment,story_${id}`)
      url.searchParams.set('hitsPerPage', String(Math.min(limit, 50)))
      const res = await fetch(url, { headers: FETCH_HEADERS })
      if (!res.ok) return
      const data = await res.json() as { hits?: AlgoliaHit[] }
      for (const h of data.hits ?? []) hits.push(h)
    }))

    return hits
      .filter(h => h.comment_text)
      .map((h): JobSearchResult => {
        const text = h.comment_text!
        const firstLine = extractFirstLine(text)
        const company = extractCompany(firstLine)

        return {
          url: `https://news.ycombinator.com/item?id=${h.objectID}`,
          title: firstLine.slice(0, 200),
          company: company || 'Hacker News listing',
          location: extractLocation(text),
          description: snippet(text, 500),
          postedAt: h.created_at ?? null,
          source: 'hn-whos-hiring',
          salary: null,
          tags: ['hn', 'startup'],
        }
      })
      .filter(j => regionFilter(j, input))
      .slice(0, limit)
  },
}

async function fetchLatestThreadIds(count: number): Promise<number[]> {
  const url = new URL('https://hn.algolia.com/api/v1/search_by_date')
  url.searchParams.set('tags', 'story,author_whoishiring')
  url.searchParams.set('hitsPerPage', String(count * 2))
  const res = await fetch(url, { headers: FETCH_HEADERS })
  if (!res.ok) return []
  const data = await res.json() as { hits?: Array<{ objectID: string; title?: string }> }
  // Filter to "Who is hiring" — drop "Who wants to be hired" companion threads.
  const hiring = (data.hits ?? []).filter(h => /who is hiring/i.test(h.title ?? ''))
  return hiring.slice(0, count).map(h => Number(h.objectID)).filter(n => Number.isFinite(n))
}

function extractFirstLine(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .split(/[.\n]/)[0]
    .trim()
    .slice(0, 200)
}

function extractCompany(firstLine: string): string {
  return firstLine.split('|')[0]?.trim() || ''
}

function extractLocation(text: string): string | null {
  const cleaned = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const segs = cleaned.split('|').map(s => s.trim())
  if (segs.length >= 3) return segs[2] || null
  const m = cleaned.match(/\b(remote|sf|nyc|london|berlin|bengaluru|bangalore|mumbai|pune|delhi|gurgaon|noida|hyderabad|chennai)\b/i)
  return m ? m[0] : null
}

function regionFilter(job: JobSearchResult, input: JobSearchInput): boolean {
  const haystack = `${job.title} ${job.description ?? ''}`.toLowerCase()
  if (input.region === 'IN') {
    return /(india|bengaluru|bangalore|mumbai|delhi|noida|gurugram|gurgaon|pune|hyderabad|chennai|kolkata|remote)/i.test(haystack)
  }
  if (input.region === 'REMOTE') {
    return /\b(remote|anywhere|wfh|distributed|work from home)\b/i.test(haystack)
  }
  return true
}
