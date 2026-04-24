import { describe, it, expect } from 'vitest'
import { normalizeStatus, CANONICAL_STATES, statusRank, STATUS_ALIASES } from '@/lib/careerops/canonicalStates'

describe('canonicalStates', () => {
  it('exports 8 canonical states', () => {
    expect(CANONICAL_STATES).toEqual([
      'Evaluated', 'Applied', 'Responded', 'Interview',
      'Offer', 'Rejected', 'Discarded', 'SKIP',
    ])
  })

  it('normalizes Spanish aliases to English', () => {
    expect(normalizeStatus('Aplicado')).toBe('Applied')
    expect(normalizeStatus('Rechazado')).toBe('Rejected')
    expect(normalizeStatus('Evaluada')).toBe('Evaluated')
  })

  it('is case-insensitive and trims', () => {
    expect(normalizeStatus('  applied  ')).toBe('Applied')
    expect(normalizeStatus('INTERVIEW')).toBe('Interview')
  })

  it('returns SKIP for unknown statuses', () => {
    expect(normalizeStatus('garbage')).toBe('SKIP')
  })

  it('ranks higher states above lower ones', () => {
    expect(statusRank('Offer')).toBeGreaterThan(statusRank('Applied'))
    expect(statusRank('Interview')).toBeGreaterThan(statusRank('Evaluated'))
    expect(statusRank('Rejected')).toBeLessThan(statusRank('Offer'))
  })

  it('STATUS_ALIASES is non-empty', () => {
    expect(Object.keys(STATUS_ALIASES).length).toBeGreaterThan(0)
  })
})
