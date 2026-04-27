import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { snippet, matchesQuery, tokenize, FETCH_HEADERS } from '../util'

/**
 * WeWorkRemotely — public RSS feed per category. We pull "remote-programming"
 * by default (covers most engineer/backend/frontend/full-stack roles).
 *
 * RSS parser is a thin regex — no `xml2js` or `fast-xml-parser` install.
 * The feed is well-formed; if it ever breaks, fall back to empty []
 * silently.
 */

const FEEDS = [
  'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-product-jobs.rss',
  'https://weworkremotely.com/categories/remote-design-jobs.rss',
]

const ITEM_RE = /<item>([\s\S]*?)<\/item>/g
const TAG = (name: string) => new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i')

export const weworkremotelyAdapter: JobSearchAdapter = {
  name: 'weworkremotely',
  regions: ['REMOTE', 'GLOBAL', 'IN'],
  timeoutMs: 12_000,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    if (!input.query.trim()) return []

    // Pick the most relevant feed by query keyword bias; default to programming.
    const q = input.query.toLowerCase()
    const feed =
      /\b(design|ux|ui)\b/.test(q) ? FEEDS[3] :
      /\b(product|pm)\b/.test(q) ? FEEDS[2] :
      /\b(full[\s-]?stack)\b/.test(q) ? FEEDS[1] :
      FEEDS[0]

    const res = await fetch(feed, { headers: FETCH_HEADERS })
    if (!res.ok) return []
    const xml = await res.text()
    const tokens = tokenize(input.query)

    const out: JobSearchResult[] = []
    let m: RegExpExecArray | null
    ITEM_RE.lastIndex = 0
    while ((m = ITEM_RE.exec(xml)) !== null) {
      const item = m[1]
      const titleRaw = item.match(TAG('title'))?.[1] ?? ''
      const link = item.match(TAG('link'))?.[1]?.trim() ?? ''
      const region = item.match(TAG('region'))?.[1]?.trim() ?? 'Anywhere'
      const desc = item.match(TAG('description'))?.[1] ?? ''
      const pub = item.match(TAG('pubDate'))?.[1]?.trim() ?? null

      // RSS title format: "Company: Role Title" — split for cleaner UI.
      const title = decode(titleRaw).trim()
      const colonIdx = title.indexOf(':')
      const company = colonIdx > 0 ? title.slice(0, colonIdx).trim() : ''
      const role = colonIdx > 0 ? title.slice(colonIdx + 1).trim() : title

      if (!matchesQuery(role, tokens)) continue
      if (!link) continue

      out.push({
        url: link,
        title: role,
        company,
        location: region || 'Anywhere',
        description: snippet(desc, 400),
        postedAt: pub ? new Date(pub).toISOString() : null,
        source: 'weworkremotely',
        salary: null,
        tags: ['remote'],
      })
      if (out.length >= (input.limitPerAdapter ?? 30)) break
    }

    return out
  },
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}
