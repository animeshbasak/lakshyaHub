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
  const canonical = parseCanonical(text)
  if (canonical) return canonical
  return parseFallback(text)
}

function parseCanonical(text: string): ScoreSummary | null {
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

/**
 * Fallback for evaluations produced before the operating-rules tightening
 * (or by providers that didn't follow the verbatim summary block). Career-ops
 * prompts are originally Spanish, so we accept the inline labels they emit:
 *   **Empresa:** Acme   **Score:** 4.0/5
 *   **Rol:** SDR        **Arquetipo:** ai-platform-engineer
 *   **Legitimidad:** caution
 */
function parseFallback(text: string): ScoreSummary | null {
  // Score summaries live at the END of the report. Scoping the regex search
  // to the tail eliminates false-positive matches on Spanish field labels
  // that happen to appear inside a Block F bullet. (Reviewer flagged this.)
  const tail = text.length > 1500 ? text.slice(-1500) : text
  const inline = (keys: string[]) => {
    for (const k of keys) {
      const m = tail.match(new RegExp(`\\*{0,2}${k}\\*{0,2}\\s*[:\\-]\\s*\\*{0,2}\\s*([^\\n*]+)`, 'i'))
      if (m) return m[1].trim()
    }
    return undefined
  }

  const company = inline(['COMPANY', 'Empresa', 'Company'])
  const role = inline(['ROLE', 'Rol', 'Role', 'Puesto'])
  const scoreStr = inline(['SCORE', 'Score', 'Puntaje', 'Puntuaci[oó]n'])
  const archetypeRaw = inline(['ARCHETYPE', 'Arquetipo', 'Archetype'])
  const legitRaw = inline(['LEGITIMACY', 'Legitimidad', 'Legitimacy'])

  if (!company || !role || !scoreStr || !archetypeRaw || !legitRaw) return null

  const score = parseFloat(scoreStr.replace(/\/5$/i, '').replace(/[^\d.]/g, ''))
  if (Number.isNaN(score)) return null

  const legitimacy = normalizeLegitimacy(legitRaw)
  if (!legitimacy) return null

  return { company, role, score, archetype: archetypeRaw.toLowerCase(), legitimacy }
}

function normalizeLegitimacy(raw: string): ScoreSummary['legitimacy'] | null {
  const v = raw.toLowerCase()
  if (/(suspici|fraud|scam|sospech)/.test(v)) return 'suspicious'
  if (/(caution|caut|proceed.*caution|precauci)/.test(v)) return 'caution'
  if (/(high|legit|proceed|alta|aprob)/.test(v)) return 'high'
  return null
}
