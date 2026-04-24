import { describe, it, expect } from 'vitest'
import { composePrompt, type PromptContext } from '@/lib/careerops/promptLoader'

const ctx: PromptContext = {
  mode: 'oferta',
  userProfile: '## My Profile\nSenior AI Engineer targeting platform roles.',
  cvMarkdown: '## Experience\n- Built X\n- Shipped Y',
  jdText: 'Senior AI Engineer role at Acme. Requirements: 5y exp.',
}

describe('promptLoader.composePrompt', () => {
  it('includes system _shared content', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toMatch(/SYSTEM CONTEXT/i)
  })

  it('includes mode-specific content (oferta)', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toMatch(/EVALUATION MODE|oferta/i)
  })

  it('embeds the user CV', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('Built X')
  })

  it('embeds the user profile', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('targeting platform roles')
  })

  it('embeds the JD as user input section', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('Acme')
  })

  it('throws on unknown mode', async () => {
    await expect(composePrompt({ ...ctx, mode: 'nonexistent' as unknown as PromptContext['mode'] })).rejects.toThrow()
  })
})
