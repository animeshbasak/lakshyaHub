/**
 * Writing-style extractor.
 *
 * Reads up to N user-uploaded writing samples, strips PII, packs them
 * into an LLM prompt, parses structured output into a
 * WritingStyleProfile.
 *
 * Provider strategy: reuses the existing taskRunner + provider fallback
 * (Groq → Gemini → Claude per route config). Style extraction is a JSON-
 * structured-output task — works fine on Groq's free tier with
 * llama-3.3-70b.
 *
 * Privacy: every input sample is sanitizePII'd before the LLM sees it.
 * The LLM is instructed to return ONLY categorical descriptors, never to
 * quote sample text verbatim. The output Zod schema enforces a hard
 * 300-char-per-field cap so even an LLM violation can't leak a full
 * sentence.
 */

import { runWritingStyleExtractionTask } from '@/lib/ai/taskRunner'
import { sanitizePII } from './sanitizePII'
import {
  WritingStyleProfileSchema,
  MAX_TOTAL_INPUT_BYTES,
  type WritingStyleProfile,
} from './types'

export interface RawSample {
  filename: string
  content: string
  /** ISO timestamp of upload — most-recent samples weighted higher in extraction. */
  created_at: string
}

export interface ExtractionResult {
  success: true
  profile: WritingStyleProfile
  sampleCount: number
  /** Total bytes after PII strip. Useful for cost telemetry. */
  inputBytes: number
}

export interface ExtractionError {
  success: false
  error: string
  code: 'no_samples' | 'extraction_failed' | 'invalid_response'
}

/**
 * Pack samples into prompt input. Most-recent first; truncate oldest first
 * to fit MAX_TOTAL_INPUT_BYTES so the prompt stays under typical 32k
 * context limits comfortably.
 */
function packSamples(samples: RawSample[]): { text: string; used: number } {
  const sorted = [...samples].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
  let total = 0
  const parts: string[] = []
  let used = 0
  for (const s of sorted) {
    const sanitized = sanitizePII(s.content).text
    const block = `\n\n--- sample ${used + 1} (${s.filename}) ---\n${sanitized}`
    if (total + block.length > MAX_TOTAL_INPUT_BYTES) break
    parts.push(block)
    total += block.length
    used++
  }
  return { text: parts.join(''), used }
}

const SYSTEM_PROMPT = `You are a writing-style analyst. Given samples of someone's actual writing (emails, posts, messages, etc), extract abstract style descriptors that capture HOW they write — not WHAT they write about.

CRITICAL RULES:
1. Output ONLY the descriptors, NEVER quote sample text verbatim.
2. Be specific and useful — descriptors will be used to bias future writing generation toward this person's voice.
3. If samples are short or sparse, infer cautiously and say so in the descriptor (e.g. "tentative — based on 2 short samples").
4. PII (names, emails, phones, urls) has been pre-stripped — replaced with [email], [phone], etc. Do NOT comment on them.
5. Return STRICT JSON matching this exact shape:

{
  "tone": "string (max 300 chars)",
  "avgSentenceLength": "short" | "medium" | "long" | "mixed",
  "openingPattern": "string (max 300 chars) — how they typically start paragraphs/messages",
  "punctuationHabits": "string (max 300 chars) — em-dashes? exclamation? semicolons?",
  "vocabularyPrefs": "string (max 300 chars) — Anglo-Saxon vs Latinate, jargon, register",
  "structurePatterns": "string (max 300 chars) — argument flow, openers, closers",
  "voiceSignatures": "string (max 300 chars) — distinctive verbal tics, e.g. 'fwiw', 'tbh', specific transitions",
  "avoidList": ["string", ...]  // up to 20 words/phrases the writer does NOT use
}

No prose. No markdown. Just the JSON object.`

export async function extractStyle(
  samples: RawSample[],
): Promise<ExtractionResult | ExtractionError> {
  if (samples.length === 0) {
    return { success: false, error: 'no writing samples provided', code: 'no_samples' }
  }

  const { text: packed, used } = packSamples(samples)
  if (packed.length === 0) {
    return {
      success: false,
      error: 'all samples exceeded size limits and were dropped',
      code: 'no_samples',
    }
  }

  const userPrompt = `Here are ${used} writing sample(s). Analyse them and return the JSON descriptor object.${packed}\n\nRemember: JSON only, no prose, no quoting.`

  const result = await runWritingStyleExtractionTask(SYSTEM_PROMPT, userPrompt)
  if (!result.success || !result.output) {
    return {
      success: false,
      error: result.error ?? 'extractor returned no output',
      code: 'extraction_failed',
    }
  }

  // Parse + validate via Zod. The schema enforces 300-char field caps so
  // even an LLM violation can't leak verbatim sample text.
  const parsed = WritingStyleProfileSchema.safeParse(result.output)
  if (!parsed.success) {
    return {
      success: false,
      error: `LLM output failed schema validation: ${parsed.error.message}`,
      code: 'invalid_response',
    }
  }

  return {
    success: true,
    profile: parsed.data,
    sampleCount: used,
    inputBytes: packed.length,
  }
}
