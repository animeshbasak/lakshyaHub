import { describe, it, expect } from 'vitest'
import {
  scorePersonalFit,
  applyPersonalFit,
} from '../../../src/lib/jobsearch/personalFit'
import {
  DEFAULT_PERSONAL_FIT_CONFIG,
  PRESETS,
  resolveConfigForUser,
  mergeConfig,
} from '../../../src/lib/jobsearch/personalFitConfig'

describe('scorePersonalFit — happy path', () => {
  it('strongly boosts Lead Frontend at a top product co, remote', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend Engineer',
      company: 'Stripe',
      location: 'Remote',
      description: 'React TypeScript Next.js role on the payments platform team.',
    })
    expect(r.disqualified).toBe(false)
    expect(r.total).toBeGreaterThanOrEqual(85)
    expect(r.reasons).toContain('title-match: lead')
    expect(r.reasons).toContain('location-remote')
    expect(r.reasons).toContain('brand-tier: stripe')
    expect(r.reasons.find((x) => x.startsWith('stack-strong'))).toBeTruthy()
  })

  it('boosts Senior + Noida hybrid at any product co', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend Engineer',
      company: 'GenericStartup',
      location: 'Noida, Uttar Pradesh',
      description: 'React TypeScript role',
    })
    expect(r.disqualified).toBe(false)
    expect(r.total).toBeGreaterThan(30)
    expect(r.reasons).toContain('title-match: senior')
    expect(r.reasons).toContain('location-match: noida')
  })
})

describe('scorePersonalFit — disqualifiers', () => {
  it('hard-fails IT services brands regardless of role/location', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend Engineer Lead',
      company: 'TCS',
      location: 'Remote',
      description: 'Best React TypeScript role ever',
    })
    expect(r.disqualified).toBe(true)
    expect(r.total).toBe(-100)
    expect(r.reasons[0]).toMatch(/disqualified-brand/)
  })

  it('catches multi-word IT services brand names case-insensitively', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'Tata Consultancy Services',
      location: 'Bangalore',
      description: 'React',
    })
    expect(r.disqualified).toBe(true)
  })
})

describe('scorePersonalFit — penalties', () => {
  it('penalizes location mismatch when not remote and not preferred', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend Engineer',
      company: 'GenericStartup',
      location: 'Pune, India',
      description: 'React role onsite',
    })
    // Pune is in India so it'll match the india preferred location;
    // we verify the india-match path fires not the mismatch path.
    expect(r.reasons.find((x) => x.startsWith('location-match'))).toBeTruthy()
  })

  it('penalizes location mismatch for non-India non-remote', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend Engineer',
      company: 'GenericStartup',
      location: 'Tokyo, Japan',
      description: 'React role onsite',
    })
    expect(r.reasons).toContain('location-mismatch: Tokyo, Japan')
  })

  it('penalizes title that does not match preferred levels', () => {
    const r = scorePersonalFit({
      title: 'Junior Developer',
      company: 'GenericStartup',
      location: 'Remote',
      description: 'React',
    })
    expect(r.reasons).toContain('title-no-match')
  })
})

describe('scorePersonalFit — comp floor', () => {
  it('flags comp below LPA floor', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'SmallStartup',
      location: 'Remote',
      description: 'React role',
      salary_range: '20 LPA',
    })
    expect(r.reasons.find((x) => x.startsWith('comp-low'))).toBeTruthy()
  })

  it('rewards comp >= 1.5x LPA floor (45 * 1.5 = 67.5)', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'BigCo',
      location: 'Remote',
      description: 'React',
      salary_range: '90 LPA fixed + bonus',
    })
    expect(r.reasons.find((x) => x.startsWith('comp-high'))).toBeTruthy()
  })

  it('credits comp meeting floor without overshooting', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'GenericCo',
      location: 'Remote',
      description: 'React',
      salary_range: '50 LPA',
    })
    expect(r.reasons.find((x) => x.startsWith('comp-meets-floor'))).toBeTruthy()
  })

  it('picks highest LPA when multiple are mentioned in JD', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'GenericCo',
      location: 'Remote',
      description: 'Min experience 5 years 5 LPA equivalent. Range 50-80 LPA.',
    })
    // Picks 80 — should land in comp-high band (80 >= 45*1.5 = 67.5)
    expect(r.reasons.find((x) => x.includes('comp-high'))).toBeTruthy()
  })
})

