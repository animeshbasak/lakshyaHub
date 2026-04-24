export interface ScoreSummary {
  company: string
  role: string
  score: number
  archetype: string
  legitimacy: 'high' | 'caution' | 'suspicious'
}

const BLOCK_RE = /---SCORE_SUMMARY---([\s\S]*?)---END_SUMMARY---/
const FIELD_RE = (key: string) => new RegExp(`${key}:\\s*(.+)`, 'i')

export function parseScoreSummary(text: string): ScoreSummary | null {
  const match = text.match(BLOCK_RE)
  if (!match) return null

  const body = match[1]
  const read = (k: string) => body.match(FIELD_RE(k))?.[1]?.trim()

  const company = read('COMPANY')
  const role = read('ROLE')
  const scoreStr = read('SCORE')
  const archetype = read('ARCHETYPE')
  const legitimacy = read('LEGITIMACY')?.toLowerCase()

  if (!company || !role || !scoreStr || !archetype || !legitimacy) return null

  const score = parseFloat(scoreStr.replace(/\/5$/, ''))
  if (Number.isNaN(score)) return null

  if (legitimacy !== 'high' && legitimacy !== 'caution' && legitimacy !== 'suspicious') {
    return null
  }

  return { company, role, score, archetype, legitimacy }
}
