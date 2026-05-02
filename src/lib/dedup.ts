// src/lib/dedup.ts

/**
 * SHA-256 hash of (title|canonicalTitle, company). Used as the unique-key
 * column on the `jobs` table to collapse cross-source duplicates.
 *
 * `canonicalTitle` (optional) is the stopword-filtered, sorted token signature
 * from `lib/dedup/roleSimilarity.canonicalRoleSignature`. When provided AND
 * non-empty, it replaces the raw title for hashing — meaning paraphrased
 * roles like "Senior Backend Engineer Bangalore" and "Backend Engineer
 * Mumbai" hash to the same value (city + seniority are stopwords).
 *
 * Gated at the call site by JOB_DEDUP_FUZZY env flag — when off, the
 * function behaves like the legacy raw-title hash.
 */
export async function computeDedupHash(
  title: string,
  company: string,
  canonicalTitle?: string,
): Promise<string> {
  const titleForHash = (canonicalTitle && canonicalTitle.length > 0 ? canonicalTitle : title)
    .toLowerCase()
    .trim()
  const input = `${titleForHash}${company.toLowerCase().trim()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
