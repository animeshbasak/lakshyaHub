import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { listStories } from '@/actions/storyActions'
import { matchStoriesToEval, type MatchResult } from '@/lib/careerops/storyMatcher'

interface Props {
  evaluation: {
    archetype: string | null
    report_md: string | null
  }
}

/**
 * Related Stories — surfaces 1-3 of the user's pre-written STAR stories
 * that match the eval's archetype + tag overlap + gap-keyword overlap.
 *
 * Empty states:
 *   - No stories yet → CTA to /stories
 *   - Stories exist but none match → silent (don't suggest the wrong story)
 *
 * Server component — runs the matcher once per render, no client roundtrip.
 */
export async function RelatedStories({ evaluation }: Props) {
  const stories = await listStories()

  if (stories.length === 0) {
    return (
      <section
        aria-label="Related stories"
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-text-2 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-white">Build a STAR story bank</h2>
            <p className="text-xs text-text-2 mt-1 leading-relaxed">
              Pre-written situation/task/action/result stories tagged by archetype.
              Once you have a few, this section surfaces the most relevant ones for each eval.
            </p>
            <Link
              href="/stories"
              className="mt-3 inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white hover:border-white/20"
            >
              Open story bank <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const matches: MatchResult[] = matchStoriesToEval(evaluation, stories)

  // Stories exist but none match this eval — render nothing (better than
  // a wrong suggestion).
  if (matches.length === 0) return null

  return (
    <section
      aria-label="Related stories from your bank"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
    >
      <header className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-text-2" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">
          Stories from your bank that fit this eval
        </h2>
      </header>
      <ul className="space-y-3">
        {matches.map(m => (
          <li key={m.story.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.story.title}</p>
                {m.story.archetype && (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 text-[10px] font-medium text-[color:var(--accent)]">
                    {m.story.archetype}
                  </span>
                )}
              </div>
              <Link
                href="/stories"
                className="shrink-0 text-[11px] text-text-2 hover:text-white inline-flex items-center gap-1"
              >
                Open <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
            {m.story.situation && (
              <p className="text-[12px] text-text-2 mt-2 leading-relaxed line-clamp-2">
                {m.story.situation}
              </p>
            )}
            {m.reasons.length > 0 && (
              <p className="text-[10px] text-text-muted mt-2">
                Why: {m.reasons.slice(0, 2).join(' · ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
