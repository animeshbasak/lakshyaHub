import type { ArchetypeGuide } from './ai-platform'
import { aiPlatformGuide } from './ai-platform'
import { agenticGuide } from './agentic'
import { aiPmGuide } from './ai-pm'
import { ARCHETYPES, type Archetype } from '@/lib/careerops/archetypes'

export type { ArchetypeGuide } from './ai-platform'

const GUIDES: Partial<Record<Archetype, ArchetypeGuide>> = {
  'ai-platform': aiPlatformGuide,
  'agentic':     agenticGuide,
  'ai-pm':       aiPmGuide,
}

export interface GuideStub {
  archetype: Archetype
  title: string
  status: 'published' | 'coming-soon'
}

const STUB_TITLES: Record<Archetype, string> = {
  'ai-platform':         'How to land an AI Platform / LLMOps role',
  'agentic':             'How to land an Agentic / multi-agent role',
  'ai-pm':               'How to land an AI Product Manager role',
  'solutions-architect': 'How to land an AI Solutions Architect role',
  'forward-deployed':    'How to land a Forward-Deployed Engineer role',
  'transformation':      'How to land an AI Transformation / change-management role',
}

export function getGuide(slug: string): ArchetypeGuide | null {
  if (!(ARCHETYPES as readonly string[]).includes(slug)) return null
  return GUIDES[slug as Archetype] ?? null
}

export function listGuideStubs(): GuideStub[] {
  return ARCHETYPES.map((a) => ({
    archetype: a,
    title: STUB_TITLES[a],
    status: GUIDES[a] ? 'published' : 'coming-soon',
  }))
}

export function isGuideSlug(slug: string): slug is Archetype {
  return (ARCHETYPES as readonly string[]).includes(slug)
}
