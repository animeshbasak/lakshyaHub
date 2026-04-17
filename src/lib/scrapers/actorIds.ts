import type { RawJobPartial } from '@/lib/scrapers/types'

export type SourceTier = 1 | 2 | 3

export interface ActorConfig {
  id: string
  label: string
  tier: SourceTier
  buildInput: (query: string, location: string, limit: number) => Record<string, unknown>
  normalizeJob: (raw: Record<string, unknown>) => RawJobPartial
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function linkedInSearchUrl(query: string, location: string): string {
  const params = new URLSearchParams({
    keywords: query,
    location: location,
    f_TPR: 'r604800',  // last 7 days
    sortBy: 'DD',      // date posted
  })
  return `https://www.linkedin.com/jobs/search?${params.toString()}`
}

// ─── ACTOR REGISTRY ──────────────────────────────────────────────────────────

export const ACTORS: Record<string, ActorConfig> = {

  // ── TIER 1: India-first ─────────────────────────────────────────────────

  /**
   * curious_coder/linkedin-jobs-scraper
   * Input: { urls: string[] }
   * Source: apify.com/curious_coder/linkedin-jobs-scraper
   */
  linkedin_primary: {
    id: 'curious_coder/linkedin-jobs-scraper',
    label: 'LinkedIn',
    tier: 1,
    buildInput: (query, location, limit) => ({
      urls: [linkedInSearchUrl(query, location)],
      maxJobs: limit,
      scrapeJobDetails: true,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.title       ?? raw.jobTitle       ?? ''),
      company:     String(raw.companyName ?? raw.company        ?? ''),
      location:    String(raw.location    ?? raw.jobLocation    ?? ''),
      description: String(raw.description ?? raw.jobDescription ?? ''),
      url:         String(raw.jobUrl      ?? raw.url            ?? ''),
      salary:      raw.salary ? String(raw.salary) : undefined,
      source:      'linkedin',
    }),
  },

