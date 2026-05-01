/**
 * Personal-fit reranker — operator-targeted signals applied to scraped jobs
 * BEFORE the LLM A-G grader runs. Cheap, deterministic, no API calls.
 *
 * Tunable via src/lib/jobsearch/personalFitConfig.ts (or env overrides).
 *
 * Signal map:
 *   - title-match (lead/staff/principal/senior/sr.)        +20
 *   - title-no-match                                       -10
 *   - stack ≥2 hits (react/typescript/next.js/frontend)    +15
 *   - stack 1 hit                                           +5
 *   - location-remote (when remoteAllowed=true)            +25
 *   - location preferred (noida/delhi/ncr/india)           +15
 *   - location mismatch                                    -15
 *   - brand-tier preferred (top product cos)               +30
 *   - brand DISQUALIFIED (IT services)                hard-fail (-100)
 *   - comp ≥ 1.5× floor                                    +15
 *   - comp meets floor                                      +5
 *   - comp below floor                                     -20
 *
 * Score is capped at ±100 and added to the existing fit_score downstream.
 */

import {
  type PersonalFitConfig,
  DEFAULT_PERSONAL_FIT_CONFIG,
} from './personalFitConfig'

// Re-export so consumers can `import { PersonalFitConfig } from '...personalFit'`
// without crossing module boundaries.
export type { PersonalFitConfig } from './personalFitConfig'

export interface PersonalFitInput {
  title: string
  company: string
  location?: string | null
  description?: string | null
  /** Persisted shape uses snake_case. */
  salary_range?: string | null
  /** Raw scrape shape uses bare `salary`. Accepted as an alias to keep wire-in
   *  callers from having to remap fields when going from scraper output → reranker. */
  salary?: string | null
}

/** Escape a literal string for safe insertion into a RegExp source. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Word-boundary substring match. Returns the matched needle or null.
 *
 * Solves two false-positive classes the naked-includes scan had:
 *   - "Atcs" matching `tcs` (substring trap)
 *   - "Honeycomb" matching `ey ` (the trailing-space hack)
 *
 * `\b` in JS regex matches transitions between [a-zA-Z0-9_] and non-word chars,
 * which correctly anchors short tokens (`tcs`, `ey`, `lti`) without rejecting
 * multi-word phrases (`tata consultancy`, `larsen & toubro infotech`).
 */
function findBlocklistMatch(haystack: string, needles: string[]): string | null {
  for (const n of needles) {
    const trimmed = n.trim().toLowerCase()
    if (!trimmed) continue
    const re = new RegExp(`\\b${escapeRegex(trimmed)}\\b`)
    if (re.test(haystack)) return n
  }
  return null
}

/** Pull all LPA mentions out of a corpus. Highest wins (avoids JD floors like
 *  "min comp 5 LPA" tricking us when the actual range is higher). Handles:
 *    - `45 LPA`, `45LPA`, `45 lpa`
 *    - `45 lakh`, `45 lakhs`, `INR 45 lakhs`
 *    - `45L` (Indian shorthand) — bounded to plausible LPA range (5–300)
 *      so we don't pick up "5L litres" or list-item "1L" by accident.
 */
function extractMaxLPA(corpus: string): number | null {
  const values: number[] = []
  // Tier 1: explicit LPA / lakh
  const re1 = /(\d+(?:\.\d+)?)\s*(?:l\s*p\s*a|lakhs?)\b/gi
  let m: RegExpExecArray | null
  while ((m = re1.exec(corpus)) !== null) {
    const v = parseFloat(m[1])
    if (v > 0) values.push(v)
  }
  // Tier 2: bare `45L` shorthand. Constrained to a senior-IC-plausible LPA
  // range (10-300) so we don't fire on common false positives:
  //   - "5L water" / "5L volume" — physical units below senior comp
  //   - "1L bottle" / "2L request" — list items / units
  // Anything below 10 LPA isn't senior-IC anyway; if a JD only quotes "5L"
  // and means it as comp, it's not a target role for this user.
  const re2 = /\b(\d{1,3}(?:\.\d+)?)\s*L\b(?!PA)/gi
  while ((m = re2.exec(corpus)) !== null) {
    const v = parseFloat(m[1])
    if (v >= 10 && v <= 300) values.push(v)
  }
  if (values.length === 0) return null
  // .reduce avoids `Math.max(...values)` stack-overflow risk on huge inputs.
  return values.reduce((a, b) => (a > b ? a : b), 0)
}

