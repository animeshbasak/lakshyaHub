/**
 * Story matcher — given an evaluation (archetype + report markdown) and a
 * user's story bank, surface the 1-3 stories most relevant to the gaps
 * the eval flagged.
 *
 * Pure data shaping, no LLM call. Score = sum of:
 *   +3   if story.archetype matches eval.archetype
 *   +2   per story.tag that appears in the eval report (case-insensitive,
 *        whole-word match)
 *   +1   per "gap signal" keyword from Block C/D ("missing X", "lacks Y",
 *        "no evidence of Z") that overlaps with story body text
 *
 * Top 3 by score are returned. Ties broken by recency (updated_at desc).
 * Stories that score 0 are excluded — no story is better than a wrong
 * story.
 */

export interface StoryForMatch {
  id: string
  title: string
  situation: string | null
  task: string | null
  action: string | null
  result: string | null
  reflection: string | null
  tags: string[]
  archetype: string | null
  updated_at: string | null
}

export interface MatchResult {
  story: StoryForMatch
  score: number
  reasons: string[]
}

const GAP_PATTERNS = [
  /\bmissing\s+([\w\- ]{2,30})\b/gi,
  /\blacks?\s+([\w\- ]{2,30})\b/gi,
  /\bno\s+evidence\s+of\s+([\w\- ]{2,30})\b/gi,
  /\bgap[s]?\s+(?:in|on|around)\s+([\w\- ]{2,30})\b/gi,
  /\bweakness[es]?\s+(?:in|on|around)\s+([\w\- ]{2,30})\b/gi,
]

export function extractGapKeywords(reportMd: string): string[] {
  const out = new Set<string>()
  for (const pattern of GAP_PATTERNS) {
    pattern.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = pattern.exec(reportMd)) !== null) {
      const kw = m[1].toLowerCase().trim()
      // Skip super-generic noise
      if (kw.length < 4) continue
      if (/^(the|some|any|your|this|that|these|those)\b/.test(kw)) continue
      out.add(kw)
    }
  }
  return Array.from(out)
}

export function matchStoriesToEval(
  evaluation: { archetype: string | null; report_md: string | null },
  stories: StoryForMatch[]
): MatchResult[] {
  if (stories.length === 0) return []
  const reportLower = (evaluation.report_md ?? '').toLowerCase()
  const gapKeywords = extractGapKeywords(evaluation.report_md ?? '')

  const scored = stories.map((s): MatchResult => {
    const reasons: string[] = []
    let score = 0

    if (evaluation.archetype && s.archetype && s.archetype === evaluation.archetype) {
      score += 3
      reasons.push(`Archetype match (${s.archetype})`)
    }

    for (const tag of s.tags) {
      if (!tag) continue
      const tagLower = tag.toLowerCase()
      const wholeWord = new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i')
      if (wholeWord.test(reportLower)) {
        score += 2
        reasons.push(`Tag "${tag}" appears in report`)
      }
    }

    if (gapKeywords.length > 0) {
      const body = [s.situation, s.task, s.action, s.result].filter(Boolean).join(' ').toLowerCase()
      for (const kw of gapKeywords) {
        if (body.includes(kw)) {
          score += 1
          reasons.push(`Addresses gap: "${kw}"`)
        }
      }
    }

    return { story: s, score, reasons }
  })

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const at = a.story.updated_at ? Date.parse(a.story.updated_at) : 0
      const bt = b.story.updated_at ? Date.parse(b.story.updated_at) : 0
      return bt - at
    })
    .slice(0, 3)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
