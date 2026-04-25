import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScoreHero } from './ScoreHero'
import { BlockAccordion } from './BlockAccordion'
import { ShareToggle } from './ShareToggle.client'
import type { AnonLevel } from '@/actions/evaluationActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Evaluation',
  robots: { index: false, follow: false },
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
}

export default async function EvalDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // RLS already restricts to user_id = auth.uid(); this is defense-in-depth.
  const { data, error } = await supabase
    .from('evaluations')
    .select('id, user_id, jd_url, jd_text, company, role, archetype, score, legitimacy_tier, report_md, created_at, llm_provider, prompt_version, is_public, anon_level')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) notFound()
  const evaluation = data as EvaluationRow

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 space-y-8">
      <ScoreHero evaluation={evaluation} />
      <BlockAccordion reportMd={evaluation.report_md ?? ''} />
      <ShareToggle
        id={evaluation.id}
        initialIsPublic={evaluation.is_public ?? false}
        initialAnonLevel={evaluation.anon_level ?? 'full_anon'}
      />

      <footer className="text-[11px] text-text-2 flex flex-wrap gap-4 pt-6 border-t border-white/5">
        <span>Provider: {evaluation.llm_provider ?? 'claude'}</span>
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
