import { describe, it, expect } from 'vitest'
import { detectArchetype, ARCHETYPES, archetypeKeywords, ARCHETYPE_FAMILY, ARCHETYPE_LABEL } from '@/lib/careerops/archetypes'

describe('archetypes', () => {
  it('exports 14 archetypes (6 AI specialty + 8 general tech)', () => {
    expect(ARCHETYPES.length).toBe(14)
    // AI specialty (career-ops original taxonomy)
    expect(ARCHETYPES).toContain('ai-platform')
    expect(ARCHETYPES).toContain('agentic')
    expect(ARCHETYPES).toContain('ai-pm')
    expect(ARCHETYPES).toContain('solutions-architect')
    expect(ARCHETYPES).toContain('forward-deployed')
    expect(ARCHETYPES).toContain('transformation')
    // General tech (added 2026-04-25)
    expect(ARCHETYPES).toContain('backend')
    expect(ARCHETYPES).toContain('frontend')
    expect(ARCHETYPES).toContain('fullstack')
    expect(ARCHETYPES).toContain('mobile')
    expect(ARCHETYPES).toContain('devops-sre')
    expect(ARCHETYPES).toContain('data-engineering')
    expect(ARCHETYPES).toContain('security')
    expect(ARCHETYPES).toContain('engineering-manager')
  })

  it('classifies every archetype into ai or tech family', () => {
    for (const a of ARCHETYPES) {
      expect(['ai', 'tech']).toContain(ARCHETYPE_FAMILY[a])
    }
  })

  it('every archetype has a human-readable label', () => {
    for (const a of ARCHETYPES) {
      expect(ARCHETYPE_LABEL[a]).toBeTruthy()
      expect(typeof ARCHETYPE_LABEL[a]).toBe('string')
    }
  })

  // ── AI specialty detection ─────────────────────────────────────
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

  // ── General tech detection ─────────────────────────────────────
  it('detects backend from API/microservices keywords', () => {
    const jd = 'Backend engineer building REST and GraphQL APIs across our distributed systems / microservices stack.'
    expect(detectArchetype(jd)).toBe('backend')
  })

  it('detects frontend from React/CSS/web-vitals keywords', () => {
    const jd = 'Frontend engineer working with React, CSS, and accessibility. Experience with SPA + Web Vitals.'
    expect(detectArchetype(jd)).toBe('frontend')
  })

  it('detects fullstack from end-to-end/product-engineer phrasing', () => {
    const jd = 'Product engineer delivering full-stack features end-to-end. Comfort across the entire stack.'
    expect(detectArchetype(jd)).toBe('fullstack')
  })

  it('detects mobile from iOS/Swift keywords', () => {
    const jd = 'Mobile engineer building iOS apps in Swift. Experience with React Native a plus.'
    expect(detectArchetype(jd)).toBe('mobile')
  })

  it('detects devops-sre from on-call/Kubernetes/Terraform keywords', () => {
    const jd = 'Site reliability engineer (SRE) responsible for on-call, Kubernetes infrastructure, Terraform automation, and incident response.'
    expect(detectArchetype(jd)).toBe('devops-sre')
  })

  it('detects data-engineering from warehouse/dbt/airflow keywords', () => {
    const jd = 'Data engineer designing ETL pipelines into Snowflake using dbt and Airflow. Spark experience preferred.'
    expect(detectArchetype(jd)).toBe('data-engineering')
  })

  it('detects security from appsec/IAM/zero-trust keywords', () => {
    const jd = 'Security engineer focused on application security, IAM, zero trust architecture, and SOC 2 compliance.'
    expect(detectArchetype(jd)).toBe('security')
  })

  it('detects engineering-manager from people-management keywords', () => {
    const jd = 'Engineering manager leading a team of 8 staff engineers. Mentorship, one-on-ones, performance reviews.'
    expect(detectArchetype(jd)).toBe('engineering-manager')
  })

  // ── Edge cases ─────────────────────────────────────────────────
  it('returns null when no archetype matches', () => {
    expect(detectArchetype('We sell mattresses online.')).toBeNull()
  })

  it('returns keyword list per archetype', () => {
    expect(archetypeKeywords('agentic')).toContain('agent')
    expect(archetypeKeywords('backend')).toContain('api')
    expect(archetypeKeywords('frontend')).toContain('react')
  })
})
