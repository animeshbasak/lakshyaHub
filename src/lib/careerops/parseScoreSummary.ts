export interface ScoreSummary {
  company: string
  role: string
  score: number
  archetype: string
  legitimacy: 'high' | 'caution' | 'suspicious'
}

/**
 * Lenient subset returned by `parseEvalDisplay` for render-time fallback when
 * the strict parser fails. Used by ScoreHero to recover SOMETHING from a
 * report whose LLM ignored rule 3 of the operating prompt.
 */
export interface PartialEvalDisplay {
  company: string | null
  role: string | null
  score: number | null
  archetype: string | null
  legitimacy: 'high' | 'caution' | 'suspicious' | null
}

const BLOCK_RE = /---SCORE_SUMMARY---([\s\S]*?)---END_SUMMARY---/
const FIELD_RE = (key: string) => new RegExp(`${key}:\\s*(.+)`, 'i')

export function parseScoreSummary(text: string): ScoreSummary | null {
  const canonical = parseCanonical(text)
  if (canonical) return canonical
  return parseFallback(text)
}

/**
 * Best-effort recovery for ScoreHero rendering. Returns whatever fields we
 * can find — score may be null (LLM didn't emit), role may be null (no
 * archetype cell), etc. Caller renders graceful "pending" UI for missing.
 */
