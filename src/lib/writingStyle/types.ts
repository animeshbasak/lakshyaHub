/**
 * Writing-style calibration — types.
 *
 * Eight abstract descriptors extracted from the user's own writing samples
 * (emails, slack messages, blog posts, etc). Used to bias cover-letter
 * generation toward the user's actual voice — bypasses 2026 AI-detection
 * tools that flag generic LLM output.
 *
 * Privacy contract: descriptors are ABSTRACT, never verbatim. The extractor
 * (extractStyle.ts) runs PII-strip pre-LLM and the LLM is instructed to
 * return only categorical descriptors, never copy phrases from the input.
 */

import { z } from 'zod'

export const WritingStyleProfileSchema = z.object({
  /** Overall tone: e.g. "direct, lightly self-deprecating, prefers short over polished". */
  tone: z.string().min(1).max(300),
  /** Sentence length tendency: 'short' | 'medium' | 'long' | 'mixed'. */
  avgSentenceLength: z.enum(['short', 'medium', 'long', 'mixed']),
  /** Typical opening pattern: how the user starts paragraphs / messages. */
  openingPattern: z.string().min(1).max(300),
  /** Punctuation habits: e.g. "uses em-dashes liberally, avoids exclamation". */
  punctuationHabits: z.string().min(1).max(300),
  /** Vocabulary preferences: e.g. "Anglo-Saxon over Latinate; tech jargon precise but sparse". */
  vocabularyPrefs: z.string().min(1).max(300),
  /** Structure patterns: e.g. "leads with conclusion, then evidence, then ask". */
  structurePatterns: z.string().min(1).max(300),
  /** Distinctive voice signatures: e.g. "uses 'fwiw', 'tbh', occasional 'ngl'". */
  voiceSignatures: z.string().min(1).max(300),
  /** Anti-patterns: words/phrases the user does NOT use. */
  avoidList: z.array(z.string().min(1).max(80)).max(20),
})

export type WritingStyleProfile = z.infer<typeof WritingStyleProfileSchema>

export const MAX_SAMPLES_PER_USER = 20
export const MAX_SAMPLE_BYTES = 50_000
export const MAX_TOTAL_INPUT_BYTES = 80_000
