/**
 * Personal-fit reranker — config layer.
 *
 * The reranker (personalFit.ts) is a pure function: given a job + a config,
 * return a score. This file is the CONFIG layer — regional starter presets
 * + a resolver that picks/merges the right preset for a given user profile.
 *
 * Long-term plan: per-user configs persist in the `user_search_preferences`
 * table and are loaded at request time. For Phase 0 (this commit), we ship
 * regional defaults the user can override via env or pass to the reranker
 * directly. UI settings page is a follow-up.
 */

export type Region = 'IN' | 'US' | 'EU' | 'GLOBAL'

export interface PersonalFitConfig {
  /** Title seniority/level keywords that boost the score. */
  preferredTitles: string[]
  /** Tech-stack keywords expected in title or JD (substring match). */
  preferredStack: string[]
  /** Geographic preferences (substring match against location). */
  preferredLocations: string[]
  /** Allow REMOTE to satisfy location signal regardless of country. */
  remoteAllowed: boolean
  /** Brands to BOOST (top-tier product cos / well-funded startups). */
  preferredBrands: string[]
  /** Brands to HARD-FAIL (IT services / body shops / known low-quality). */
  disqualifiedBrands: string[]
  /** Comp floor in INR LPA (lakhs per annum). undefined = disabled. */
  minCompLPA?: number
  /** Comp floor in USD/year. undefined = disabled. */
  minCompUSD?: number
}

/* ─────────────────────────────────────────────────────────────────────────
 * REGIONAL PRESETS
 *
 * Each preset = a starter pack for a typical senior IC in that region.
 * Users override via the UI / env / DB row. Lists are case-insensitive.
 *
 * Brand lists are intentionally NOT exhaustive — they bias toward signal-rich
 * "definitely a top product co" vs "definitely a body shop" extremes. Anything
 * in the middle gets neutral scoring (signals from title / stack / location
 * still apply).
 * ───────────────────────────────────────────────────────────────────────── */

const COMMON_SENIOR_TITLES = [
  'lead',
  'staff',
  'principal',
  'senior',
  'sr.',
  'sde iii',
  'sde 3',
  'sde-3',
  'l5',
  'l6',
  'l7',
]

const COMMON_FRONTEND_STACK = [
  'react',
  'typescript',
  'next.js',
  'nextjs',
  'frontend',
  'front-end',
  'web',
  'javascript',
  'node',
  'vue',
  'svelte',
]

/** Top product cos / well-funded startups, recognizable globally. */
const GLOBAL_PRODUCT_BRANDS = [
  // FAANG-tier
  'google',
  'meta',
  'apple',
  'microsoft',
  'amazon',
  'netflix',
  // AI labs
  'anthropic',
  'openai',
  'cohere',
  'mistral',
  'huggingface',
  // Fintech / dev infra
  'stripe',
  'linear',
  'vercel',
  'figma',
  'notion',
  'atlassian',
  'mercury',
  'github',
  'cloudflare',
  'shopify',
  'airbnb',
  'discord',
  'reddit',
  'databricks',
  'snowflake',
  'datadog',
  'mongodb',
  'hashicorp',
  'twilio',
  'plaid',
  'sentry',
  'supabase',
  'planetscale',
  'gitlab',
  'circleci',
  'rippling',
  'asana',
  'box',
]

/** Strong India-based product cos. Boost when operator is India-based. */
const INDIA_PRODUCT_BRANDS = [
  'razorpay',
  'cred',
  'zerodha',
  'groww',
  'phonepe',
  'flipkart',
  'swiggy',
  'zomato',
  'meesho',
  'unacademy',
  'postman',
  'freshworks',
  'browserstack',
  'cleartax',
  'urban company',
  'paytm',
  'nykaa',
  'oyo',
  'ola',
  'dream11',
  'fampay',
]

/** India-focused IT services to disqualify. Word-boundary matched in the
 *  reranker, so short tokens like `tcs` won't false-fire on `Atcs`. Multi-word
 *  entries are matched as exact phrases. */
const INDIA_IT_SERVICES_BLOCKLIST = [
  'tcs',
  'tata consultancy',
  'infosys',
  'wipro',
  'cognizant',
  'accenture',
  'capgemini',
  'hcl technologies',
  'tech mahindra',
  'larsen & toubro infotech',
  'lti',
  'mphasis',
  'mindtree',
  'genpact',
  'persistent systems',
  'birlasoft',
  'mu sigma',
  'happiest minds',
  'mahindra comviva',
  'syntel',
  'hexaware',
  'ntt data',
  'igate',
]

/** US-focused: notable consultancies + body shops some operators want to avoid.
 *  Word-boundary matched, so `ey` correctly catches "EY," and "EY" but not
 *  "Honeycomb" or "key". */
const US_CONSULTING_BLOCKLIST = [
  'deloitte',
  'kpmg',
  'pwc',
  'pricewaterhousecoopers',
  'ey',
  'ernst & young',
  'mckinsey digital',
  'cgi inc',
  'epam',
  'globant',
]

/* ─────────────────────────────────────────────────────────────────────────
 * Region presets — used as STARTER values; users override via UI or env.
 * ───────────────────────────────────────────────────────────────────────── */

