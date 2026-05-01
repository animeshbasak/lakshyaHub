import { describe, it, expect } from 'vitest'
import { PORTAL_SEEDS } from '@/data/portal-seeds'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/i

describe('portal seeds', () => {
  it('has at least 30 portals seeded', () => {
    expect(PORTAL_SEEDS.length).toBeGreaterThanOrEqual(30)
  })

  it('every slug matches the ATS scanner allowlist regex', () => {
    for (const s of PORTAL_SEEDS) {
      expect(SLUG_RE.test(s.slug), `slug "${s.slug}" failed`).toBe(true)
    }
  })

  it('every portal value is one of the supported ATS APIs', () => {
    for (const s of PORTAL_SEEDS) {
      expect(['greenhouse', 'ashby', 'lever']).toContain(s.portal)
    }
  })

  it('every entry has a non-empty company name', () => {
    for (const s of PORTAL_SEEDS) {
      expect(s.company.length).toBeGreaterThan(0)
    }
  })

  it('country is either IN or GLOBAL', () => {
    for (const s of PORTAL_SEEDS) {
      expect(['IN', 'GLOBAL']).toContain(s.country)
    }
  })

  it('slugs are unique within the seed list', () => {
    const slugs = PORTAL_SEEDS.map(s => `${s.portal}:${s.slug}`)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('includes at least one India-based portal', () => {
    expect(PORTAL_SEEDS.some(s => s.country === 'IN')).toBe(true)
  })
})
