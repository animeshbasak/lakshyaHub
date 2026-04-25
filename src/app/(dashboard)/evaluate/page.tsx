import type { Metadata } from 'next'
import { EvaluatePanel } from './EvaluatePanel.client'

export const metadata: Metadata = {
  title: 'Evaluate a job',
  description: 'Paste a job description. Get a 7-block A-G evaluation in 30 seconds — score, archetype fit, legitimacy, gaps, recommendations.',
  robots: { index: false, follow: false },
}

export default function EvaluatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-2">careerops · A-G evaluator</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">Evaluate a job</h1>
        <p className="text-sm text-text-2 max-w-xl leading-relaxed">
          Paste a JD. We&apos;ll score it 0–5 across 7 dimensions, classify the archetype, and
          flag legitimacy concerns. Built on the career-ops methodology
          (<a className="underline underline-offset-2 hover:text-white" href="https://github.com/santifer/career-ops" target="_blank" rel="noreferrer noopener">santifer</a>, MIT).
        </p>
      </header>

      <EvaluatePanel />
    </div>
  )
}
