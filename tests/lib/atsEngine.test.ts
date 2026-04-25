/**
 * Smoke test for the restored heuristic ATS scoring engine.
 * Locks the contract that ATSScorePanel + AIPanel depend on so the engine
 * can never silently regress to returning null again (this is what broke
 * yesterday).
 */
import { describe, it, expect } from 'vitest'
import { calculateATSScore, ATS_CHECKS, assessParseQuality } from '@/lib/atsEngine'
import type { ResumeData } from '@/types'

const emptyHeader = {
  name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
}

const minimalEmpty: ResumeData = {
  id: 'test',
  name: '',
  template: 'modern',
  header: emptyHeader,
  summary: ['', '', ''],
  skills: [],
  experience: [],
  education: [],
  projects: [],
  competencies: [],
}

const populated: ResumeData = {
  id: 'test',
  name: 'Animesh',
  template: 'modern',
  header: {
    name: 'Animesh Basak',
    title: 'Lead Engineer',
    email: 'animesh@example.com',
    phone: '+91 99999 99999',
    location: 'Bengaluru, India',
    linkedin: 'linkedin.com/in/animesh',
    portfolio: 'animesh.dev',
  },
  summary: [
    'Lead engineer with 8+ years building distributed systems and AI platforms.',
    'Mentored 12 engineers; led migrations of 200+ services to Kubernetes.',
    'Strong in TypeScript, Go, Python, and AWS/GCP with Terraform.',
  ],
  skills: [
    { id: 's1', category: 'Languages', values: 'TypeScript, Python, Go, Rust, SQL' },
    { id: 's2', category: 'Infra', values: 'Kubernetes, Docker, Terraform, AWS, GCP' },
    { id: 's3', category: 'AI', values: 'PyTorch, LangChain, vector DBs, RAG' },
  ],
  experience: [
    {
      id: 'e1',
      company: 'Acme',
      title: 'Lead Engineer',
      period: '2023 — Present',
      scale: '50M MAU',
      bullets: [
        { id: 'b1', text: 'Led migration of 200+ services to Kubernetes, reducing deploy time by 40%.' },
        { id: 'b2', text: 'Architected multi-region failover, achieving 99.99% SLA over 12 months.' },
        { id: 'b3', text: 'Mentored 6 engineers; promoted 3 to senior in 18 months.' },
      ],
    },
  ],
  education: [
    { id: 'edu1', institution: 'IIT', degree: 'B.Tech CS', period: '2014 — 2018', grade: '8.5/10' },
  ],
  projects: [],
  competencies: [],
}

describe('atsEngine', () => {
  describe('ATS_CHECKS catalogue', () => {
    it('exposes a non-empty checks list', () => {
      expect(ATS_CHECKS.length).toBeGreaterThan(10)
    })

    it('every check has the required shape', () => {
      for (const c of ATS_CHECKS) {
        expect(c.id).toBeTypeOf('string')
        expect(c.label).toBeTypeOf('string')
        expect(c.weight).toBeGreaterThan(0)
        expect(c.tip).toBeTypeOf('string')
        expect(['keywords', 'position', 'baseline']).toContain(c.pillar)
        expect(typeof c.test).toBe('function')
      }
    })

    it('check IDs are unique', () => {
      const ids = ATS_CHECKS.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('assessParseQuality', () => {
    it('flags an empty resume as unparseable', () => {
      expect(assessParseQuality(minimalEmpty)).toBe('unparseable')
    })

    it('rates a populated resume above unparseable', () => {
      expect(assessParseQuality(populated)).not.toBe('unparseable')
    })
  })

  describe('calculateATSScore', () => {
    it('returns an unparseable error for an empty resume', () => {
      const r = calculateATSScore(minimalEmpty)
      expect(r.error).toBe('unparseable')
      expect(r.score).toBe(0)
    })

    it('returns a score between 0 and 100 for a populated resume', () => {
      const r = calculateATSScore(populated)
      expect(r.error).toBeUndefined()
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
    })

    it('exposes pillarScores for keywords/position/baseline', () => {
      const r = calculateATSScore(populated)
      expect(r.pillarScores).toBeDefined()
      expect(r.pillarScores!.keywords).toBeGreaterThanOrEqual(0)
      expect(r.pillarScores!.position).toBeGreaterThanOrEqual(0)
      expect(r.pillarScores!.baseline).toBeGreaterThanOrEqual(0)
    })

    it('emits a grade with label/desc for downstream rendering', () => {
      const r = calculateATSScore(populated)
      expect(r.grade?.label).toBeTypeOf('string')
      expect(r.grade?.desc).toBeTypeOf('string')
    })

    it('separates failing and passing checks; both arrays are well-typed', () => {
      const r = calculateATSScore(populated)
      const total = (r.failing?.length ?? 0) + (r.passing?.length ?? 0)
      expect(total).toBe(ATS_CHECKS.length)
      for (const fail of r.failing ?? []) {
        expect(fail.specificTip).toBeTypeOf('string')
        expect(fail.passed).toBe(false)
      }
      for (const pass of r.passing ?? []) {
        expect(pass.passed).toBe(true)
      }
    })

    it('a stronger resume scores higher than a weaker one', () => {
      const weaker: ResumeData = {
        ...populated,
        skills: [{ id: 's-weak', category: 'Tools', values: 'Excel' }],
      }
      const strong = calculateATSScore(populated)
      const weak = calculateATSScore(weaker)
      expect(strong.score).toBeGreaterThan(weak.score)
    })

    it('does not throw on partial/missing fields', () => {
      const partial: ResumeData = { ...populated, summary: ['', '', ''], skills: [] }
      expect(() => calculateATSScore(partial)).not.toThrow()
    })
  })
})
