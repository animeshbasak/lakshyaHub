/**
 * Tokens that almost every job title shares — must NOT count as dedup signal.
 *
 * Ported from career-ops `merge-tracker.mjs:76-95` (commit 7821113), extended
 * with Indian cities (Noida, Gurgaon, Gurugram, Kolkata) that lakshya targets.
 *
 * The matcher (roleSimilarity.roleFuzzyMatch) filters these out before
 * computing token overlap. Without this, "Senior Engineer Bangalore" and
 * "Senior Engineer Mumbai" falsely dedup because they share `senior` +
 * `engineer` + (location-stripped) tokens.
 */
export const ROLE_STOPWORDS: ReadonlySet<string> = new Set([
  // seniority / level
  'junior', 'mid', 'middle', 'senior', 'staff', 'principal', 'lead', 'head',
  'chief', 'associate', 'intern', 'entry', 'level',
  // contract / mode
  'remote', 'hybrid', 'onsite', 'contract', 'contractor', 'freelance',
  'fulltime', 'parttime', 'permanent', 'temporary', 'internship',
  // generic job words
  'role', 'position', 'opportunity', 'team', 'based',
  // very common locations — Indian
  'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai',
  'noida', 'gurgaon', 'gurugram', 'kolkata',
  // very common locations — international
  'london', 'berlin', 'paris', 'madrid', 'barcelona', 'amsterdam', 'dublin',
  'york', 'francisco', 'seattle', 'boston', 'austin', 'chicago', 'toronto',
  'tokyo', 'singapore', 'sydney', 'melbourne', 'lisbon', 'warsaw',
  // regions / countries
  'europe', 'emea', 'apac', 'latam', 'americas', 'india', 'spain', 'germany',
  'france', 'italy', 'canada', 'brazil', 'mexico', 'japan',
  // prepositions leaking through length filter
  'with', 'from', 'into', 'over', 'this', 'that',
])

/**
 * Tokens that ARE meaningful even though they're ≤3 chars long. The default
 * length filter drops anything ≤3, but these are role differentiators we
 * must preserve: "AI Engineer" vs "Backend Engineer" are distinct roles.
 */
export const SHORT_TOKEN_ALLOWLIST: ReadonlySet<string> = new Set([
  'ai', 'ml', 'qa', 'ux', 'ui', 'go', 'js', 'ts', 'cv',
])
