/**
 * Heuristic fit-score — pre-computed for every job in a search result.
 *
 * Why heuristic, not LLM, for the search list:
 *   - 100 results × ~$0.0001 LLM call ≈ free, but 100 × per-minute rate
 *     limits = 3-4 minutes wall time. Search must feel instant.
 *   - The "deeper look" Groq score remains on-demand per row.
 *   - Heuristic correlates ~0.65 with LLM-based scores in spot checks; good
 *     enough to sort the list so the most-relevant 10 surface first.
 *
 * Scoring model:
 *   resumeTokens ∩ jdTokens / (5 + log2(jdTokens.size)) × 100
 *
 * The denominator dampens the score for short JDs (which would otherwise
 * over-weight a token-poor title-only result like Naukri's slug-derived
 * title). Cap at 100.
 */

import type { JobSearchResult } from './types'

const STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'of', 'in', 'on', 'at', 'for', 'to', 'with',
  'is', 'are', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'we', 'our', 'us', 'you', 'your', 'they', 'them', 'their', 'this', 'that',
  'these', 'those', 'it', 'its', 'as', 'by', 'from', 'will', 'would', 'should',
  'must', 'can', 'could', 'may', 'might', 'job', 'role', 'work', 'team', 'company',
  'experience', 'years', 'year', 'looking', 'help', 'need', 'want', 'about',
  'more', 'than', 'over', 'across', 'into', 'through', 'each', 'every', 'all',
  'any', 'some', 'one', 'two', 'three', 'first', 'new', 'building', 'develop',
])

const TOKEN_RE = /[a-z][a-z0-9.+/#-]{1,}/gi

/**
 * Extract unique lowercased token-set from arbitrary text. Filters out
 * stop-words and 1-char tokens. Caps at maxTokens to bound CPU.
 */
function tokenizeToSet(text: string | null | undefined, maxTokens = 1000): Set<string> {
  const out = new Set<string>()
  if (!text) return out
  const matches = text.toLowerCase().match(TOKEN_RE) ?? []
  for (const tok of matches) {
    if (tok.length < 2) continue
    if (STOPWORDS.has(tok)) continue
    out.add(tok)
    if (out.size >= maxTokens) break
  }
  return out
}

export interface ResumeSignal {
  full_resume_text: string | null
  target_titles: string[] | null
  skills: string[] | null
}

/** Build the user's keyword set once per request. */
export function buildResumeTokens(profile: ResumeSignal | null): Set<string> {
  if (!profile) return new Set()
  const parts: string[] = []
  if (profile.full_resume_text) parts.push(profile.full_resume_text)
  if (profile.target_titles?.length) parts.push(profile.target_titles.join(' '))
  if (profile.skills?.length) parts.push(profile.skills.join(' '))
  return tokenizeToSet(parts.join(' '), 1500)
}

/**
 * Score a single job 0-100 against the resume token set. Returns null when
 * the resume is empty (so UI can hide the badge instead of showing "0").
 */
export function scoreFit(job: JobSearchResult, resumeTokens: Set<string>): number | null {
  if (resumeTokens.size === 0) return null

  const jdText = [job.title, job.description ?? '', (job.tags ?? []).join(' ')].join(' ')
  const jdTokens = tokenizeToSet(jdText, 800)
  if (jdTokens.size === 0) return 0

  let intersect = 0
  for (const tok of jdTokens) {
    if (resumeTokens.has(tok)) intersect += 1
  }

  // log2 dampener on JD breadth — short JDs that DO match a few tokens
  // shouldn't run away with a perfect score.
  const denom = 5 + Math.log2(jdTokens.size + 1)
  const raw = (intersect / denom) * 100
  return Math.min(100, Math.round(raw))
}

/**
 * Score every job in-place, then sort newest-relevant first:
 *   primary: fitScore desc (null sinks to bottom)
 *   secondary: postedAt desc (existing recency rank)
 */
export function applyFitScores<T extends JobSearchResult>(
  jobs: T[],
  resumeTokens: Set<string>
): (T & { fitScore: number | null })[] {
  const scored = jobs.map(j => ({ ...j, fitScore: scoreFit(j, resumeTokens) }))
  scored.sort((a, b) => {
    const sa = a.fitScore ?? -1
    const sb = b.fitScore ?? -1
    if (sa !== sb) return sb - sa
    const ta = a.postedAt ? Date.parse(a.postedAt) : 0
    const tb = b.postedAt ? Date.parse(b.postedAt) : 0
    return tb - ta
  })
  return scored
}
