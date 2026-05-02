/**
 * Build a compact prompt fragment from a WritingStyleProfile.
 *
 * Injected into cover-letter / bullet-rewrite prompts so the LLM mimics
 * the user's voice instead of defaulting to GPT-generic. Designed to be
 * tight (~200 tokens max) so it doesn't crowd the JD/resume content.
 *
 * If the profile is null/undefined, returns an empty string and the
 * caller's prompt is unchanged (legacy behaviour).
 */

import type { WritingStyleProfile } from './types'

export function buildStyleClause(profile: WritingStyleProfile | null | undefined): string {
  if (!profile) return ''

  const lines = [
    `## Writing Style Calibration`,
    `Match the candidate's actual voice. Do NOT use GPT-default phrasing.`,
    ``,
    `- **Tone:** ${profile.tone}`,
    `- **Sentence length:** ${profile.avgSentenceLength}`,
    `- **How they open:** ${profile.openingPattern}`,
    `- **Punctuation:** ${profile.punctuationHabits}`,
    `- **Vocabulary:** ${profile.vocabularyPrefs}`,
    `- **Structure:** ${profile.structurePatterns}`,
    `- **Voice signatures:** ${profile.voiceSignatures}`,
  ]

  if (profile.avoidList && profile.avoidList.length > 0) {
    lines.push(`- **AVOID these words/phrases (the candidate does not use them):** ${profile.avoidList.slice(0, 10).join(', ')}`)
  }

  return lines.join('\n')
}
