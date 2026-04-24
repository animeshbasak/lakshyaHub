import { describe, it, expect } from 'vitest'
import { classifyLiveness, type LivenessInput } from '@/lib/careerops/livenessClassifier'

const base: LivenessInput = {
  httpStatus: 200,
  finalUrl: 'https://example.com/jobs/123',
  bodyText: 'Senior AI Engineer. Requirements: 5 years experience. Apply now.',
  hasApplyControl: true,
}

describe('classifyLiveness', () => {
  it('returns active when apply control present and content sufficient', () => {
    expect(classifyLiveness(base).status).toBe('active')
  })

  it('returns expired on HTTP 404', () => {
    expect(classifyLiveness({ ...base, httpStatus: 404 }).status).toBe('expired')
  })

  it('returns expired on HTTP 410', () => {
    expect(classifyLiveness({ ...base, httpStatus: 410 }).status).toBe('expired')
  })

  it('returns expired on hard-expired English pattern', () => {
    const input = { ...base, bodyText: 'This position has been filled. No longer accepting applications.' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on German "bereits besetzt" pattern', () => {
    const input = { ...base, bodyText: 'Diese Position ist bereits besetzt.' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on French "expirée" pattern', () => {
    const input = { ...base, bodyText: "Cette offre d'emploi est expirée." }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on listing page redirect', () => {
    const input = { ...base, bodyText: '42 jobs found. Filter by location.', hasApplyControl: false }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on URL error param', () => {
    const input = { ...base, finalUrl: 'https://example.com/jobs?error=true' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired when content under 300 chars', () => {
    const input = { ...base, bodyText: 'Short nav. Footer.', hasApplyControl: false }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns uncertain when content present but no apply control', () => {
    const input = {
      ...base,
      bodyText: 'Senior AI Engineer role description with enough content. '.repeat(20),
      hasApplyControl: false,
    }
    expect(classifyLiveness(input).status).toBe('uncertain')
  })

  it('includes reason string', () => {
    const result = classifyLiveness({ ...base, httpStatus: 404 })
    expect(result.reason).toMatch(/http|404/i)
  })
})
