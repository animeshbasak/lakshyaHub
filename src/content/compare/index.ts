import type { CompetitorContent, CompetitorStub } from './types'
import { tealCompare } from './teal'
import { jobscanCompare } from './jobscan'
import { huntrCompare } from './huntr'
import { careerflowCompare } from './careerflow'
import { simplifyCompare } from './simplify'

export type { CompetitorContent, CompetitorStub } from './types'

const REGISTRY: Record<string, CompetitorContent> = {
  teal: tealCompare,
  jobscan: jobscanCompare,
  huntr: huntrCompare,
  careerflow: careerflowCompare,
  simplify: simplifyCompare,
}

interface StubMeta {
  competitorName: string
  oneLiner: string
}

const STUBS: Record<string, StubMeta> = {
  teal:        { competitorName: 'Teal',        oneLiner: 'Application tracker + Chrome extension. Polished workflow, single-tier pricing.' },
  jobscan:     { competitorName: 'Jobscan',     oneLiner: 'Mature keyword-density resume optimization. ATS-pass-through focus.' },
  huntr:       { competitorName: 'Huntr',       oneLiner: 'Application tracker with Kanban + browser extension. Job-funnel focus.' },
  careerflow:  { competitorName: 'Careerflow',  oneLiner: 'LinkedIn-first career platform with AI assistance.' },
  simplify:    { competitorName: 'Simplify',    oneLiner: 'Application autofill across portals. High-volume aggressive applier tool.' },
  loopcv:      { competitorName: 'LoopCV',      oneLiner: 'Auto-apply at scale. Different ethical model than Lakshya.' },
}

export function getCompetitor(slug: string): CompetitorContent | null {
  return REGISTRY[slug] ?? null
}

export function listCompetitors(): CompetitorStub[] {
  return Object.entries(STUBS).map(([slug, meta]) => ({
    slug,
    competitorName: meta.competitorName,
    oneLiner: meta.oneLiner,
    status: REGISTRY[slug] ? 'published' : 'coming-soon',
  }))
}

export function isCompetitorSlug(slug: string): boolean {
  return slug in STUBS
}
