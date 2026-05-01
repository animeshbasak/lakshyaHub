import { describe, it, expect } from 'vitest'
import { snippet, tokenize, matchesQuery, regionMatch, rankByRecency } from '@/lib/jobsearch/util'
import type { JobSearchResult } from '@/lib/jobsearch/types'

describe('snippet', () => {
  it('strips HTML tags', () => {
    expect(snippet('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('decodes common entities', () => {
    expect(snippet('Tom &amp; Jerry &gt; Spike &lt; Tyke')).toBe('Tom & Jerry > Spike < Tyke')
  })

  it('truncates with ellipsis at maxLen', () => {
    const long = 'a'.repeat(600)
    const result = snippet(long, 100)
    expect(result?.length).toBeLessThanOrEqual(101)
    expect(result?.endsWith('…')).toBe(true)
  })

  it('returns null for empty input', () => {
    expect(snippet(null)).toBeNull()
    expect(snippet('')).toBeNull()
    expect(snippet('   ')).toBeNull()
  })
})

describe('tokenize', () => {
  it('lowercases and splits on whitespace + punctuation', () => {
    expect(tokenize('Senior Frontend Engineer')).toEqual(['senior', 'frontend', 'engineer'])
  })

  it('drops stopwords', () => {
    expect(tokenize('Engineer with React and TypeScript')).toEqual(['engineer', 'react', 'typescript'])
  })

  it('drops 1-char tokens', () => {
    expect(tokenize('a b c d e f g engineer')).toEqual(['engineer'])
  })
})

describe('matchesQuery', () => {
  it('matches when title contains any token whole-word', () => {
    expect(matchesQuery('Senior Frontend Engineer', tokenize('Frontend'))).toBe(true)
    expect(matchesQuery('Lead Backend Engineer', tokenize('Frontend'))).toBe(false)
  })

  it('does not match partial words', () => {
    // "fronted" isn't "frontend" — boundary matters
    expect(matchesQuery('fronted-end developer', tokenize('frontend'))).toBe(false)
  })

  it('matches when tokens is empty (no query → accept all)', () => {
    expect(matchesQuery('Anything goes', [])).toBe(true)
  })
})

describe('regionMatch', () => {
  const make = (loc: string | null) => ({ region: 'IN' as const, query: 'x' })

  it('IN matches Indian cities', () => {
    expect(regionMatch('Bangalore', make('Bangalore'))).toBe(true)
    expect(regionMatch('Mumbai, India', { region: 'IN', query: 'x' })).toBe(true)
    expect(regionMatch('Bengaluru', { region: 'IN', query: 'x' })).toBe(true)
  })

  it('IN matches "Remote" (allows Remote-from-India)', () => {
    expect(regionMatch('Remote', { region: 'IN', query: 'x' })).toBe(true)
  })

  it('IN does NOT match a US-only location', () => {
    expect(regionMatch('San Francisco, CA', { region: 'IN', query: 'x' })).toBe(false)
  })

  it('REMOTE accepts known remote keywords', () => {
    expect(regionMatch('Remote', { region: 'REMOTE', query: 'x' })).toBe(true)
    expect(regionMatch('Anywhere in the World', { region: 'REMOTE', query: 'x' })).toBe(true)
    expect(regionMatch('Work from home', { region: 'REMOTE', query: 'x' })).toBe(true)
  })

  it('REMOTE auto-passes for sources flagged as remote-only', () => {
    expect(regionMatch('Some city', { region: 'REMOTE', query: 'x' }, true)).toBe(true)
  })

  it('REMOTE rejects non-remote locations from non-remote sources', () => {
    expect(regionMatch('San Francisco, CA', { region: 'REMOTE', query: 'x' })).toBe(false)
  })

  it('GLOBAL accepts everything', () => {
    expect(regionMatch('San Francisco', { region: 'GLOBAL', query: 'x' })).toBe(true)
    expect(regionMatch(null, { region: 'GLOBAL', query: 'x' })).toBe(true)
  })
})

describe('rankByRecency', () => {
  const job = (postedAt: string | null): JobSearchResult => ({
    url: `u-${Math.random()}`,
    title: 't',
    company: 'c',
    location: 'l',
    description: null,
    postedAt,
    source: 's',
    salary: null,
    tags: [],
  })

  it('puts newest first', () => {
    const result = rankByRecency([
      job('2026-04-01T00:00:00Z'),
      job('2026-04-15T00:00:00Z'),
      job('2026-04-10T00:00:00Z'),
    ])
    expect(result[0].postedAt).toBe('2026-04-15T00:00:00Z')
    expect(result[2].postedAt).toBe('2026-04-01T00:00:00Z')
  })

  it('sinks null postedAt to the bottom', () => {
    const result = rankByRecency([
      job(null),
      job('2026-04-15T00:00:00Z'),
      job(null),
    ])
    expect(result[0].postedAt).toBe('2026-04-15T00:00:00Z')
    expect(result[2].postedAt).toBeNull()
  })
})
