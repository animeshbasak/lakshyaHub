/**
 * PII stripping for writing samples.
 *
 * Per the privacy contract in types.ts and migration 006: NEVER ship
 * verbatim user content to the LLM extractor. Strip name / email / phone /
 * URL / address-like patterns before the prompt — the LLM's job is style
 * extraction, not personal-detail recall.
 *
 * This is best-effort PII removal. Real production-grade PII redaction
 * needs a model (Microsoft Presidio, AWS Comprehend, etc); this is the
 * fast/local first line. Goal: make accidental leakage unlikely, not
 * cryptographically certain.
 */

// Order matters: more specific / longer patterns run first so they don't get
// partially eaten by greedy regexes downstream. Cards (13–19 digits) BEFORE
// phones (8–13 digits); SSNs before phones (the 3-2-4 dash format would
// otherwise be partially gobbled).
const PATTERNS: Array<{ name: string; re: RegExp; replacement: string }> = [
  // URLs first — strip them before phone digit-runs in URLs trip the phone
  // matcher.
  {
    name: 'url',
    re: /https?:\/\/[^\s<>"'`]+/g,
    replacement: '[url]',
  },
  // Email addresses
  {
    name: 'email',
    re: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    replacement: '[email]',
  },
  // Credit-card-like (13–19 digits with optional separators) — must run BEFORE
  // phone, otherwise the phone matcher (max 13 digits) eats the first chunk.
  {
    name: 'card',
    re: /\b(?:\d[ -]?){13,19}\b/g,
    replacement: '[card]',
  },
  // SSN-like (US): NNN-NN-NNNN — also before phone
  {
    name: 'ssn',
    re: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[id]',
  },
  // Phone numbers — international + Indian common formats
  // +1 (415) 555-1212 / +91 98765 43210 / 415-555-1212 / (415)555-1212
  {
    name: 'phone',
    re: /\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,5}[\s.-]?\d{4}/g,
    replacement: '[phone]',
  },
  // Postal addresses with house number — best-effort heuristic
  // "123 Main Street", "42 Park Ave"
  {
    name: 'address',
    re: /\b\d{1,5}\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/g,
    replacement: '[address]',
  },
]

export interface SanitizeResult {
  text: string
  /** Map of pattern-name → number of matches replaced. Useful for logging. */
  counts: Record<string, number>
}

/**
 * Strip common PII patterns from a writing-sample string. Returns the
 * sanitized text plus a count of replacements per pattern (for telemetry).
 */
export function sanitizePII(input: string): SanitizeResult {
  let text = input
  const counts: Record<string, number> = {}
  for (const { name, re, replacement } of PATTERNS) {
    const before = text
    text = text.replace(re, replacement)
    // Count replacements by counting how many distinct matches the regex made.
    const matches = before.match(re)
    counts[name] = matches ? matches.length : 0
  }
  return { text, counts }
}
