import type { Metadata } from 'next'
import Link from 'next/link'
import { listGuideStubs } from '@/content/guides'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

export const metadata: Metadata = {
  title: 'Archetype guides',
  description: 'Senior-IC playbooks for landing each of the 6 careerops archetypes — AI Platform, Agentic, AI-PM, Solutions Architect, Forward-Deployed, Transformation.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Lakshya · archetype guides',
    description: 'Six senior-IC playbooks for the 6 careerops archetypes.',
    url: '/guides',
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const stubs = listGuideStubs()

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16 flex-1">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Guides</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Six archetypes. Six playbooks.
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-xl mx-auto">
            One guide per careerops archetype — what hiring managers screen for, the interview
            loop, salary bands, common rejection patterns, the FAQ. Drawn from the{' '}
            <a
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 hover:text-white"
            >
              career-ops
            </a>{' '}
            corpus.
          </p>
        </header>

        <ul className="space-y-3">
          {stubs.map((stub) => {
            const isLive = stub.status === 'published'
            return (
              <li key={stub.archetype}>
                <Link
                  href={`/guides/${stub.archetype}`}
                  aria-disabled={!isLive}
                  className={`block rounded-xl border p-4 md:p-5 transition-colors min-h-[64px] ${
                    isLive
                      ? 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                      : 'border-white/5 bg-white/[0.01] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-text-2 mb-0.5">{stub.archetype}</p>
                      <h2 className="text-sm md:text-base font-semibold text-white truncate">{stub.title}</h2>
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
          New guide every 1–2 weeks until all six ship.
        </div>
      </footer>
    </main>
  )
}
