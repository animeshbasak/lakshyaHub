/**
 * Archetype taxonomy. Lakshya's eval rubric is general — it scores any tech JD —
 * but the archetype detector classifies the role into a meaningful bucket so the
 * UI can show category-aware feedback (rejection patterns, salary bands,
 * interview-loop expectations).
 *
 * Two families:
 *
 *   1. AI specialty (6) — career-ops's original taxonomy from the source corpus.
 *      Highest-resolution rubric. Use when the JD is clearly AI-specific.
 *
 *   2. General tech (8) — added 2026-04-25 to broaden Lakshya from "AI-only"
 *      to "any tech job seeker who refuses to spray 50+ applications without
 *      filtering." The product mechanics work identically; only the archetype
 *      label differs. Guides are coming-soon for these — will ship over time.
 *
 * Detector strategy: max-hit wins. AI keywords are designed to be specific
 * enough that an AI Platform JD won't trigger 'backend'. A backend JD with
 * incidental "rag" mention won't trigger 'ai-platform' because the other
 * backend-specific keywords will outweigh.
 */

export const ARCHETYPES = [
  // AI specialty (6) — original career-ops taxonomy
  'ai-platform',
  'agentic',
  'ai-pm',
  'solutions-architect',
  'forward-deployed',
  'transformation',

  // General tech (8) — broader audience added 2026-04-25
  'backend',
  'frontend',
  'fullstack',
  'mobile',
  'devops-sre',
  'data-engineering',
  'security',
  'engineering-manager',
] as const

export type Archetype = typeof ARCHETYPES[number]

/** Categorization for nav / guide-index grouping. Keep in sync with ARCHETYPES above. */
export const ARCHETYPE_FAMILY: Record<Archetype, 'ai' | 'tech'> = {
  'ai-platform':         'ai',
  'agentic':             'ai',
  'ai-pm':               'ai',
  'solutions-architect': 'ai',
  'forward-deployed':    'ai',
  'transformation':      'ai',
  'backend':             'tech',
  'frontend':            'tech',
  'fullstack':           'tech',
  'mobile':              'tech',
  'devops-sre':          'tech',
  'data-engineering':    'tech',
  'security':            'tech',
  'engineering-manager': 'tech',
}

const KEYWORDS: Record<Archetype, readonly string[]> = {
  // AI specialty
  'ai-platform':          ['observability', 'evals', 'llmops', 'pipelines', 'monitoring', 'reliability', 'rag'],
  'agentic':              ['agent', 'multi-agent', 'hitl', 'human-in-the-loop', 'orchestration', 'workflow'],
  'ai-pm':                ['prd', 'roadmap', 'discovery', 'stakeholder', 'product manager'],
  'solutions-architect':  ['architecture', 'enterprise', 'integration', 'solutions architect', 'systems'],
  'forward-deployed':     ['client-facing', 'forward deployed', 'prototype', 'fast delivery', 'field'],
  'transformation':       ['change management', 'adoption', 'enablement', 'transformation'],

  // General tech
  'backend':              ['backend', 'api', 'microservices', 'rest', 'graphql', 'database design', 'distributed systems', 'service-oriented'],
  'frontend':             ['frontend', 'react', 'vue', 'svelte', 'angular', 'css', 'html', 'web vitals', 'accessibility', 'spa'],
  'fullstack':            ['full-stack', 'fullstack', 'full stack', 'end-to-end', 'product engineer'],
  'mobile':               ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile engineer', 'mobile developer'],
  'devops-sre':           ['sre', 'site reliability', 'devops', 'kubernetes', 'terraform', 'ansible', 'on-call', 'incident response', 'cicd', 'observability stack'],
  'data-engineering':     ['data engineer', 'data warehouse', 'snowflake', 'bigquery', 'etl', 'elt', 'airflow', 'dbt', 'data pipeline', 'spark'],
  'security':             ['security engineer', 'application security', 'appsec', 'cloud security', 'penetration testing', 'pentest', 'soc 2', 'compliance', 'iam', 'zero trust'],
  'engineering-manager':  ['engineering manager', 'em ', 'people manager', 'team lead', 'staff engineer', 'principal engineer', 'lead engineer', 'mentorship', 'one-on-ones'],
}

export function archetypeKeywords(a: Archetype): readonly string[] {
  return KEYWORDS[a]
}

export function detectArchetype(jdText: string): Archetype | null {
  const lower = jdText.toLowerCase()
  let best: { archetype: Archetype; hits: number } | null = null

  for (const archetype of ARCHETYPES) {
    const hits = KEYWORDS[archetype].filter((kw) => lower.includes(kw)).length
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { archetype, hits }
    }
  }

  return best?.archetype ?? null
}

/** Human-readable label for nav, guide titles, badges. */
export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  'ai-platform':         'AI Platform / LLMOps',
  'agentic':             'Agentic / Multi-agent',
  'ai-pm':               'AI Product Manager',
  'solutions-architect': 'AI Solutions Architect',
  'forward-deployed':    'Forward-Deployed Engineer',
  'transformation':      'AI Transformation',
  'backend':             'Backend / API Engineer',
  'frontend':            'Frontend / Web Engineer',
  'fullstack':           'Full-Stack / Product Engineer',
  'mobile':              'Mobile Engineer (iOS / Android)',
  'devops-sre':          'DevOps / SRE',
  'data-engineering':    'Data Engineer',
  'security':            'Security Engineer',
  'engineering-manager': 'Engineering Manager',
}
