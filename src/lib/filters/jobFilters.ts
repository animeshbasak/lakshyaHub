// src/lib/filters/jobFilters.ts

export interface RawJob {
  title?: string
  companyName?: string
  company?: string
  location?: string
  [key: string]: unknown
}

const US_CITY_STATE_PATTERNS = /\b(OH|NY|CA|TX|IL|MA|WA|GA|FL|NC|NJ|PA|VA|AZ|CO|MN|MI|OR|MO|TN|IN|WI|CT|KY|OK|UT|NV|ID|HI|ME|NH|RI|DE|SD|ND|MT|WY|AK|DC)\b/
const US_CITY_PATTERNS = /\b(new york|san francisco|los angeles|chicago|seattle|boston|austin|denver|atlanta|dallas|houston|phoenix|portland|minneapolis|detroit)\b/i
const NON_INDIA_COUNTRIES = /\b(united states|usa|u\.s\.a|uk|united kingdom|canada|australia|germany|france|singapore|dubai|uae|netherlands|sweden|switzerland|japan|korea)\b/i

const INDIA_SIGNALS = /\b(india|delhi|noida|gurgaon|gurugram|bengaluru|bangalore|hyderabad|mumbai|pune|chennai|kolkata|faridabad|greater noida|navi mumbai|thane|kochi|ahmedabad|jaipur)\b/i

export function filterToIndia<T extends RawJob>(jobs: T[]): T[] {
  return jobs.filter(job => {
    const loc = (job.location ?? '').trim()
    // No location — keep it (could be remote/India-based)
    if (!loc) return true
    // Explicit non-India countries → drop
    if (NON_INDIA_COUNTRIES.test(loc)) return false
    // US state abbreviations or major US cities → drop
    if (US_CITY_STATE_PATTERNS.test(loc)) return false
    if (US_CITY_PATTERNS.test(loc)) return false
    // Explicit India signal or remote → keep
    if (INDIA_SIGNALS.test(loc)) return true
    if (/remote|work from home|wfh|anywhere/i.test(loc)) return true
    // Ambiguous location — keep rather than drop (less false negatives)
    return true
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