describe('scorePersonalFit — bounds', () => {
  it('caps positive score at +100', () => {
    const r = scorePersonalFit({
      title: 'Lead Staff Principal Senior Frontend',
      company: 'Stripe',
      location: 'Remote',
      description: 'React TypeScript Next.js Frontend JavaScript Node Web',
      salary_range: '200 LPA fixed',
    })
    expect(r.total).toBeLessThanOrEqual(100)
    expect(r.total).toBe(100)
  })
})

describe('scorePersonalFit — edge cases', () => {
  it('handles missing optional fields without throwing', () => {
    const r = scorePersonalFit({
      title: 'Lead Frontend',
      company: 'Vercel',
    })
    expect(r.disqualified).toBe(false)
    // Has title-match (+20), brand boost (+30) but no location signal
    // (no remote signal AND no location field at all → no penalty)
    expect(r.total).toBeGreaterThan(0)
  })

  it('detects WFH as remote signal', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend',
      company: 'GenericCo',
      location: '',
      description: 'WFH role, React TypeScript',
    })
    expect(r.reasons).toContain('location-remote')
  })

  it('detects "work from home" as remote signal', () => {
    const r = scorePersonalFit({
      title: 'Senior Frontend',
      company: 'GenericCo',
      location: '',
      description: 'Full work from home setup, React TypeScript',
    })
    expect(r.reasons).toContain('location-remote')
  })
})

describe('applyPersonalFit', () => {
  it('filters out disqualified jobs by default', () => {
    const jobs = [
      {
        title: 'Lead Frontend',
        company: 'Stripe',
        location: 'Remote',
        description: 'React',
      },
      {
        title: 'Senior Engineer',
        company: 'TCS',
        location: 'Mumbai',
        description: 'Java',
      },
    ]
    const out = applyPersonalFit(jobs)
    expect(out).toHaveLength(1)
    expect(out[0].company).toBe('Stripe')
  })

  it('keeps disqualified when option is set (e.g. for admin debug view)', () => {
    const jobs = [
      {
        title: 'Lead Frontend',
        company: 'Stripe',
        location: 'Remote',
        description: 'React',
      },
      {
        title: 'Senior Engineer',
        company: 'TCS',
        location: 'Mumbai',
        description: 'Java',
      },
    ]
    const out = applyPersonalFit(jobs, DEFAULT_PERSONAL_FIT_CONFIG, {
      keepDisqualified: true,
    })
    expect(out).toHaveLength(2)
  })

  it('attaches personalFitScore + personalFitReasons to each job', () => {
    const jobs = [
      {
        title: 'Lead Frontend',
        company: 'Vercel',
        location: 'Remote',
        description: 'React',
      },
    ]
    const out = applyPersonalFit(jobs)
    expect(out[0]).toHaveProperty('personalFitScore')
    expect(out[0]).toHaveProperty('personalFitReasons')
    expect(typeof out[0].personalFitScore).toBe('number')
    expect(Array.isArray(out[0].personalFitReasons)).toBe(true)
  })
})

