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

export interface PersonalFitInput {
  title: string
  company: string
  location?: string | null
  description?: string | null
  salary_range?: string | null
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
  const salary = norm(job.salary_range)
  const corpus = `${title} ${desc} ${salary}`

  // Hard disqualifier: brand. Returns immediately so downstream filters
  // can drop the row without bothering with other signals.
  for (const banned of config.disqualifiedBrands) {
    if (company.includes(banned)) {
      return {
        total: -100,
        reasons: [`disqualified-brand: ${job.company}`],
        disqualified: true,
      }
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

  // Comp floor — best-effort regex extraction. Picks the LARGEST LPA mention
  // in the JD to avoid getting tricked by "min comp 5 LPA" boilerplate when
  // the actual range goes higher.
  if (config.minCompLPA && (salary || desc)) {
    const lpaMatches = `${salary} ${desc}`.match(/(\d+(?:\.\d+)?)\s*(?:l\s*p\s*a|lakh)/gi)
    if (lpaMatches && lpaMatches.length > 0) {
      const values = lpaMatches
        .map((m) => parseFloat(m.match(/\d+(?:\.\d+)?/)?.[0] ?? '0'))
        .filter((n) => n > 0)
      const maxLpa = Math.max(...values)
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
