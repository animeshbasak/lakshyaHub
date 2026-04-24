import { describe, it, expect } from 'vitest'
import { detectArchetype, ARCHETYPES, archetypeKeywords } from '@/lib/careerops/archetypes'

describe('archetypes', () => {
  it('exports 6 archetypes', () => {
    expect(ARCHETYPES).toEqual([
      'ai-platform',
      'agentic',
      'ai-pm',
      'solutions-architect',
      'forward-deployed',
      'transformation',
    ])
  })

  it('detects ai-platform from LLMOps keywords', () => {
    const jd = 'Building LLM observability and evals infrastructure. Monitor reliability of RAG pipelines.'
    expect(detectArchetype(jd)).toBe('ai-platform')
  })

  it('detects agentic from agent/HITL keywords', () => {
    const jd = 'Design multi-agent orchestration workflows with human-in-the-loop.'
    expect(detectArchetype(jd)).toBe('agentic')
  })

  it('detects ai-pm from PRD/roadmap keywords', () => {
    const jd = 'Product Manager owning roadmap, PRDs, and stakeholder discovery for our AI platform.'
    expect(detectArchetype(jd)).toBe('ai-pm')
  })

  it('detects solutions-architect from enterprise/integration keywords', () => {
    const jd = 'Solutions Architect designing enterprise architecture and systems integration.'
    expect(detectArchetype(jd)).toBe('solutions-architect')
  })

  it('detects forward-deployed from client-facing/prototype keywords', () => {
    const jd = 'Forward Deployed Engineer: client-facing, fast prototype delivery in the field.'
    expect(detectArchetype(jd)).toBe('forward-deployed')
  })

  it('detects transformation from change-management keywords', () => {
    const jd = 'Drive AI transformation, change management, enablement, and adoption across the enterprise.'
    expect(detectArchetype(jd)).toBe('transformation')
  })

  it('returns null when no archetype matches', () => {
    expect(detectArchetype('We sell mattresses online.')).toBeNull()
  })

  it('returns keyword list per archetype', () => {
    expect(archetypeKeywords('agentic')).toContain('agent')
  })
})