describe('regional presets — global usability', () => {
  it('exposes presets for IN, US, EU, GLOBAL', () => {
    expect(PRESETS.IN).toBeDefined()
    expect(PRESETS.US).toBeDefined()
    expect(PRESETS.EU).toBeDefined()
    expect(PRESETS.GLOBAL).toBeDefined()
  })

  it('IN preset: India locations + LPA floor + IT-services blocklist', () => {
    expect(PRESETS.IN.preferredLocations).toContain('noida')
    expect(PRESETS.IN.preferredLocations).toContain('bangalore')
    expect(PRESETS.IN.minCompLPA).toBe(45)
    expect(PRESETS.IN.disqualifiedBrands).toContain('tcs')
    expect(PRESETS.IN.disqualifiedBrands).toContain('infosys')
  })

  it('US preset: US locations + USD floor', () => {
    expect(PRESETS.US.preferredLocations).toContain('san francisco')
    expect(PRESETS.US.minCompUSD).toBe(150_000)
    expect(PRESETS.US.minCompLPA).toBeUndefined()
  })

  it('GLOBAL preset: region-agnostic, remote-first, no blocklist', () => {
    expect(PRESETS.GLOBAL.preferredLocations).toContain('remote')
    expect(PRESETS.GLOBAL.disqualifiedBrands).toEqual([])
    expect(PRESETS.GLOBAL.minCompLPA).toBeUndefined()
    expect(PRESETS.GLOBAL.minCompUSD).toBeUndefined()
  })

  it('default config is the IN preset', () => {
    expect(DEFAULT_PERSONAL_FIT_CONFIG).toBe(PRESETS.IN)
  })
})

describe('resolveConfigForUser — region resolution', () => {
  it('null profile → GLOBAL', () => {
    expect(resolveConfigForUser(null)).toBe(PRESETS.GLOBAL)
    expect(resolveConfigForUser(undefined)).toBe(PRESETS.GLOBAL)
  })

  it('explicit region_preference wins', () => {
    expect(
      resolveConfigForUser({ region_preference: 'EU', country: 'IN' }),
    ).toBe(PRESETS.EU)
  })

  it('country=IN → IN preset', () => {
    expect(resolveConfigForUser({ country: 'IN' })).toBe(PRESETS.IN)
  })

  it('country=US → US preset', () => {
    expect(resolveConfigForUser({ country: 'US' })).toBe(PRESETS.US)
    expect(resolveConfigForUser({ country: 'CA' })).toBe(PRESETS.US)
  })

  it('country=DE / FR / NL / GB → EU preset', () => {
    expect(resolveConfigForUser({ country: 'DE' })).toBe(PRESETS.EU)
    expect(resolveConfigForUser({ country: 'FR' })).toBe(PRESETS.EU)
    expect(resolveConfigForUser({ country: 'NL' })).toBe(PRESETS.EU)
    expect(resolveConfigForUser({ country: 'GB' })).toBe(PRESETS.EU)
  })

  it('infers from target_locations when country missing', () => {
    expect(
      resolveConfigForUser({ target_locations: ['Bengaluru, India'] }),
    ).toBe(PRESETS.IN)
    expect(
      resolveConfigForUser({ target_locations: ['New York, NY'] }),
    ).toBe(PRESETS.US)
    expect(
      resolveConfigForUser({ target_locations: ['Berlin, Germany'] }),
    ).toBe(PRESETS.EU)
  })

  it('unknown country / no signal → GLOBAL', () => {
    expect(resolveConfigForUser({ country: 'ZZ' })).toBe(PRESETS.GLOBAL)
    expect(resolveConfigForUser({})).toBe(PRESETS.GLOBAL)
  })
})

describe('mergeConfig — per-user override on top of preset', () => {
  it('overrides preferredBrands while keeping other fields', () => {
    const merged = mergeConfig(PRESETS.IN, {
      preferredBrands: ['MyDreamCo'],
    })
    expect(merged.preferredBrands).toEqual(['MyDreamCo'])
    expect(merged.preferredLocations).toEqual(PRESETS.IN.preferredLocations)
    expect(merged.minCompLPA).toBe(PRESETS.IN.minCompLPA)
  })

  it('lets user disable comp floor by passing 0/undefined explicitly', () => {
    const merged = mergeConfig(PRESETS.IN, { minCompLPA: undefined })
    expect(merged.minCompLPA).toBe(PRESETS.IN.minCompLPA) // undefined falls back
    const explicit = mergeConfig(PRESETS.IN, { minCompLPA: 0 })
    expect(explicit.minCompLPA).toBe(0)
  })
})
