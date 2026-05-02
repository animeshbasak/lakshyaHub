import { describe, it, expect } from 'vitest'
import { sanitizePII } from '../../../src/lib/writingStyle/sanitizePII'

describe('sanitizePII — PII patterns', () => {
  it('strips email addresses', () => {
    const r = sanitizePII('Hi, I am alice@example.com — please reach out.')
    expect(r.text).toContain('[email]')
    expect(r.text).not.toContain('alice@example.com')
    expect(r.counts.email).toBe(1)
  })

  it('strips multiple emails', () => {
    const r = sanitizePII('Contact me at a@b.com or x.y+nice@deep.co.in')
    expect(r.counts.email).toBe(2)
  })

  it('strips international phone numbers', () => {
    const r = sanitizePII('Reach me on +91 98765 43210')
    expect(r.text).toContain('[phone]')
    expect(r.counts.phone).toBeGreaterThanOrEqual(1)
  })

  it('strips US-formatted phones', () => {
    const r = sanitizePII('Call (415) 555-1212 today.')
    expect(r.text).toContain('[phone]')
  })

  it('strips URLs', () => {
    const r = sanitizePII('See https://github.com/alice/repo for details.')
    expect(r.text).toContain('[url]')
    expect(r.text).not.toContain('https://github.com')
  })

  it('strips SSN-like patterns', () => {
    const r = sanitizePII('SSN 123-45-6789 was leaked.')
    expect(r.text).toContain('[id]')
    expect(r.text).not.toContain('123-45-6789')
  })

  it('strips credit-card-like 16-digit runs', () => {
    const r = sanitizePII('Card 4242 4242 4242 4242 expired')
    expect(r.text).toContain('[card]')
    expect(r.text).not.toContain('4242 4242 4242 4242')
  })

  it('strips house-number style addresses', () => {
    const r = sanitizePII('Lives at 123 Main Street, Brooklyn.')
    expect(r.text).toContain('[address]')
  })

  it('preserves non-PII text content', () => {
    const r = sanitizePII('I prefer short sentences. Em-dashes — yes. Avoid corporate jargon.')
    expect(r.text).toBe('I prefer short sentences. Em-dashes — yes. Avoid corporate jargon.')
    expect(r.counts.email).toBe(0)
    expect(r.counts.phone).toBe(0)
  })

  it('handles empty input', () => {
    const r = sanitizePII('')
    expect(r.text).toBe('')
  })
})
