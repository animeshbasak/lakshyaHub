import { describe, it, expect } from 'vitest'
import {
  roleTokens,
  roleFuzzyMatch,
  canonicalRoleSignature,
} from '../../../src/lib/dedup/roleSimilarity'

describe('roleTokens — stopword + length filtering', () => {
  it('strips seniority + city + work-mode stopwords', () => {
    const tokens = roleTokens('Senior Backend Engineer Remote Bangalore')
    expect(tokens).toEqual(['backend', 'engineer'])
  })

  it('drops tokens ≤3 chars by default', () => {
    const tokens = roleTokens('Go and JS Engineer')
    // 'and' is 3 chars but stopword-listed; 'go' and 'js' are 2 chars but
    // allowlisted. 'engineer' is the long form.
    expect(tokens).toContain('engineer')
    expect(tokens).toContain('go')
    expect(tokens).toContain('js')
  })

  it('preserves AI/ML/QA/UX as role differentiators', () => {
    const ai = roleTokens('AI Engineer')
    const ml = roleTokens('ML Researcher')
    const qa = roleTokens('QA Lead')
    const ux = roleTokens('UX Designer')
    expect(ai).toContain('ai')
    expect(ml).toContain('ml')
    expect(qa).toContain('qa')
    expect(ux).toContain('ux')
  })

  it('returns empty array when input is all stopwords', () => {
    expect(roleTokens('Senior Lead Remote Bangalore Mumbai')).toEqual([])
  })

  it('lowercases + strips punctuation', () => {
    const tokens = roleTokens('Senior, Backend Engineer (Remote)')
    expect(tokens).toContain('backend')
    expect(tokens).toContain('engineer')
    expect(tokens).not.toContain('(remote)')
  })
})

describe('roleFuzzyMatch — same-role detection', () => {
  it('matches paraphrased same role across sources', () => {
    expect(
      roleFuzzyMatch(
        'Senior Backend Engineer at Stripe',
        'Backend Engineer (Senior) Stripe',
      ),
    ).toBe(true)
  })

  it('matches when only stopword/location differs', () => {
    expect(
      roleFuzzyMatch(
        'Senior Backend Engineer Bangalore',
        'Senior Backend Engineer Mumbai',
      ),
    ).toBe(true) // location is stopword; both reduce to backend+engineer
  })

  it('does NOT match unrelated roles sharing only generic words', () => {
    expect(
      roleFuzzyMatch(
        'Senior Backend Engineer at FooCorp',
        'Lead Frontend Architect at FooCorp',
      ),
    ).toBe(false) // overlap = 0 (backend ≠ frontend; engineer ≠ architect)
  })

  it('rejects when overlap < 2 even if ratio is high', () => {
    expect(
      roleFuzzyMatch('AI Engineer', 'AI Researcher'),
    ).toBe(false) // overlap = 1 (just 'ai'); min length 1, ratio 1.0 — but min overlap rule kicks in
  })

  it('rejects when ratio < 0.6 even with overlap >= 2', () => {
    expect(
      roleFuzzyMatch(
        'Backend Engineer Database Distributed Systems',
        'Backend Engineer Mobile iOS Performance Optimization Specialist',
      ),
    ).toBe(false) // overlap=2 (backend, engineer); min=4 (left side); ratio=0.5
  })

  it('returns false on empty token output (all stopwords)', () => {
    expect(roleFuzzyMatch('Senior Lead Remote', 'Senior Staff Hybrid')).toBe(false)
  })

  it('preserves AI/ML role distinctions via allowlist', () => {
    expect(
      roleFuzzyMatch('AI Engineer Senior', 'ML Engineer Senior'),
    ).toBe(false) // ai != ml; only 'engineer' overlaps (overlap=1)
  })
})

describe('canonicalRoleSignature', () => {
  it('produces stable token signature ignoring word order + case', () => {
    expect(canonicalRoleSignature('Senior Backend Engineer')).toBe(
      canonicalRoleSignature('engineer Backend SENIOR'),
    )
  })

  it('returns empty string for all-stopword titles', () => {
    expect(canonicalRoleSignature('Senior Remote')).toBe('')
  })

  it('preserves AI/ML differentiators in signature', () => {
    expect(canonicalRoleSignature('AI Engineer')).not.toBe(
      canonicalRoleSignature('ML Engineer'),
    )
  })
})
