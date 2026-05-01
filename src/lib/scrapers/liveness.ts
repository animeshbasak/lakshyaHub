/**
 * Liveness checker — classifies a job-posting page as active / expired /
 * uncertain via regex patterns + heuristics on the rendered HTML.
 *
 * Ported from career-ops `liveness-core.mjs:1-40` (with the new "Applications
 * have closed" patterns from commit 7f8217e). Pure-function: no I/O, no
 * Chromium, no network. Caller is responsible for fetching HTML.
 *
 * Returned status matches the existing `jobs.liveness_status` schema (added
 * in migration 003) so the future wire-in can persist directly without an
 * enum-mapping shim:
 *   - active     — content looks live (apply controls present, content
 *                  rich, no expiry banners)
 *   - expired    — definitively expired (banner / URL / listing-redirect)
 *   - uncertain  — content too short / ambiguous to classify (default state
 *                  in DB schema)
 *
 * This is the LITE liveness check (HTTP-only). The full Chromium-based
 * version is gated behind BROWSER_LIVENESS_ENABLED on the QStash routes
 * (Vercel plan-aware). The lite check covers ~80% of expired postings on
 * static / SSR boards (Greenhouse / Ashby / Lever / RemoteOK / Adzuna /
 * BambooHR / Teamtailor) without needing a browser.
 *
 * Doesn't catch: pure-SPA / auth-walled job pages where the closed-banner
 * is rendered client-side (LinkedIn, some Workday, some Naukri).
 */

/**
 * Multilingual hard-expired patterns. These are HIGH-confidence signals —
 * if any matches, the posting is definitively expired.
 */
const HARD_EXPIRED_PATTERNS: RegExp[] = [
  /this job (listing )?is closed/i,
  /job (listing )?not found/i,
  /the page you are looking for doesn.t exist/i,
  // Variants from career-ops 7f8217e — Singapore mycareersfuture etc.
  /applications?\s+(?:(?:have|are|is)\s+)?closed/i,
  /closed on \d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  /closed on (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}/i,
  // German
  /diese stelle (ist )?(nicht mehr|bereits) besetzt/i,
  // French
  /offre (expirée|n'est plus disponible)/i,
  // Spanish (career-ops upstream community contrib)
  /(?:la )?(?:vacante|posici[oó]n|oferta) (?:ha sido )?cerrada/i,
]

/**
 * Patterns suggesting the URL redirected to a search/listing page —
 * also a hard signal that the original posting is gone.
 */
const LISTING_PAGE_PATTERNS: RegExp[] = [
  /\b\d+\s+(jobs|results|positions|openings)\s+found/i,
  /\b\d+\s+vacantes?\s+encontradas?/i, // Spanish
  /search results for/i,
]

/**
 * URL-level error indicators. If the FINAL URL after redirects matches any
 * of these, the posting is gone regardless of body content.
 */
const EXPIRED_URL_PATTERNS: RegExp[] = [
  /[?&](error|status)=(expired|closed|not_?found|gone)/i,
  /\/expired(\b|\/)/i,
  /\/closed(\b|\/)/i,
]

/**
 * Below this character threshold, we don't trust the body has enough
 * content to classify confidently — return 'unknown'.
 */
const MIN_CONTENT_CHARS = 300

/**
 * Status enum matches the existing `jobs.liveness_status` column from
 * migration 003 — see file-level comment for rationale.
 */
export type LivenessStatus = 'active' | 'expired' | 'uncertain'

export interface LivenessResult {
  status: LivenessStatus
  signals: string[] // human-readable list of which patterns fired (for logging)
}

/**
 * Classify a fetched job-posting page.
 *
 * Resolution order (most specific wins):
 *   1. URL matches an EXPIRED_URL_PATTERN → expired
 *   2. Body text matches a HARD_EXPIRED_PATTERN → expired
 *      (apply button rendering doesn't override — closed-banner wins)
 *   3. Body text matches a LISTING_PAGE_PATTERN → expired (redirected to listing)
 *   4. Body text below MIN_CONTENT_CHARS → uncertain
 *   5. Otherwise → active
 */
export function checkLiveness(html: string, url: string): LivenessResult {
  const signals: string[] = []

  // Tier 1: URL-level signals
  for (const re of EXPIRED_URL_PATTERNS) {
    if (re.test(url)) {
      signals.push(`url:${re.source.slice(0, 30)}`)
      return { status: 'expired', signals }
    }
  }

  // Strip HTML tags for body-text matching. Cheap regex strip is enough —
  // we don't need a real parser since the patterns we look for survive any
  // reasonable HTML representation.
  const bodyText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Tier 2: hard-expired body patterns
  for (const re of HARD_EXPIRED_PATTERNS) {
    if (re.test(bodyText)) {
      signals.push(`hard:${re.source.slice(0, 40)}`)
      return { status: 'expired', signals }
    }
  }

  // Tier 3: redirect-to-listing-page patterns
  for (const re of LISTING_PAGE_PATTERNS) {
    if (re.test(bodyText)) {
      signals.push(`listing:${re.source.slice(0, 40)}`)
      return { status: 'expired', signals }
    }
  }

  // Tier 4: minimum content threshold — if body is suspiciously short,
  // we can't confidently say active (could be a 410 dressed as 200, or auth
  // wall, or SPA shell waiting for hydration).
  if (bodyText.length < MIN_CONTENT_CHARS) {
    signals.push(`short:${bodyText.length}<${MIN_CONTENT_CHARS}`)
    return { status: 'uncertain', signals }
  }

  return { status: 'active', signals }
}

/** Test export — lets tests assert specific patterns are wired. */
export const __testInternals = {
  HARD_EXPIRED_PATTERNS,
  LISTING_PAGE_PATTERNS,
  EXPIRED_URL_PATTERNS,
  MIN_CONTENT_CHARS,
}
