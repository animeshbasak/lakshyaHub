import type { ArchetypeGuide } from './ai-platform'
import { aiPlatformGuide } from './ai-platform'
import { agenticGuide } from './agentic'
import { aiPmGuide } from './ai-pm'
import { solutionsArchitectGuide } from './solutions-architect'
import { forwardDeployedGuide } from './forward-deployed'
import { transformationGuide } from './transformation'
import { ARCHETYPES, ARCHETYPE_FAMILY, type Archetype } from '@/lib/careerops/archetypes'

export type { ArchetypeGuide } from './ai-platform'

const GUIDES: Partial<Record<Archetype, ArchetypeGuide>> = {
  'ai-platform':         aiPlatformGuide,
  'agentic':             agenticGuide,
  'ai-pm':               aiPmGuide,
  'solutions-architect': solutionsArchitectGuide,
  'forward-deployed':    forwardDeployedGuide,
  'transformation':      transformationGuide,
}

export interface GuideStub {
  archetype: Archetype
  title: string
  family: 'ai' | 'tech'
  status: 'published' | 'coming-soon'
}

const STUB_TITLES: Record<Archetype, string> = {
  // AI specialty
  'ai-platform':         'How to land an AI Platform / LLMOps role',
  'agentic':             'How to land an Agentic / multi-agent role',
  'ai-pm':               'How to land an AI Product Manager role',
  'solutions-architect': 'How to land an AI Solutions Architect role',
  'forward-deployed':    'How to land a Forward-Deployed Engineer role',
  'transformation':      'How to land an AI Transformation / change-management role',
  // General tech (guides not yet written; archetype detection works today)
  'backend':             'How to land a Backend / API Engineer role',
  'frontend':            'How to land a Frontend / Web Engineer role',
  'fullstack':           'How to land a Full-Stack / Product Engineer role',
  'mobile':              'How to land a Mobile Engineer (iOS / Android) role',
  'devops-sre':          'How to land a DevOps / SRE role',
  'data-engineering':    'How to land a Data Engineer role',
  'security':            'How to land a Security Engineer role',
  'engineering-manager': 'How to land an Engineering Manager role',
}

export function getGuide(slug: string): ArchetypeGuide | null {
  if (!(ARCHETYPES as readonly string[]).includes(slug)) return null
  return GUIDES[slug as Archetype] ?? null
}

export function listGuideStubs(): GuideStub[] {
  return ARCHETYPES.map((a) => ({
    archetype: a,
    title: STUB_TITLES[a],
    family: ARCHETYPE_FAMILY[a],
    status: GUIDES[a] ? 'published' : 'coming-soon',
  }))
}

export function isGuideSlug(slug: string): slug is Archetype {
  return (ARCHETYPES as readonly string[]).includes(slug)
}