  /**
   * HarvestAPI/linkedin-job-search
   * Input: { titles: string[], locations: string[], count: number }
   * Source: apify.com/harvestapi/linkedin-job-search
   */
  linkedin_harvest: {
    id: 'HarvestAPI/linkedin-job-search',
    label: 'LinkedIn (HarvestAPI)',
    tier: 1,
    buildInput: (query, location, limit) => ({
      titles: [query],
      locations: [location],
      count: limit,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.title              ?? ''),
      company:     String((raw.company as any)?.name      ?? raw.companyName ?? ''),
      location:    String(raw.city               ?? raw.location    ?? ''),
      description: String(raw.descriptionText    ?? raw.description ?? ''),
      url:         String(raw.linkedinUrl        ?? raw.url         ?? ''),
      salary:      (raw.salary as any)?.text ? String((raw.salary as any).text) : undefined,
      source:      'linkedin',
    }),
  },

  /**
   * bebity/linkedin-jobs-scraper
   * Input: { title: string, location: string, rows: number }
   * Source: apify.com/bebity/linkedin-jobs-scraper
   */
  linkedin_bebity: {
    id: 'bebity/linkedin-jobs-scraper',
    label: 'LinkedIn (bebity)',
    tier: 1,
    buildInput: (query, location, limit) => ({
      title: query,
      location: location,
      rows: limit,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.jobTitle    ?? raw.title       ?? ''),
      company:     String(raw.company     ?? raw.companyName ?? ''),
      location:    String(raw.location    ?? ''),
      description: String(raw.description ?? ''),
      url:         String(raw.applyUrl    ?? raw.url         ?? ''),
      salary:      raw.salary ? String(raw.salary) : undefined,
      source:      'linkedin',
    }),
  },

  /**
   * shahidirfan/naukri-jobs-scraper
   * Input: { searchQuery: string, location: string, maxJobs: number }
   * ✅ VERIFIED: confirmed field is `searchQuery` (not `keyword`)
   */
  naukri: {
    id: 'shahidirfan/naukri-jobs-scraper',
    label: 'Naukri',
    tier: 1,
    buildInput: (query, location, limit) => ({
      searchQuery: query,
      location: location,
      maxJobs: limit,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.jobTitle    ?? raw.title       ?? ''),
      company:     String(raw.company     ?? raw.companyName ?? ''),
      location:    String(raw.location    ?? raw.jobLocation ?? ''),
      description: String(raw.jobDesc     ?? raw.description ?? ''),
      url:         String(raw.jdURL       ?? raw.url         ?? ''),
      salary:      raw.salary ? String(raw.salary) : (raw.ctc ? String(raw.ctc) : undefined),
      source:      'naukri',
    }),
  },

  // ── TIER 2: Global boards ────────────────────────────────────────────────

  /**
   * misceres/indeed-scraper
   * Input: { position: string, country: string, location: string, maxItems: number }
   * ✅ VERIFIED: field is `position`, NOT `keyword`
   * Source: apify.com/misceres/indeed-scraper/input-schema
   */
  indeed: {
    id: 'misceres/indeed-scraper',
    label: 'Indeed',
    tier: 2,
    buildInput: (query, location, limit) => ({
      position: query,        // ← NOT keyword
      country: 'IN',
      location: location,
      maxItems: limit,
      startUrls: [],
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.positionName ?? raw.title    ?? ''),
      company:     String(raw.company      ?? ''),
      location:    String(raw.location     ?? ''),
      description: String(raw.description  ?? raw.summary ?? ''),
      url:         String(raw.url          ?? raw.jobUrl  ?? ''),
      salary:      raw.salary ? String(raw.salary) : undefined,
      source:      'indeed',
    }),
  },

  /**
   * bebity/glassdoor-jobs-scraper
   * Input: { keyword: string, location: string, maxResults: number }
   * ✅ VERIFIED: confirmed from Apify deprecated scraper example showing `"maxResults": 50`
   * Source: apify.com/bebity/glassdoor-jobs-scraper
   */
  glassdoor: {
    id: 'bebity/glassdoor-jobs-scraper',
    label: 'Glassdoor',
    tier: 2,
    buildInput: (query, location, limit) => ({
      keyword: query,
      location: location,
      maxResults: limit,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.jobTitle    ?? raw.title    ?? ''),
      company:     String(raw.company     ?? ''),
      location:    String(raw.location    ?? ''),
      description: String(raw.description ?? ''),
      url:         String(raw.url         ?? raw.jobUrl  ?? ''),
      salary:      raw.salary ? String(raw.salary) : undefined,
      source:      'glassdoor',
    }),
  },

  /**
   * radeance/wellfound-job-listings-scraper
   * Input: { jobTitle: string, location: string, maxJobs: number }
   * ✅ VERIFIED: from GitHub repo and Apify docs (radeance/wellfound-jobs-scraper-public)
   * Source: apify.com/radeance/wellfound-job-listings-scraper
   */
  wellfound: {
    id: 'radeance/wellfound-job-listings-scraper',
    label: 'Wellfound',
    tier: 2,
    buildInput: (query, location, limit) => ({
      jobTitle: query,
      location: location,
      maxJobs: limit,
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.jobTitle     ?? raw.title         ?? ''),
      company:     String(raw.company      ?? raw.companyName   ?? ''),
      location:    String(raw.location     ?? ''),
      description: String(raw.description  ?? ''),
      url:         String(raw.url          ?? raw.jobUrl        ?? ''),
      salary:      raw.salary ? String(raw.salary) : (raw.compensation ? String(raw.compensation) : undefined),
      source:      'wellfound',
    }),
  },

  // ── TIER 3: Google Jobs aggregator ──────────────────────────────────────

  /**
   * orgupdate/google-jobs-scraper
   * Input: { includeKeyword, locationName, countryName, datePosted, pagesToFetch }
   * ✅ VERIFIED: from GitHub repo (orgupdate/Apify-Google-Jobs-Scraper)
   * ⚠️ FIX vs v1: `location` → `locationName`
   */
  google_jobs: {
    id: 'orgupdate/google-jobs-scraper',
    label: 'Google Jobs',
    tier: 3,
    buildInput: (query, location, limit) => ({
      includeKeyword: query,
      locationName: location,          // ← NOT `location`
      countryName: 'india',
      datePosted: '7days',
      pagesToFetch: Math.max(1, Math.ceil(limit / 10)),
    }),
    normalizeJob: (raw) => ({
      title:       String(raw.job_title    ?? raw.title       ?? ''),
      company:     String(raw.company_name ?? raw.company     ?? ''),
      location:    String(raw.location     ?? ''),
      description: String(raw.description  ?? raw.snippet    ?? ''),
      url:         String(raw.URL          ?? raw.url         ?? ''),
      salary:      raw.salary ? String(raw.salary) : undefined,
      source:      'web',
    }),
  },
}

// ─── SOURCE → ACTOR MAPPING ──────────────────────────────────────────────────

export type UserSource = 'linkedin' | 'naukri' | 'indeed' | 'glassdoor' | 'wellfound' | 'web'

export const SOURCE_ACTORS: Record<UserSource, string[]> = {
  linkedin:  ['linkedin_primary', 'linkedin_harvest', 'linkedin_bebity'],
  naukri:    ['naukri'],
  indeed:    ['indeed'],
  glassdoor: ['glassdoor'],
  wellfound: ['wellfound'],
  web:       ['google_jobs'],
}

export function toApifyUrl(actorId: string): string {
  return actorId.replace('/', '~')
}
