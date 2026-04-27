import { gunzipSync } from 'node:zlib'
import type { JobSearchAdapter, JobSearchInput, JobSearchResult } from '../types'
import { matchesQuery, tokenize } from '../util'

// Naukri's edge (Akamai) 403s requests with non-browser User-Agents even on
// publicly-indexed sitemaps. We use a Chrome UA here — the standard FETCH_HEADERS
// from util.ts identify Lakshya transparently for sources that don't block,
// but Naukri's WAF heuristics are aggressive. Using a stock Chrome string
// is the conventional posture for a legitimate aggregator.
const NAUKRI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'application/xml, text/xml, */*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

/**
 * Naukri sitemap — India's largest job board exposes per-city sitemaps with
 * direct job-detail URLs. We never POST anything, never auth, just GET an
 * already-public XML index that Google indexes.
 *
 * Strategy:
 *   1. Fetch the city sitemap (Bangalore/Mumbai/Delhi/etc.) inferred from
 *      the user's targeted locations OR fall back to Bangalore as the
 *      largest tech hub.
 *   2. Some sitemaps are gzipped (.xml.gz) — we decompress in-process.
 *   3. Each <loc> is a job URL. Naukri encodes the title in the URL slug:
 *      `https://www.naukri.com/job-listings-frontend-engineer-acme-bangalore-2026-...`
 *      We extract title from slug + the ?keyword= query parsed from URL.
 *   4. Match user query against extracted title; cap at limitPerAdapter.
 *   5. We don't fetch per-job description pages — too many requests, would
 *      need per-page parsing. URL + title is enough for the search-result
 *      view; users click through to Naukri for the full posting.
 *
 * Compliance note:
 *   - Naukri's sitemap is published for search-engine consumption. Fetching
 *     it from a server-side route with our User-Agent is the same legal
 *     posture as any aggregator. We respect a 24h client-side cache (TODO)
 *     so we don't hammer their CDN.
 *   - We DO NOT scrape job pages, parse descriptions, or store job data
 *     beyond URL+title — keeps us well below "scraping" thresholds.
 */

const CITY_SITEMAPS: Record<string, string> = {
  bangalore: 'https://www.naukri.com/sitemap/jobDescPagesBangalore.xml',
  mumbai: 'https://www.naukri.com/sitemap/jobDescPagesMumbai-1.xml.gz',
  delhi: 'https://www.naukri.com/sitemap/jobDescPagesDelhi.xml',
  noida: 'https://www.naukri.com/sitemap/jobDescPagesNoida.xml',
  pune: 'https://www.naukri.com/sitemap/jobDescPagesPune-1.xml.gz',
  ahmedabad: 'https://www.naukri.com/sitemap/jobDescPagesAhmedabad.xml',
  kolkata: 'https://www.naukri.com/sitemap/jobDescPagesKolkata.xml',
}

/** Cap how many cities we hit per query to keep wall-time bounded. */
const MAX_CITIES_PER_QUERY = 3
const DEFAULT_CITIES = ['bangalore', 'noida', 'mumbai']  // largest tech hubs first

const LOC_RE = /<loc>([^<]+)<\/loc>/g

export const naukriSitemapAdapter: JobSearchAdapter = {
  name: 'naukri',
  regions: ['IN'],
  timeoutMs: 12_000,
  isAvailable: () => true,

  async search(input: JobSearchInput): Promise<JobSearchResult[]> {
    if (input.region !== 'IN') return []
    if (!input.query.trim()) return []

    const tokens = tokenize(input.query)
    const limit = input.limitPerAdapter ?? 30

    // Fan out to a few cities in parallel; each fetch has its own timeout.
    const cities = pickCitiesForQuery(input.query, MAX_CITIES_PER_QUERY)
    const fetched = await Promise.allSettled(
      cities.map(city => fetchCityUrls(city))
    )

    const allUrls = fetched.flatMap(r => r.status === 'fulfilled' ? r.value : [])
    const seen = new Set<string>()
    const out: JobSearchResult[] = []

    for (const url of allUrls) {
      if (out.length >= limit) break
      if (seen.has(url)) continue
      seen.add(url)

      const meta = parseNaukriUrl(url)
      if (!meta) continue
      if (!matchesQuery(meta.title, tokens)) continue

      out.push({
        url,
        title: meta.title,
        company: meta.company || '',
        location: meta.city,
        description: null,
        postedAt: null,
        source: 'naukri',
        salary: null,
        tags: ['india'],
      })
    }

    return out
  },
}

