import { describe, it, expect } from 'vitest'
import { parseScoreSummary, parseEvalDisplay } from '@/lib/careerops/parseScoreSummary'

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

  it('falls back to markdown-table cells when no summary block is emitted', () => {
    const output = `## Block A — Role Summary

| Dimension | Detail |
|:----------|:-------|
| Company   | Sprinklr |
| Role      | Lead Frontend Engineer |
| Score     | 4.0/5 |
| Archetype | frontend |
| Legitimacy | high |
`
    const result = parseScoreSummary(output)
    expect(result).toMatchObject({
      company: 'Sprinklr',
      role: 'Lead Frontend Engineer',
      score: 4.0,
      archetype: 'frontend',
      legitimacy: 'high',
    })
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

describe('parseEvalDisplay (lenient render-time fallback)', () => {
  it('returns full ScoreSummary when strict parser succeeds', () => {
    const md = `---SCORE_SUMMARY---
COMPANY: Acme
ROLE: SRE
SCORE: 4.5/5
ARCHETYPE: devops-sre
LEGITIMACY: high
---END_SUMMARY---`
    const r = parseEvalDisplay(md)
    expect(r).toEqual({
      company: 'Acme',
      role: 'SRE',
      score: 4.5,
      archetype: 'devops-sre',
      legitimacy: 'high',
    })
  })

  it('mines whatever it can when LLM ignored rule 3 (no summary block, partial table)', () => {
    const md = `## Block A — Role Summary

| Dimension | Detail |
|:----------|:-------|
| Archetype | Lead Frontend Engineer (Architecture & Performance Focus) |
| Domain | Unified Customer Experience Management |
| TL;DR | A Lead Frontend Engineer role at Sprinklr focused on driving architectural decisions |

## Block G — Legitimacy

This is a legitimate, well-known SaaS company. Proceed with confidence.`

    const r = parseEvalDisplay(md)
    expect(r.role).toBe('Lead Frontend Engineer (Architecture & Performance Focus)')
    expect(r.archetype).toBe('frontend')
    expect(r.legitimacy).toBe('high')
    expect(r.company).toBe('Sprinklr')
    expect(r.score).toBeNull() // LLM didn't emit one
  })

  it('extracts score from prose when no summary block exists', () => {
    const md = `## Block G — Legitimacy

Overall, I'd rate this 4.5/5. Strong fit.`
    const r = parseEvalDisplay(md)
    expect(r.score).toBe(4.5)
  })

  it('returns all-null PartialEvalDisplay for empty/garbage input', () => {
    expect(parseEvalDisplay('')).toEqual({
      company: null, role: null, score: null, archetype: null, legitimacy: null,
    })
    expect(parseEvalDisplay('just some prose')).toEqual({
      company: null, role: null, score: null, archetype: null, legitimacy: null,
    })
  })
})
