import { describe, it, expect } from 'vitest'
import { computeCadence, rankByCadence } from '@/lib/careerops/followupCadence'

const NOW = new Date('2026-04-26T12:00:00Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

describe('computeCadence', () => {
  it('returns null flag for "saved" status (not yet applied)', () => {
    expect(computeCadence({ status: 'saved', appliedAt: null, lastFollowupAt: null }, NOW)).toEqual({
      flag: null, dueAt: null,
    })
  })

  it('returns null flag for "offer" status (waiting on user)', () => {
    expect(computeCadence({ status: 'offer', appliedAt: daysAgo(10), lastFollowupAt: null }, NOW)).toEqual({
      flag: null, dueAt: null,
    })
  })

  it('returns "cold" flag for rejected', () => {
    const r = computeCadence({ status: 'rejected', appliedAt: daysAgo(20), lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('cold')
  })

  it('"applied" 3 days ago → ok (4 days until due)', () => {
    const r = computeCadence({ status: 'applied', appliedAt: daysAgo(3), lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('ok')
    expect(r.dueAt).toBeTruthy()
  })

  it('"applied" 6.5 days ago → urgent (within 24h of due)', () => {
    const ts = new Date(NOW.getTime() - 6.5 * 24 * 60 * 60 * 1000).toISOString()
    const r = computeCadence({ status: 'applied', appliedAt: ts, lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('urgent')
  })

  it('"applied" 10 days ago → overdue', () => {
    const r = computeCadence({ status: 'applied', appliedAt: daysAgo(10), lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('overdue')
  })

  it('"applied" 50 days ago, no followup → cold', () => {
    const r = computeCadence({ status: 'applied', appliedAt: daysAgo(50), lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('cold')
  })

  it('most-recent followup resets the cadence anchor', () => {
    // applied 14 days ago (would be overdue) but followed-up 3 days ago → ok
    const r = computeCadence({
      status: 'applied',
      appliedAt: daysAgo(14),
      lastFollowupAt: daysAgo(3),
    }, NOW)
    expect(r.flag).toBe('ok')
  })

  it('"interview" follows 1-day cadence', () => {
    const r = computeCadence({ status: 'interview', appliedAt: daysAgo(2), lastFollowupAt: null }, NOW)
    expect(r.flag).toBe('overdue') // applied 2d ago, interview cadence = 1d, due was 1d ago
  })
})

describe('rankByCadence', () => {
  const apps = [
    { id: 'a1', company: 'A', role: 'Eng',  status: 'applied' as const,    applied_at: daysAgo(20) },  // overdue
    { id: 'a2', company: 'B', role: 'Eng',  status: 'saved' as const,      applied_at: null },         // dropped
    { id: 'a3', company: 'C', role: 'Eng',  status: 'applied' as const,    applied_at: daysAgo(3) },   // ok
    { id: 'a4', company: 'D', role: 'Eng',  status: 'interview' as const,  applied_at: daysAgo(2) },   // overdue
    { id: 'a5', company: 'E', role: 'Eng',  status: 'rejected' as const,   applied_at: daysAgo(50) },  // cold
  ]
  const followups = new Map<string, string>()

  it('drops applications with no actionable cadence (saved)', () => {
    const r = rankByCadence(apps, followups, NOW)
    expect(r.find(x => x.applicationId === 'a2')).toBeUndefined()
  })

  it('puts overdue first, then urgent, then ok, then cold', () => {
    const r = rankByCadence(apps, followups, NOW)
    const order = r.map(x => x.flag)
    const overdueIdxs = order.map((f, i) => (f === 'overdue' ? i : -1)).filter(i => i >= 0)
    const okIdxs = order.map((f, i) => (f === 'ok' ? i : -1)).filter(i => i >= 0)
    const coldIdxs = order.map((f, i) => (f === 'cold' ? i : -1)).filter(i => i >= 0)
    expect(Math.max(...overdueIdxs)).toBeLessThan(Math.min(...okIdxs))
    expect(Math.max(...okIdxs)).toBeLessThan(Math.min(...coldIdxs))
  })
})
