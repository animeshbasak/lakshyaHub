import { describe, it, expect } from 'vitest'
import { buildStyleClause } from '../../../src/lib/writingStyle/buildStyleClause'
import type { WritingStyleProfile } from '../../../src/lib/writingStyle/types'

const sampleProfile: WritingStyleProfile = {
  tone: 'direct, lightly self-deprecating',
  avgSentenceLength: 'short',
  openingPattern: 'opens with a one-line conclusion, then unpacks',
  punctuationHabits: 'uses em-dashes liberally; rarely uses exclamation',
  vocabularyPrefs: 'Anglo-Saxon over Latinate; sparing tech jargon',
  structurePatterns: 'leads with conclusion, then evidence, then ask',
  voiceSignatures: 'occasional "fwiw", "tbh"; ends emails without sign-offs',
  avoidList: ['leverage', 'synergy', 'utilize', 'circle back'],
}

describe('buildStyleClause', () => {
  it('returns empty string for null profile', () => {
    expect(buildStyleClause(null)).toBe('')
  })

  it('returns empty string for undefined profile', () => {
    expect(buildStyleClause(undefined)).toBe('')
  })

  it('includes all 8 markers in output', () => {
    const out = buildStyleClause(sampleProfile)
    expect(out).toContain('Tone:')
    expect(out).toContain('Sentence length:')
    expect(out).toContain('How they open:')
    expect(out).toContain('Punctuation:')
    expect(out).toContain('Vocabulary:')
    expect(out).toContain('Structure:')
    expect(out).toContain('Voice signatures:')
    expect(out).toContain('AVOID')
  })

  it('embeds the actual descriptor values', () => {
    const out = buildStyleClause(sampleProfile)
    expect(out).toContain('direct, lightly self-deprecating')
    expect(out).toContain('em-dashes liberally')
    expect(out).toContain('Anglo-Saxon over Latinate')
  })

  it('caps avoidList output to 10 items', () => {
    const big = { ...sampleProfile, avoidList: Array.from({ length: 25 }, (_, i) => `word${i}`) }
    const out = buildStyleClause(big)
    expect(out).toContain('word0')
    expect(out).toContain('word9')
    expect(out).not.toContain('word10') // capped at 10
  })

  it('omits avoidList line when list is empty', () => {
    const noAvoid = { ...sampleProfile, avoidList: [] }
    const out = buildStyleClause(noAvoid)
    expect(out).not.toContain('AVOID')
  })

  it('output is compact (target <500 chars typical)', () => {
    expect(buildStyleClause(sampleProfile).length).toBeLessThan(900)
  })
})
