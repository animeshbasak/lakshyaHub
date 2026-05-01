/**
 * Shared adapter helpers. Kept dep-free — these run inside Vercel functions
 * that already pull pdfjs-dist + @react-pdf/renderer; we don't want any
 * more weight on the cold-start path.
 */

import type { JobSearchInput, JobSearchResult } from './types'

const HTML_TAG_RE = /<[^>]+>/g
const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
}

/** Strip HTML, decode common entities, collapse whitespace, cap length. */
export function snippet(html: string | null | undefined, maxLen = 500): string | null {
  if (!html) return null
  const noTags = html.replace(HTML_TAG_RE, ' ')
  const decoded = noTags.replace(/&[#a-z0-9]+;/gi, m => ENTITY_MAP[m] ?? m)
  const collapsed = decoded.replace(/\s+/g, ' ').trim()
  if (collapsed.length === 0) return null
  return collapsed.length > maxLen ? collapsed.slice(0, maxLen).trimEnd() + '…' : collapsed
}

/** Tokenize the user query into lowercase keywords for matching. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/&|]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOPWORDS.has(t))
}

const STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'to', 'for', 'of', 'with', 'in', 'on', 'at',
  'jobs', 'job', 'role', 'roles', 'position', 'positions',
])

/** Title-match — must contain ≥1 query token whole-word. */
export function matchesQuery(title: string | null | undefined, tokens: string[]): boolean {
  if (!title) return false
  if (tokens.length === 0) return true
  const t = title.toLowerCase()
  return tokens.some(tok => new RegExp(`\\b${escapeRegex(tok)}\\b`, 'i').test(t))
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Promise.race against a timeout. Resolves to [] on timeout (caller logs). */
export async function withTimeout<T>(p: Promise<T[]>, ms: number, fallback: T[]): Promise<{ value: T[]; timedOut: boolean }> {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        resolve({ value: fallback, timedOut: true })
      }
    }, ms)
    p.then(value => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve({ value, timedOut: false })
      }
    }).catch(() => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve({ value: fallback, timedOut: false })
      }
    })
  })
}

/** Adapter-side guard for region filters that don't directly map (e.g. RemoteOK is always remote). */
export function regionMatch(jobLocation: string | null, input: JobSearchInput, isRemoteSource = false): boolean {
  if (input.region === 'REMOTE') {
    if (isRemoteSource) return true
    return /\b(remote|anywhere|wfh|work from home|distributed)\b/i.test(jobLocation ?? '')
  }
  if (input.region === 'IN') {
    if (!jobLocation) return false
    return /\b(india|bengaluru|bangalore|mumbai|delhi|noida|gurugram|gurgaon|pune|hyderabad|chennai|kolkata|ahmedabad|coimbatore|kochi|jaipur|chandigarh|nagpur|indore)\b/i.test(jobLocation)
      || /(remote)/i.test(jobLocation)  // include "Remote-India" or "Remote (Asia)"
  }
  // GLOBAL — no filter
  return true
}

/** Newer-first sort — adapters lacking postedAt sink to the bottom. */
export function rankByRecency(jobs: JobSearchResult[]): JobSearchResult[] {
  return [...jobs].sort((a, b) => {
    const ta = a.postedAt ? Date.parse(a.postedAt) : 0
    const tb = b.postedAt ? Date.parse(b.postedAt) : 0
    return tb - ta
  })
}

export const FETCH_HEADERS = {
  'User-Agent': 'Lakshya/1.0 (+https://getlakshya.vercel.app)',
  Accept: 'application/json, text/xml, */*',
}
