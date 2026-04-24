import { describe, it, expect, vi } from 'vitest'

describe('runEvaluation', () => {
  it('calls LLM with composed prompt and parses score summary', async () => {
    const mockLLM = vi.fn().mockResolvedValue(`
Block A-G content...

---SCORE_SUMMARY---
COMPANY: Acme
ROLE: AI Engineer
SCORE: 4.2/5
ARCHETYPE: ai-platform
LEGITIMACY: high
---END_SUMMARY---
`)

    const { runEvaluation } = await import('@/lib/careerops/evaluator')

    const result = await runEvaluation(
      {
        jdText: 'Senior AI Engineer at Acme. Build LLM platforms. 5+ years experience required.',
        cvMarkdown: '## Experience\nBuilt LLM platforms',
        userProfile: 'Target: platform roles',
      },
      { llm: mockLLM }
    )

    expect(result.summary?.score).toBe(4.2)
    expect(result.summary?.company).toBe('Acme')
    expect(result.summary?.archetype).toBe('ai-platform')
    expect(result.report).toContain('---SCORE_SUMMARY---')
    expect(mockLLM).toHaveBeenCalledOnce()
  })

  it('returns summary=null when LLM output lacks block', async () => {
    const mockLLM = vi.fn().mockResolvedValue('just some text, no summary')
    const { runEvaluation } = await import('@/lib/careerops/evaluator')
    const result = await runEvaluation(
      {
        jdText: 'x'.repeat(100),
        cvMarkdown: '## CV',
        userProfile: 'profile',
      },
      { llm: mockLLM }
    )
    expect(result.summary).toBeNull()
    expect(result.report).toBe('just some text, no summary')
  })

  it('passes system prompt and user prompt to LLM', async () => {
    const mockLLM = vi.fn().mockResolvedValue('')
    const { runEvaluation } = await import('@/lib/careerops/evaluator')
    await runEvaluation(
      {
        jdText: 'JOB-INPUT-MARKER',
        cvMarkdown: 'CV-MARKER',
        userProfile: 'PROFILE-MARKER',
      },
      { llm: mockLLM }
    )
    const [systemArg, userArg] = mockLLM.mock.calls[0]
    expect(systemArg).toContain('CV-MARKER')
    expect(systemArg).toContain('PROFILE-MARKER')
    expect(userArg).toContain('JOB-INPUT-MARKER')
  })
})