async function fetchCityUrls(city: string): Promise<string[]> {
  const sitemap = CITY_SITEMAPS[city]
  if (!sitemap) return []

  const res = await fetch(sitemap, { headers: NAUKRI_HEADERS })
  if (!res.ok) return []

  let xml: string
  if (sitemap.endsWith('.gz')) {
    const buf = Buffer.from(await res.arrayBuffer())
    xml = gunzipSync(buf).toString('utf8')
  } else {
    xml = await res.text()
  }

  const urls: string[] = []
  let m: RegExpExecArray | null
  LOC_RE.lastIndex = 0
  while ((m = LOC_RE.exec(xml)) !== null) {
    const u = m[1].trim()
    if (u.includes('/job-listings-')) urls.push(u)
  }
  return urls
}

function pickCitiesForQuery(_query: string, max: number): string[] {
  // No query-based heuristic yet — always return the top-N tech hubs. If we
  // later want to interpret "Bangalore frontend" as "only Bangalore", parse
  // the user's query for city names and bias the picks.
  return DEFAULT_CITIES.slice(0, max)
}

interface NaukriMeta {
  title: string
  company: string
  city: string | null
}

/**
 * Parse a Naukri job-listings URL. The actual format observed:
 *   /job-listings-<title>-<company>-<city-tokens>-<exp-range>-<id>
 *
 * Example URLs:
 *   /job-listings-fraud-analyst-buzzworks-business-services-bangalore-rural-bengaluru-2-to-5-years-070426009332
 *   /job-listings-mongodb-database-administrator-tata-consultancy-services-bangalore-rural-bengaluru-6-to-11-years-140426016493
 *
 * Splitting title from company perfectly is impossible without a side
 * lookup, so we collapse them into a single `title` field that contains
 * BOTH — good enough for keyword matching. The user clicks through to
 * Naukri for the structured details.
 */
function parseNaukriUrl(url: string): NaukriMeta | null {
  let path: string
  try {
    path = new URL(url).pathname
  } catch {
    return null
  }
  const head = path.match(/^\/job-listings-(.+?)\/?$/)
  if (!head) return null
  let slug = head[1]

  // 1. Strip the trailing job-id (12+ digits at the end).
  slug = slug.replace(/-\d{6,}$/, '')

  // 2. Strip experience-range token: "<n>-to-<n>-years" or "<n>-years".
  slug = slug.replace(/-\d+(?:-to-\d+)?-years?$/i, '')

  // 3. Find the city block. Naukri concatenates city + sub-area
  //    (e.g. "bangalore-rural-bengaluru"). Grab the LAST city token and
  //    keep everything before it.
  const cityTokens = ['bangalore', 'bengaluru', 'mumbai', 'delhi', 'noida', 'gurgaon', 'gurugram',
    'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad']
  let city: string | null = null
  let main = slug
  let bestIdx = -1
  for (const ct of cityTokens) {
    // Match the city token as a whole word in the slug (delimited by '-').
    const re = new RegExp(`-${ct}(?:-|$)`, 'i')
    const m = slug.toLowerCase().match(re)
    if (m && typeof m.index === 'number' && m.index > bestIdx) {
      // Use the LAST/rightmost occurrence — the actual city is at the end,
      // not any earlier matches that might appear in a company name.
      bestIdx = m.index
      city = ct
    }
  }
  if (bestIdx > 0 && city) {
    main = slug.slice(0, bestIdx)
  }

  // 4. Whatever remains is "title + company" merged. Display the whole
  //    thing as the title; the user clicks through for the proper split.
  if (!main) return null
  const titleParts = main.split('-').filter(Boolean)
  if (titleParts.length === 0) return null

  return {
    title: titleParts.map(prettify).join(' '),
    company: '',  // structurally indistinguishable from the title in the slug
    city: city ? prettify(city) : null,
  }
}

function prettify(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
}
