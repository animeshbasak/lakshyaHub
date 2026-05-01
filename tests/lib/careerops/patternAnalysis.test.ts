import { describe, it, expect } from 'vitest'
import {
  analyzePatterns,
  type EvaluationRow,
  type ApplicationRow,
} from '@/lib/careerops/patternAnalysis'

const ev = (overrides: Partial<EvaluationRow>): EvaluationRow => ({
  id: 'e' + Math.random(),
  archetype: 'frontend',
  score: 4.0,
  legitimacy_tier: 'high',
  company: 'Acme',
  role: 'Frontend',
  created_at: '2026-04-26T00:00:00Z',
  ...overrides,
})

const app = (overrides: Partial<ApplicationRow>): ApplicationRow => ({
  id: 'a' + Math.random(),
  status: 'applied',
  applied_at: '2026-04-26T00:00:00Z',
  job_id: null,
  ...overrides,
})

describe('analyzePatterns', () => {
  it('returns empty-state recommendation when no data', () => {
    const r = analyzePatterns([], [])
    expect(r.funnel.totalEvaluations).toBe(0)
    expect(r.recommendations[0].title).toMatch(/first evaluation/i)
  })

  it('computes funnel counts + ratios', () => {
    const evals = Array.from({ length: 10 }, () => ev({}))
    const apps: ApplicationRow[] = [
      ...Array.from({ length: 4 }, () => app({ status: 'applied' })),
      ...Array.from({ length: 2 }, () => app({ status: 'interview' })),
      app({ status: 'offer' }),
      ...Array.from({ length: 2 }, () => app({ status: 'rejected' })),
    ]
    const r = analyzePatterns(evals, apps)
    expect(r.funnel.totalEvaluations).toBe(10)
    expect(r.funnel.applied).toBe(4)
    expect(r.funnel.interview).toBe(2)
    expect(r.funnel.offer).toBe(1)
    expect(r.funnel.rejected).toBe(2)
    expect(r.funnel.applyRate).toBeCloseTo(0.4)
    expect(r.funnel.interviewRate).toBeCloseTo(0.5)
    expect(r.funnel.offerRate).toBeCloseTo(0.5)
  })

  it('breaks down by archetype, sorted by eval count', () => {
    const evals = [
      ...Array.from({ length: 5 }, () => ev({ archetype: 'frontend', score: 4.5 })),
      ...Array.from({ length: 3 }, () => ev({ archetype: 'backend', score: 3.8 })),
      ev({ archetype: null, score: 3.0 }),
    ]
    const r = analyzePatterns(evals, [])
    expect(r.archetypeBreakdown[0].archetype).toBe('frontend')
    expect(r.archetypeBreakdown[0].evaluations).toBe(5)
    expect(r.archetypeBreakdown[0].averageScore).toBeCloseTo(4.5)
    expect(r.archetypeBreakdown.find(a => a.archetype === 'unknown')).toBeDefined()
  })

  it('warns when most evals are below 3.0', () => {
    const evals = [
      ...Array.from({ length: 6 }, () => ev({ score: 2.0 })),
      ...Array.from({ length: 4 }, () => ev({ score: 4.0 })),
    ]
    const r = analyzePatterns(evals, [])
    expect(r.recommendations.some(rec => /below 3\.0/i.test(rec.title))).toBe(true)
  })

  it('flags critical when too many suspicious postings', () => {
    const evals = [
      ...Array.from({ length: 3 }, () => ev({ legitimacy_tier: 'suspicious' })),
      ...Array.from({ length: 4 }, () => ev({ legitimacy_tier: 'high' })),
    ]
    const r = analyzePatterns(evals, [])
    expect(r.recommendations.some(rec =>
      rec.severity === 'critical' && /suspicious/i.test(rec.title)
    )).toBe(true)
  })

  it('flags critical when applied >5 with low interview rate', () => {
    const evals = Array.from({ length: 10 }, () => ev({}))
    const apps = Array.from({ length: 8 }, () => app({ status: 'applied' }))
    const r = analyzePatterns(evals, apps)
    expect(r.recommendations.some(rec =>
      rec.severity === 'critical' && /going dark/i.test(rec.title)
    )).toBe(true)
  })

  it('score distribution buckets evaluations into low/mid/high', () => {
    const evals = [
      ev({ score: 2.5 }),
      ev({ score: 3.5 }),
      ev({ score: 4.5 }),
      ev({ score: 5.0 }),
    ]
    const r = analyzePatterns(evals, [])
    expect(r.scoreDistribution.find(b => b.bucket === 'low')!.count).toBe(1)
    expect(r.scoreDistribution.find(b => b.bucket === 'mid')!.count).toBe(1)
    expect(r.scoreDistribution.find(b => b.bucket === 'high')!.count).toBe(2)
  })
})
