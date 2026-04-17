// src/lib/filters/jobFilters.ts

export interface RawJob {
  title?: string
  companyName?: string
  company?: string
  location?: string
  [key: string]: unknown
}

const US_STATE_PATTERNS = /\b(OH|NY|CA|TX|IL|MA|WA|GA|FL|NC|NJ|PA|VA|AZ|CO|MN|MI|OR|MO|TN|IN|WI|CT|KY|OK|UT|NV|ID|HI|ME|NH|RI|DE|SD|ND|MT|WY|AK|DC)\b/

const INDIA_SIGNALS = /india|remote|delhi|noida|gurgaon|gurugram|bengaluru|bangalore|hyderabad|mumbai|pune|chennai|kolkata|faridabad|greater noida/i

export function filterToIndia<T extends RawJob>(jobs: T[]): T[] {
  return jobs.filter(job => {
    const loc = job.location ?? ''
    if (!loc) return false
    if (US_STATE_PATTERNS.test(loc)) return false
    return INDIA_SIGNALS.test(loc) || loc.toLowerCase().includes('remote')
  })
}

export function deduplicateJobs<T extends RawJob>(jobs: T[]): T[] {
  const seen = new Set<string>()
  return jobs.filter(job => {
    const company = (job.companyName ?? job.company ?? '').toLowerCase().trim()
    const title = (job.title ?? '').toLowerCase().trim()
    const key = `${company}::${title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function applyPostScrapeFilters<T extends RawJob>(jobs: T[]): T[] {
  return deduplicateJobs(filterToIndia(jobs))
}