export function parseEvalDisplay(text: string): PartialEvalDisplay {
  const strict = parseScoreSummary(text)
  if (strict) {
    return {
      company: strict.company,
      role: strict.role,
      score: strict.score,
      archetype: strict.archetype,
      legitimacy: strict.legitimacy,
    }
  }

  // Strict parser failed. Mine the report for whatever we can recover.
  return {
    company: extractCompany(text),
    role: extractTableValue(text, ['archetype', 'arquetipo', 'role', 'rol', 'position', 'puesto']),
    score: extractScoreNumber(text),
    archetype: normalizeArchetype(extractTableValue(text, ['archetype', 'arquetipo'])),
    legitimacy: extractLegitimacy(text),
  }
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
 * prompts are originally Spanish, so we accept the inline labels they emit.
 *
 * Also handles markdown-table cell format that some LLMs prefer:
 *   | Archetype | Lead Frontend Engineer |
 *   | Score     | 4.0/5                  |
 */
function parseFallback(text: string): ScoreSummary | null {
  const tail = text.length > 1500 ? text.slice(-1500) : text
  const inline = (keys: string[]) => {
    for (const k of keys) {
      const m = tail.match(new RegExp(`\\*{0,2}${k}\\*{0,2}\\s*[:\\-]\\s*\\*{0,2}\\s*([^\\n*]+)`, 'i'))
      if (m) return m[1].trim()
    }
    return undefined
  }

  // Try inline labels first (Spanish/English).
  let company = inline(['COMPANY', 'Empresa', 'Company'])
  let role = inline(['ROLE', 'Rol', 'Role', 'Puesto'])
  let scoreStr = inline(['SCORE', 'Score', 'Puntaje', 'Puntuaci[oó]n'])
  let archetypeRaw = inline(['ARCHETYPE', 'Arquetipo', 'Archetype'])
  let legitRaw = inline(['LEGITIMACY', 'Legitimidad', 'Legitimacy'])

  // Then try markdown-table cells (LLMs frequently emit role-summary tables).
  company = company || extractTableValue(text, ['company', 'empresa']) || undefined
  role = role || extractTableValue(text, ['role', 'rol', 'position', 'puesto']) || undefined
  scoreStr = scoreStr || extractTableValue(text, ['score', 'puntaje']) || undefined
  archetypeRaw = archetypeRaw || extractTableValue(text, ['archetype', 'arquetipo']) || undefined
  legitRaw = legitRaw || extractTableValue(text, ['legitimacy', 'legitimidad']) || undefined

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

/**
 * Extract `<value>` from a markdown-table row of the form:
 *   | <key> | <value> |
 * Case-insensitive, accepts multiple key aliases. Returns the FIRST match.
 */
function extractTableValue(text: string, keys: string[]): string | null {
  for (const k of keys) {
    // Per-line match: optional bold around key, pipes, value cell, end pipe.
    const re = new RegExp(`\\|\\s*\\*{0,2}${k}\\*{0,2}\\s*\\|\\s*([^|\\n]+?)\\s*\\|`, 'i')
    const m = text.match(re)
    if (m) {
      const v = m[1].trim().replace(/^\*+|\*+$/g, '')
      if (v) return v
    }
  }
  return null
}

function extractScoreNumber(text: string): number | null {
  // Look for X.X/5 or X/5 anywhere — many LLMs put it in prose like
  // "Score: 4.0/5" or "I'd rate this 4.5/5".
  const m = text.match(/(\d+(?:\.\d)?)\s*\/\s*5\b/)
  if (!m) return null
  const n = parseFloat(m[1])
  if (Number.isNaN(n) || n < 0 || n > 5) return null
  return n
}

function extractLegitimacy(text: string): PartialEvalDisplay['legitimacy'] {
  // Inspect Block G content; default to caution when only a vague signal is present.
  const blockGRe = /(?:^|\n)#{1,3}\s*(?:Block\s+)?G\b[^\n]*\n([\s\S]*?)(?=(?:\n#{1,3}\s+(?:Block\s+)?[A-G]\b)|---SCORE_SUMMARY---|$)/i
  const m = text.match(blockGRe)
  const haystack = (m ? m[1] : text).toLowerCase()
  if (/(red\s*flag|suspici|fraud|scam|do\s*not\s*apply|likely\s+fake)/i.test(haystack)) return 'suspicious'
  if (/(caution|cautious|proceed\s*with\s*caution|yellow\s*flag|due\s*diligence)/i.test(haystack)) return 'caution'
  if (/(high\s*confidence|legitimate|reputable|established|proceed)/i.test(haystack)) return 'high'
  return null
}

function extractCompany(text: string): string | null {
  // Prose patterns: "at <Company>", "Company: <Name>", or a markdown-table cell.
  const fromTable = extractTableValue(text, ['company', 'empresa'])
  if (fromTable) return fromTable

  // Inline "**Company:** ..." or "Company: ..." anywhere
  const inlineRe = /\*{0,2}(?:Company|Empresa)\*{0,2}\s*[:\-]\s*([^\n|]+?)(?:\s*\||\n|$)/i
  const m = text.match(inlineRe)
  if (m) return m[1].trim()

  // "at <Capitalized Word>" inside a TL;DR paragraph — heuristic, last resort.
  const tldrRe = /at\s+([A-Z][A-Za-z][A-Za-z0-9.\- ]{1,40}?)(?=[\s.,]|focused|specializing|focusing)/
  const t = text.match(tldrRe)
  if (t) return t[1].trim()

  return null
}

function normalizeArchetype(raw: string | null): string | null {
  if (!raw) return null
  // Strip parens descriptors ("Lead Frontend Engineer (Architecture & Performance Focus)")
  // and produce a slug-like value if recognizable, otherwise return as-is.
  const stripped = raw.replace(/\s*\([^)]*\)\s*$/, '').trim()
  const lower = stripped.toLowerCase()
  // Match against known archetype slugs (kept loose so future archetypes work).
  if (/(ai\s*platform|llm\s*ops)/i.test(lower)) return 'ai-platform'
  if (/agentic/i.test(lower)) return 'agentic'
  if (/forward.?deployed/i.test(lower)) return 'forward-deployed'
  if (/solution.?architect/i.test(lower)) return 'solutions-architect'
  if (/transformation/i.test(lower)) return 'transformation'
  if (/ai\s*pm|ai\s*product\s*manager/i.test(lower)) return 'ai-pm'
  if (/full\s*stack/i.test(lower)) return 'fullstack'
  if (/back\s*end/i.test(lower)) return 'backend'
  if (/front\s*end/i.test(lower)) return 'frontend'
  if (/mobile/i.test(lower)) return 'mobile'
  if (/dev\s*ops|sre\b/i.test(lower)) return 'devops-sre'
  if (/data\s*engineer/i.test(lower)) return 'data-engineering'
  if (/security|infosec/i.test(lower)) return 'security'
  if (/engineering\s*manager|eng\s*manager/i.test(lower)) return 'engineering-manager'
  return stripped
}
