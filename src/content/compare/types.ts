/**
 * Compare-page content shape. Each /compare/:competitor renders a typed,
 * factual side-by-side. Strict ground rules:
 *   - Never disparage. Stick to capability diffs the user can verify.
 *   - Cite source for every "competitor does X" claim (link, doc, public review).
 *   - Always include "where competitor wins over Lakshya" — credibility hinges on it.
 */

export interface ComparisonRow {
  capability: string
  lakshya: string
  competitor: string
  notes?: string
}

export interface CompetitorContent {
  slug: string
  competitorName: string
  competitorUrl: string
  metaDescription: string
  intro: string
  whoEachIsFor: { lakshyaAudience: string; competitorAudience: string }
  rows: ComparisonRow[]
  competitorWins: string[]
  lakshyaWins: string[]
  whenToPick: { pickLakshya: string; pickCompetitor: string }
  faq: { q: string; a: string }[]
  publishedAt: string
  updatedAt: string
}

export interface CompetitorStub {
  slug: string
  competitorName: string
  oneLiner: string
  status: 'published' | 'coming-soon'
}