export const PRESETS: Record<Region, PersonalFitConfig> = {
  /** Default for India-based operators (the maintainer's persona). */
  IN: {
    preferredTitles: COMMON_SENIOR_TITLES,
    preferredStack: COMMON_FRONTEND_STACK,
    preferredLocations: ['noida', 'delhi', 'gurgaon', 'gurugram', 'ncr', 'india', 'bengaluru', 'bangalore', 'hyderabad', 'mumbai', 'pune'],
    remoteAllowed: true,
    preferredBrands: [...GLOBAL_PRODUCT_BRANDS, ...INDIA_PRODUCT_BRANDS],
    disqualifiedBrands: INDIA_IT_SERVICES_BLOCKLIST,
    minCompLPA: 45,
    minCompUSD: 80_000,
  },

  /** US-based remote seekers. */
  US: {
    preferredTitles: COMMON_SENIOR_TITLES,
    preferredStack: COMMON_FRONTEND_STACK,
    preferredLocations: ['remote', 'united states', 'usa', 'new york', 'san francisco', 'sf bay', 'seattle', 'boston', 'austin'],
    remoteAllowed: true,
    preferredBrands: GLOBAL_PRODUCT_BRANDS,
    disqualifiedBrands: US_CONSULTING_BLOCKLIST,
    minCompUSD: 150_000,
  },

  /** EU-based seekers (Germany, UK, NL, etc.). */
  EU: {
    preferredTitles: COMMON_SENIOR_TITLES,
    preferredStack: COMMON_FRONTEND_STACK,
    preferredLocations: ['remote', 'london', 'berlin', 'amsterdam', 'paris', 'dublin', 'munich', 'lisbon', 'barcelona', 'madrid', 'stockholm', 'copenhagen'],
    remoteAllowed: true,
    preferredBrands: GLOBAL_PRODUCT_BRANDS,
    disqualifiedBrands: [],
    minCompUSD: 80_000,
  },

  /** Region-agnostic — universal signals only, no regional bias. */
  GLOBAL: {
    preferredTitles: COMMON_SENIOR_TITLES,
    preferredStack: COMMON_FRONTEND_STACK,
    preferredLocations: ['remote', 'worldwide', 'anywhere'],
    remoteAllowed: true,
    preferredBrands: GLOBAL_PRODUCT_BRANDS,
    disqualifiedBrands: [],
  },
}

/**
 * Backward-compatible default export. Tests import this directly. New code
 * should call `resolveConfigForUser(profile)` instead.
 */
export const DEFAULT_PERSONAL_FIT_CONFIG: PersonalFitConfig = PRESETS.IN

/* ─────────────────────────────────────────────────────────────────────────
 * Resolver — pick the right preset based on user profile signals.
 *
 * Inputs come from `resume_profiles` row (or onboarding answers). The
 * resolver is intentionally permissive — if we can't infer a region, fall
 * back to GLOBAL rather than guessing wrong.
 * ───────────────────────────────────────────────────────────────────────── */

export interface UserProfileLite {
  /** ISO-3166 alpha-2 if known; otherwise undefined. */
  country?: string | null
  /** User-set region preference, if any. Wins over country inference. */
  region_preference?: Region | null
  /** User's preferred / target locations (free text from onboarding). */
  target_locations?: string[] | null
}

function inferRegionFromLocations(locations: string[]): Region | null {
  const blob = locations.join(' ').toLowerCase()
  if (/(india|noida|delhi|gurgaon|gurugram|bengaluru|bangalore|mumbai|hyderabad|pune|chennai|kolkata)/.test(blob)) return 'IN'
  if (/(united states|usa|us\b|new york|san francisco|sf bay|seattle|boston|austin|los angeles)/.test(blob)) return 'US'
  if (/(london|berlin|amsterdam|paris|dublin|munich|lisbon|barcelona|madrid|stockholm|europe|uk|germany|france|spain)/.test(blob)) return 'EU'
  return null
}

function inferRegionFromCountry(country: string): Region | null {
  const c = country.toUpperCase()
  if (c === 'IN') return 'IN'
  if (c === 'US' || c === 'CA') return 'US'
  if (['DE','GB','UK','FR','NL','ES','IT','PT','SE','DK','NO','FI','IE','PL','CZ','BE','AT','CH'].includes(c)) return 'EU'
  return null
}

/**
 * Pick a preset for this user. Resolution order:
 *   1. explicit `region_preference` (if set in profile)
 *   2. country code → region map
 *   3. infer from `target_locations` text
 *   4. fall back to GLOBAL
 */
export function resolveConfigForUser(profile: UserProfileLite | null | undefined): PersonalFitConfig {
  if (!profile) return PRESETS.GLOBAL

  if (profile.region_preference && PRESETS[profile.region_preference]) {
    return PRESETS[profile.region_preference]
  }

  if (profile.country) {
    const r = inferRegionFromCountry(profile.country)
    if (r) return PRESETS[r]
  }

  if (profile.target_locations && profile.target_locations.length > 0) {
    const r = inferRegionFromLocations(profile.target_locations)
    if (r) return PRESETS[r]
  }

  return PRESETS.GLOBAL
}

/**
 * Merge a user-provided override on top of a preset. Useful for the eventual
 * settings page: user keeps the preset defaults but adds their own banned
 * companies, preferred brands, comp floor, etc.
 */
export function mergeConfig(base: PersonalFitConfig, override: Partial<PersonalFitConfig>): PersonalFitConfig {
  return {
    preferredTitles: override.preferredTitles ?? base.preferredTitles,
    preferredStack: override.preferredStack ?? base.preferredStack,
    preferredLocations: override.preferredLocations ?? base.preferredLocations,
    remoteAllowed: override.remoteAllowed ?? base.remoteAllowed,
    preferredBrands: override.preferredBrands ?? base.preferredBrands,
    disqualifiedBrands: override.disqualifiedBrands ?? base.disqualifiedBrands,
    minCompLPA: override.minCompLPA ?? base.minCompLPA,
    minCompUSD: override.minCompUSD ?? base.minCompUSD,
  }
}
