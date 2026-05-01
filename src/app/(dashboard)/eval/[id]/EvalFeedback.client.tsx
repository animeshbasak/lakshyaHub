'use client'

import { useState, useTransition } from 'react'
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { submitEvalFeedback } from '@/actions/feedbackActions'

interface Props {
  evalId: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'rated'; rating: 'up' | 'down' }
  | { kind: 'submitted' }
  | { kind: 'error'; message: string }

export function EvalFeedback({ evalId }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()

  function rate(rating: 'up' | 'down') {
    setState({ kind: 'rated', rating })
    startTransition(async () => {
      const r = await submitEvalFeedback({ evalId, rating })
      if (!r.ok) setState({ kind: 'error', message: r.error ?? 'failed' })
    })
  }

  function submitNote() {
    if (state.kind !== 'rated') return
    const captured = state
    startTransition(async () => {
      const r = await submitEvalFeedback({
        evalId,
        rating: captured.rating,
        note: note.trim() || undefined,
      })
      if (r.ok) setState({ kind: 'submitted' })
      else setState({ kind: 'error', message: r.error ?? 'failed' })
    })
  }

  if (state.kind === 'submitted') {
    return (
      <section
        aria-label="Evaluation feedback"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex items-center gap-3"
      >
        <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        <p className="text-sm text-white">Thanks — feedback noted.</p>
      </section>
    )
  }

  return (
    <section
      aria-label="Evaluation feedback"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
    >
      <p className="text-sm font-medium text-white">Was this evaluation useful?</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => rate('up')}
          aria-pressed={state.kind === 'rated' && state.rating === 'up'}
          disabled={pending}
          className={`min-h-[44px] px-3 inline-flex items-center gap-2 rounded-lg border text-sm transition-colors ${
            state.kind === 'rated' && state.rating === 'up'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-white hover:border-white/20'
          }`}
        >
          <ThumbsUp className="w-4 h-4" aria-hidden="true" />
          Useful
        </button>

        <button
          type="button"
          onClick={() => rate('down')}
          aria-pressed={state.kind === 'rated' && state.rating === 'down'}
          disabled={pending}
          className={`min-h-[44px] px-3 inline-flex items-center gap-2 rounded-lg border text-sm transition-colors ${
            state.kind === 'rated' && state.rating === 'down'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-white hover:border-white/20'
          }`}
        >
          <ThumbsDown className="w-4 h-4" aria-hidden="true" />
          Not useful
        </button>
      </div>

      {state.kind === 'rated' && (
        <div className="space-y-2 pt-1">
          <label htmlFor="eval-feedback-note" className="text-xs text-text-2">
            Optional: what would have made it more useful?
          </label>
          <textarea
            id="eval-feedback-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-white/20 resize-y"
            placeholder="Optional"
          />
          <button
            type="button"
            onClick={submitNote}
            disabled={pending}
            className="min-h-[40px] px-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}

      {state.kind === 'error' && (
        <p className="text-xs text-red-400">Couldn&apos;t save feedback ({state.message}). Try again?</p>
      )}
    </section>
  )
}
