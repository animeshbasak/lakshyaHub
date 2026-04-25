import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScoreHero } from './ScoreHero'
import { BlockAccordion } from './BlockAccordion'
import { ShareToggle } from './ShareToggle.client'
import { EvalFeedback } from './EvalFeedback.client'
import { UpgradeCta } from './UpgradeCta'
import type { AnonLevel } from '@/actions/evaluationActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Evaluation',
  robots: { index: false, follow: false },
}

interface EvaluationBlocksJson {
  summary?: unknown
  providerRequested?: 'groq' | 'gemini' | 'claude'
  providerUsed?: 'groq' | 'gemini' | 'claude'
  fellBack?: boolean
}

interface EvaluationRow {
  id: string
  user_id: string
  jd_url: string | null
  jd_text: string | null
  company: string | null
  role: string | null
  archetype: string | null
  score: number | null
  legitimacy_tier: 'high' | 'caution' | 'suspicious' | null
  report_md: string | null
  created_at: string | null
  llm_provider: string | null
  prompt_version: string | null
  is_public: boolean | null
  anon_level: AnonLevel | null
  blocks_json: EvaluationBlocksJson | null
}

export default async function EvalDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // RLS already restricts to user_id = auth.uid(); this is defense-in-depth.
  const { data, error } = await supabase
    .from('evaluations')
    .select('id, user_id, jd_url, jd_text, company, role, archetype, score, legitimacy_tier, report_md, created_at, llm_provider, prompt_version, is_public, anon_level, blocks_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) notFound()
  const evaluation = data as EvaluationRow

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 space-y-8">
      <ScoreHero evaluation={evaluation} />
      <BlockAccordion reportMd={evaluation.report_md ?? ''} />
      <UpgradeCta score={evaluation.score} />
      <EvalFeedback evalId={evaluation.id} />
      <ShareToggle
        id={evaluation.id}
        initialIsPublic={evaluation.is_public ?? false}
        initialAnonLevel={evaluation.anon_level ?? 'full_anon'}
      />

      <footer className="text-[11px] text-text-2 flex flex-wrap gap-4 pt-6 border-t border-white/5">
        {(() => {
          const used = evaluation.blocks_json?.providerUsed ?? evaluation.llm_provider ?? 'unknown'
          const requested = evaluation.blocks_json?.providerRequested
          const fellBack = evaluation.blocks_json?.fellBack === true
          if (fellBack && requested && requested !== used) {
            return (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[color:var(--tier-mid-dim)] border border-[color:var(--tier-mid)]/30 text-[color:var(--tier-mid)]"
                title="Your preferred provider was rate-limited or unavailable. We auto-routed to a working fallback."
              >
                Provider: <strong className="font-semibold">{used}</strong>
                <span className="opacity-70">· requested {requested} (fell back)</span>
              </span>
            )
          }
          return <span>Provider: {used}</span>
        })()}
        <span>Prompt v{evaluation.prompt_version ?? '1.0.0'}</span>
        {evaluation.created_at && (
          <span>{new Date(evaluation.created_at).toLocaleString()}</span>
        )}
        <span className="ml-auto">
          Built on{' '}
          <a className="underline underline-offset-2 hover:text-white" href="https://github.com/santifer/career-ops" target="_blank" rel="noreferrer noopener">
            career-ops
          </a>{' '}
          (santifer, MIT)
        </span>
      </footer>
    </div>
  )
}
