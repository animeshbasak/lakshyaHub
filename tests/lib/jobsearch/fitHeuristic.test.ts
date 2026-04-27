import { describe, it, expect } from 'vitest'
import { buildResumeTokens, scoreFit, applyFitScores } from '@/lib/jobsearch/fitHeuristic'
import type { JobSearchResult } from '@/lib/jobsearch/types'

const makeJob = (over: Partial<JobSearchResult>): JobSearchResult => ({
  url: over.url ?? `https://example.com/${Math.random()}`,
  title: over.title ?? 'Software Engineer',
  company: over.company ?? 'Acme',
  location: over.location ?? 'Remote',
  description: over.description ?? null,
  postedAt: over.postedAt ?? null,
  source: over.source ?? 'remotive',
  salary: over.salary ?? null,
  tags: over.tags ?? [],
})

describe('buildResumeTokens', () => {
  it('returns empty set when profile is null', () => {
    expect(buildResumeTokens(null).size).toBe(0)
  })

  it('returns empty set when all fields are empty', () => {
    expect(buildResumeTokens({ full_resume_text: null, target_titles: null, skills: null }).size).toBe(0)
  })

  it('combines full_resume_text + target_titles + skills', () => {
    const tokens = buildResumeTokens({
      full_resume_text: 'Lead React engineer with TypeScript',
      target_titles: ['Senior Frontend Engineer'],
      skills: ['Next.js', 'GraphQL'],
    })
    expect(tokens.has('react')).toBe(true)
    expect(tokens.has('typescript')).toBe(true)
    expect(tokens.has('frontend')).toBe(true)
    expect(tokens.has('next.js')).toBe(true)
    expect(tokens.has('graphql')).toBe(true)
  })

  it('drops common stopwords (the, with, and, etc.)', () => {
    const tokens = buildResumeTokens({
      full_resume_text: 'Software engineer with 7 years of experience',
      target_titles: null,
      skills: null,
    })
    expect(tokens.has('with')).toBe(false)
    expect(tokens.has('experience')).toBe(false)  // also a stopword
  })
})

describe('scoreFit', () => {
  const resumeTokens = buildResumeTokens({
    full_resume_text: 'Lead Frontend Engineer with React, TypeScript, Next.js, GraphQL, performance optimization, micro-frontends',
    target_titles: ['Lead Frontend', 'Staff Engineer'],
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Webpack'],
  })

  it('returns null when resume tokens are empty', () => {
    const job = makeJob({ title: 'Anything' })
    expect(scoreFit(job, new Set())).toBeNull()
  })

  it('a perfect-match JD scores high', () => {
    const job = makeJob({
      title: 'Senior Frontend Engineer (React + TypeScript)',
      description: 'Build with React, TypeScript, Next.js, GraphQL. Performance, micro-frontends, Webpack.',
    })
    const score = scoreFit(job, resumeTokens)!
    expect(score).toBeGreaterThan(50)
  })

  it('a totally unrelated JD scores low', () => {
    const job = makeJob({
      title: 'Pediatric Nurse',
      description: 'Provide nursing care for paediatric patients in hospital setting.',
    })
    const score = scoreFit(job, resumeTokens)!
    expect(score).toBeLessThan(15)
  })

  it('returns 0 for an empty JD (no signal)', () => {
    const job = makeJob({ title: '', description: null, tags: [] })
    expect(scoreFit(job, resumeTokens)).toBe(0)
  })

  it('scores 0-100 only', () => {
    for (let i = 0; i < 10; i++) {
      const job = makeJob({
        title: 'React TypeScript Frontend Lead Engineer Next.js GraphQL',
        description: 'react react react react react typescript typescript next.js graphql graphql webpack performance frontend lead engineer',
      })
      const score = scoreFit(job, resumeTokens)!
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})

describe('applyFitScores', () => {
  const resumeTokens = buildResumeTokens({
    full_resume_text: 'Lead React TypeScript Engineer',
    target_titles: ['Lead Frontend'],
    skills: ['React'],
  })

  it('attaches fitScore field to every job', () => {
    const jobs = [
      makeJob({ title: 'React Engineer' }),
      makeJob({ title: 'Pediatric Nurse' }),
    ]
    const out = applyFitScores(jobs, resumeTokens)
    expect(out.every(j => 'fitScore' in j)).toBe(true)
  })

  it('orders highest fitScore first', () => {
    const jobs = [
      makeJob({ title: 'Pediatric Nurse',           description: 'nursing care' }),
      makeJob({ title: 'React TypeScript Engineer', description: 'react typescript' }),
      makeJob({ title: 'Generic Software Eng',      description: 'software engineer' }),
    ]
    const out = applyFitScores(jobs, resumeTokens)
    expect(out[0].title).toContain('React')
    expect(out[2].title).toContain('Pediatric')
  })

  it('null fitScore (empty resume) keeps recency ordering', () => {
    const jobs = [
      makeJob({ title: 'A', postedAt: '2026-01-01T00:00:00Z' }),
      makeJob({ title: 'B', postedAt: '2026-04-01T00:00:00Z' }),
      makeJob({ title: 'C', postedAt: '2026-03-01T00:00:00Z' }),
    ]
    const out = applyFitScores(jobs, new Set())
    expect(out[0].title).toBe('B')
    expect(out[1].title).toBe('C')
    expect(out[2].title).toBe('A')
  })
})
