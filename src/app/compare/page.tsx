import type { Metadata } from 'next'
import Link from 'next/link'
import { listCompetitors } from '@/content/compare'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

export const metadata: Metadata = {
  title: 'Compare Lakshya',
  description: 'Honest side-by-side comparisons of Lakshya against the major job-search and resume-optimization tools — Teal, Jobscan, Huntr, Careerflow, Simplify, LoopCV.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Lakshya · honest side-by-sides',
    description: 'Where each tool wins, who each is for, and how to pick.',
    url: '/compare',
    type: 'website',
  },
}

export default function CompareIndexPage() {
  const competitors = listCompetitors()

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16 flex-1">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Compare</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Honest side-by-sides.
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-xl mx-auto">
            One page per major job-search tool. Where each one wins. Who each is for. No
            disparagement, no SEO bait — capability diffs you can verify.
          </p>
        </header>

        <ul className="space-y-3">
          {competitors.map((c) => {
            const isLive = c.status === 'published'
            return (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  aria-disabled={!isLive}
                  className={`block rounded-xl border p-4 md:p-5 transition-colors min-h-[64px] ${
                    isLive
                      ? 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                      : 'border-white/5 bg-white/[0.01] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm md:text-base font-semibold text-white truncate">Lakshya vs {c.competitorName}</h2>
                      <p className="text-[12px] text-text-2 mt-1 line-clamp-2">{c.oneLiner}</p>
                    </div>
                    {isLive ? (
                      <span className="text-[11px] text-[color:var(--accent)] font-medium shrink-0">Read →</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-text-2 shrink-0">Coming soon</span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl text-[11px] text-text-2 text-center">
          New comparison every 1–2 weeks until all six ship.
        </div>
      </footer>
    </main>
  )
}