/** Pull max USD comp out of a corpus. Handles `$150k`, `$150,000`, `USD 150k`.
 *  Range-bounded to $30k–$1M so we don't pick up `$5` lunch refs. */
function extractMaxUSD(corpus: string): number | null {
  const values: number[] = []
  // `$150k` / `$150K` / `USD 150k`
  const reK = /(?:\$|usd\s+)\s*(\d{2,3})\s*k\b/gi
  let m: RegExpExecArray | null
  while ((m = reK.exec(corpus)) !== null) {
    const v = parseInt(m[1], 10) * 1000
    if (v >= 30_000 && v <= 1_000_000) values.push(v)
  }
  // `$150,000`
  const reFull = /\$\s*(\d{2,3}),(\d{3})\b/g
  while ((m = reFull.exec(corpus)) !== null) {
    const v = parseInt(m[1], 10) * 1000 + parseInt(m[2], 10)
    if (v >= 30_000 && v <= 1_000_000) values.push(v)
  }
  if (values.length === 0) return null
  return values.reduce((a, b) => (a > b ? a : b), 0)
}

export interface PersonalFitScore {
  total: number
  reasons: string[]
  disqualified: boolean
}

const norm = (s: string | null | undefined): string => (s ?? '').toLowerCase().trim()

export function scorePersonalFit(
  job: PersonalFitInput,
  config: PersonalFitConfig = DEFAULT_PERSONAL_FIT_CONFIG,
): PersonalFitScore {
  const reasons: string[] = []
  let total = 0

  const title = norm(job.title)
  const company = norm(job.company)
  const location = norm(job.location)
  const desc = norm(job.description)
  // Accept both `salary_range` (persisted) and `salary` (raw scrape) so the
  // wire-in caller doesn't have to remap fields between scraper → reranker.
  const salary = norm(job.salary_range ?? job.salary)
  const corpus = `${title} ${desc} ${salary}`

  // Hard disqualifier: brand. Word-boundary match — see findBlocklistMatch
  // for why naked .includes() is wrong (false-positives "Atcs" on `tcs`,
  // "Honeycomb" on `ey `).
  const banned = findBlocklistMatch(company, config.disqualifiedBrands)
  if (banned) {
    return {
      total: -100,
      reasons: [`disqualified-brand: ${job.company}`],
      disqualified: true,
    }
  }

  // Title — match against any preferred seniority/level keyword
  const titleHit = config.preferredTitles.find((t) => title.includes(t))
  if (titleHit) {
    total += 20
    reasons.push(`title-match: ${titleHit}`)
  } else {
    total -= 10
    reasons.push('title-no-match')
  }

  // Stack — count hits in title or description
  const stackHits = config.preferredStack.filter(
    (s) => title.includes(s) || desc.includes(s),
  )
  if (stackHits.length >= 2) {
    total += 15
    reasons.push(`stack-strong: ${stackHits.slice(0, 3).join(',')}`)
  } else if (stackHits.length === 1) {
    total += 5
    reasons.push(`stack-partial: ${stackHits[0]}`)
  }

  // Location — remote takes precedence if allowed; else preferred locations
  // We check the location field explicitly + the description text, since job
  // boards inconsistently put "Remote" in title vs location vs body.
  const remoteSignal =
    /\bremote\b/i.test(job.location ?? '') ||
    /\bremote\b/i.test(job.description ?? '') ||
    /\bwork from home\b/i.test(corpus) ||
    /\bwfh\b/i.test(corpus)

  const locationHit = config.preferredLocations.find((l) => location.includes(l))

  if (config.remoteAllowed && remoteSignal) {
    total += 25
    reasons.push('location-remote')
  } else if (locationHit) {
    total += 15
    reasons.push(`location-match: ${locationHit}`)
  } else if (location) {
    total -= 15
    reasons.push(`location-mismatch: ${job.location}`)
  }

  // Brand tier — preferred boost (additive on top of any other signals)
  const brandHit = config.preferredBrands.find((b) => company.includes(b))
  if (brandHit) {
    total += 30
    reasons.push(`brand-tier: ${brandHit}`)
  }

  // Comp floor — extract highest LPA / USD mention separately. Highest-wins
  // protects against JD boilerplate ("min comp 5 LPA") tricking us when the
  // actual range goes higher. We try LPA first; only fall through to USD when
  // there's no LPA hit (avoids double-counting on JDs that quote both).
  const compCorpus = `${salary} ${desc}`
  if (config.minCompLPA) {
    const maxLpa = extractMaxLPA(compCorpus)
    if (maxLpa !== null) {
      if (maxLpa < config.minCompLPA) {
        total -= 20
        reasons.push(`comp-low: ${maxLpa}LPA<${config.minCompLPA}`)
      } else if (maxLpa >= config.minCompLPA * 1.5) {
        total += 15
        reasons.push(`comp-high: ${maxLpa}LPA`)
      } else {
        total += 5
        reasons.push(`comp-meets-floor: ${maxLpa}LPA`)
      }
    } else if (config.minCompUSD) {
      // No LPA mention — try USD. Useful for international postings on
      // Indian-defaulted user profiles.
      const maxUsd = extractMaxUSD(compCorpus)
      if (maxUsd !== null) {
        if (maxUsd < config.minCompUSD) {
          total -= 20
          reasons.push(`comp-low: $${Math.round(maxUsd / 1000)}k<$${Math.round(config.minCompUSD / 1000)}k`)
        } else if (maxUsd >= config.minCompUSD * 1.5) {
          total += 15
          reasons.push(`comp-high: $${Math.round(maxUsd / 1000)}k`)
        } else {
          total += 5
          reasons.push(`comp-meets-floor: $${Math.round(maxUsd / 1000)}k`)
        }
      }
    }
  } else if (config.minCompUSD) {
    // USD-only configuration (US/EU presets that don't set LPA).
    const maxUsd = extractMaxUSD(compCorpus)
    if (maxUsd !== null) {
      if (maxUsd < config.minCompUSD) {
        total -= 20
        reasons.push(`comp-low: $${Math.round(maxUsd / 1000)}k<$${Math.round(config.minCompUSD / 1000)}k`)
      } else if (maxUsd >= config.minCompUSD * 1.5) {
        total += 15
        reasons.push(`comp-high: $${Math.round(maxUsd / 1000)}k`)
      } else {
        total += 5
        reasons.push(`comp-meets-floor: $${Math.round(maxUsd / 1000)}k`)
      }
    }
  }

  // Cap at ±100 — the score is a delta, not a base
  total = Math.max(-100, Math.min(100, total))

  return { total, reasons, disqualified: false }
}

export interface JobWithFit<T> {
  job: T
  personalFitScore: number
  personalFitReasons: string[]
}

/**
 * Apply personal-fit scoring to a list of job results.
 * Disqualified jobs (matching the IT-services blocklist) are filtered out
 * unless `keepDisqualified: true` is passed.
 */
export function applyPersonalFit<T extends PersonalFitInput>(
  jobs: T[],
  config: PersonalFitConfig = DEFAULT_PERSONAL_FIT_CONFIG,
  options: { keepDisqualified?: boolean } = {},
): Array<T & { personalFitScore: number; personalFitReasons: string[] }> {
  const out: Array<T & { personalFitScore: number; personalFitReasons: string[] }> = []
  for (const job of jobs) {
    const fit = scorePersonalFit(job, config)
    if (fit.disqualified && !options.keepDisqualified) continue
    out.push({
      ...job,
      personalFitScore: fit.total,
      personalFitReasons: fit.reasons,
    })
  }
  return out
}
