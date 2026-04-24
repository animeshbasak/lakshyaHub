export const ARCHETYPES = [
  'ai-platform',
  'agentic',
  'ai-pm',
  'solutions-architect',
  'forward-deployed',
  'transformation',
] as const

export type Archetype = typeof ARCHETYPES[number]

const KEYWORDS: Record<Archetype, readonly string[]> = {
  'ai-platform':          ['observability', 'evals', 'llmops', 'pipelines', 'monitoring', 'reliability', 'rag'],
  'agentic':              ['agent', 'multi-agent', 'hitl', 'human-in-the-loop', 'orchestration', 'workflow'],
  'ai-pm':                ['prd', 'roadmap', 'discovery', 'stakeholder', 'product manager'],
  'solutions-architect':  ['architecture', 'enterprise', 'integration', 'solutions architect', 'systems'],
  'forward-deployed':     ['client-facing', 'forward deployed', 'prototype', 'fast delivery', 'field'],
  'transformation':       ['change management', 'adoption', 'enablement', 'transformation'],
}

export function archetypeKeywords(a: Archetype): readonly string[] {
  return KEYWORDS[a]
}

export function detectArchetype(jdText: string): Archetype | null {
  const lower = jdText.toLowerCase()
  let best: { archetype: Archetype; hits: number } | null = null

  for (const archetype of ARCHETYPES) {
    const hits = KEYWORDS[archetype].filter(kw => lower.includes(kw)).length
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { archetype, hits }
    }
  }

  return best?.archetype ?? null
}
