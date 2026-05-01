/**
 * Role-string fuzzy match for cross-source job deduplication.
 *
 * Ported from career-ops `merge-tracker.mjs:97-121` (commit 7821113). The
 * upstream version closes career-ops issue #329 — naive token overlap
 * matching unrelated roles as duplicates because they share location/seniority.
 *
 * The lakshya port extends the short-token allowlist (ai/ml/qa/ux/etc.) so
 * "AI Engineer" doesn't collapse with "Engineer".
 */

import { ROLE_STOPWORDS, SHORT_TOKEN_ALLOWLIST } from './roleStopwords'

/**
 * Tokenize a role string into content tokens, dropping stopwords + tokens
 * shorter than 3 chars (unless allowlisted).
 *
 * Lowercases, strips punctuation, splits on whitespace.
 */
export function roleTokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => {
      if (!w) return false
      if (ROLE_STOPWORDS.has(w)) return false
      if (w.length > 3) return true
      // Length-3-or-less: only keep if explicitly allowlisted (ai, ml, qa, etc.)
      return SHORT_TOKEN_ALLOWLIST.has(w)
    })
}

/**
 * Are these two role strings likely the same job?
 *
 * Returns true iff:
 *   - both sides have at least one content token (after stopword filter)
 *   - overlap >= 2 content tokens
 *   - overlap / min(|A|, |B|) >= 0.6 (Jaccard-style ratio on smaller side)
 *
 * The ratio threshold prevents over-matching when two roles share 2 tokens
 * by accident but the rest of the title diverges (e.g. "Backend Engineer
 * Bangalore" vs "Backend Engineer Mumbai" both reduce to ['backend',
 * 'engineer'] — overlap is 2 BUT ratio is 1.0 because the only remaining
 * token sets are identical → STILL flagged as same — which is correct, the
 * city differences are noise via stopwords).
 *
 * The risk case: "Senior Backend Engineer at FooCorp" and "Backend Lead
 * Frontend Architect" — share 'backend' + nothing else after stopwords.
 * overlap=1 < 2 → not matched.
 */
export function roleFuzzyMatch(a: string, b: string): boolean {
  const wordsA = roleTokens(a)
  const wordsB = roleTokens(b)
  if (wordsA.length === 0 || wordsB.length === 0) return false

  const setB = new Set(wordsB)
  const overlap = wordsA.filter((w) => setB.has(w)).length
  if (overlap < 2) return false

  const minLen = Math.min(wordsA.length, wordsB.length)
  const ratio = overlap / minLen

  return ratio >= 0.6
}

/**
 * Canonical token signature for a role. Useful as a dedup-hash component
 * alongside normalized company. Sorted for stability.
 *
 * Returns empty string if no content tokens remain (the role is all stopwords).
 */
export function canonicalRoleSignature(role: string): string {
  return roleTokens(role).sort().join('-')
}
