import { describe, it, expect } from 'vitest'
import { parseScoreSummary } from '@/lib/careerops/parseScoreSummary'

describe('parseScoreSummary', () => {
  it('extracts summary block from full A-G output', () => {
    const output = `
Block A: ...
Block G: Legitimacy...

---SCORE_SUMMARY---
COMPANY: Anthropic
ROLE: Senior AI Engineer
SCORE: 4.5/5
ARCHETYPE: ai-platform
LEGITIMACY: high
---END_SUMMARY---
`
    const result = parseScoreSummary(output)
    expect(result).toEqual({
      company: 'Anthropic',
      role: 'Senior AI Engineer',
      score: 4.5,
      archetype: 'ai-platform',
      legitimacy: 'high',
    })
  })

  it('returns null when no summary present', () => {
    expect(parseScoreSummary('no summary here')).toBeNull()
  })

  it('handles extra whitespace', () => {
    const output = `---SCORE_SUMMARY---
COMPANY:   Acme Inc
ROLE:  Engineer
SCORE: 3.0/5
ARCHETYPE: agentic
LEGITIMACY: caution
---END_SUMMARY---`
    expect(parseScoreSummary(output)?.company).toBe('Acme Inc')
  })

  it('falls back to inline Spanish labels when no summary block is emitted', () => {
    const output = `
**Empresa:** Globant
**Rol:** Senior Backend
**Score:** 4.0/5
**Arquetipo:** backend
**Legitimidad:** Proceed with Caution
`
    const result = parseScoreSummary(output)
    expect(result).toMatchObject({
      company: 'Globant',
      role: 'Senior Backend',
      score: 4.0,
      archetype: 'backend',
      legitimacy: 'caution',
    })
  })
})
