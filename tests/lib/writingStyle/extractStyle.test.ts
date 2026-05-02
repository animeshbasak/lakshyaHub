import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the taskRunner BEFORE importing extractStyle so the import wires
// against the mock. Each test sets the mock's behaviour separately.
vi.mock('../../../src/lib/ai/taskRunner', () => ({
  runWritingStyleExtractionTask: vi.fn(),
}))

import { extractStyle, type RawSample } from '../../../src/lib/writingStyle/extractStyle'
import { runWritingStyleExtractionTask } from '../../../src/lib/ai/taskRunner'

const validProfile = {
  tone: 'direct',
  avgSentenceLength: 'short' as const,
  openingPattern: 'leads with conclusion',
  punctuationHabits: 'em-dashes; rare exclamation',
  vocabularyPrefs: 'Anglo-Saxon',
  structurePatterns: 'conclusion-first',
  voiceSignatures: '"fwiw", "tbh"',
  avoidList: ['leverage', 'synergy'],
}

const sampleA: RawSample = {
  filename: 'email-1.txt',
  content: 'Hey team, quick update — shipped the migration yesterday. Tests pass. Next: dashboard polish.',
  created_at: '2026-04-30T10:00:00Z',
}

const sampleWithPII: RawSample = {
  filename: 'pii-email.txt',
  content: 'Reach me at alice@example.com or +91 98765 43210. Visit https://alice.dev for context.',
  created_at: '2026-05-01T10:00:00Z',
}

describe('extractStyle — happy path', () => {
  beforeEach(() => {
    vi.mocked(runWritingStyleExtractionTask).mockResolvedValue({
      success: true,
      output: validProfile,
    })
  })

  it('returns the validated profile + sample count', async () => {
    const r = await extractStyle([sampleA])
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.profile.tone).toBe('direct')
      expect(r.sampleCount).toBe(1)
      expect(r.inputBytes).toBeGreaterThan(0)
    }
  })

  it('passes PII-stripped content to the LLM (no email/phone/url)', async () => {
    await extractStyle([sampleWithPII])
    const lastCall = vi.mocked(runWritingStyleExtractionTask).mock.calls.at(-1)
    const userPrompt = lastCall?.[1] ?? ''
    expect(userPrompt).toContain('[email]')
    expect(userPrompt).toContain('[phone]')
    expect(userPrompt).toContain('[url]')
    expect(userPrompt).not.toContain('alice@example.com')
    expect(userPrompt).not.toContain('+91 98765')
    expect(userPrompt).not.toContain('https://alice.dev')
  })

  it('packs most-recent samples first (sort by created_at desc)', async () => {
    const older = { ...sampleA, filename: 'older.txt', content: 'OLDER_MARKER', created_at: '2026-01-01T00:00:00Z' }
    const newer = { ...sampleA, filename: 'newer.txt', content: 'NEWER_MARKER', created_at: '2026-04-30T10:00:00Z' }
    await extractStyle([older, newer])
    const userPrompt = vi.mocked(runWritingStyleExtractionTask).mock.calls.at(-1)?.[1] ?? ''
    expect(userPrompt.indexOf('NEWER_MARKER')).toBeLessThan(userPrompt.indexOf('OLDER_MARKER'))
  })
})

describe('extractStyle — failure paths', () => {
  it('returns no_samples when input is empty', async () => {
    const r = await extractStyle([])
    expect(r.success).toBe(false)
    if (!r.success) expect(r.code).toBe('no_samples')
  })

  it('returns extraction_failed when LLM call returns success=false', async () => {
    vi.mocked(runWritingStyleExtractionTask).mockResolvedValue({
      success: false,
      error: 'all providers failed',
    })
    const r = await extractStyle([sampleA])
    expect(r.success).toBe(false)
    if (!r.success) expect(r.code).toBe('extraction_failed')
  })

  it('returns invalid_response when LLM output fails Zod schema', async () => {
    vi.mocked(runWritingStyleExtractionTask).mockResolvedValue({
      success: true,
      output: { tone: 'short' /* missing 7 fields */ },
    })
    const r = await extractStyle([sampleA])
    expect(r.success).toBe(false)
    if (!r.success) expect(r.code).toBe('invalid_response')
  })

  it('returns invalid_response when avgSentenceLength is not in enum', async () => {
    vi.mocked(runWritingStyleExtractionTask).mockResolvedValue({
      success: true,
      output: { ...validProfile, avgSentenceLength: 'enormous' },
    })
    const r = await extractStyle([sampleA])
    expect(r.success).toBe(false)
    if (!r.success) expect(r.code).toBe('invalid_response')
  })
})
