import type { Metadata } from 'next'
import Link from 'next/link'
import { listGuideStubs, type GuideStub } from '@/content/guides'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

export const metadata: Metadata = {
  title: 'Archetype guides',
  description: '14 archetype playbooks for tech job seekers — AI roles (platform, agentic, PM, SA, FDE, transformation) plus general tech (backend, frontend, full-stack, mobile, devops/SRE, data, security, EM).',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Lakshya · archetype guides',
    description: '14 archetype playbooks. AI specialty + general tech.',
    url: '/guides',
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const stubs = listGuideStubs()
  const ai = stubs.filter((s) => s.family === 'ai')
  const tech = stubs.filter((s) => s.family === 'tech')
  const publishedCount = stubs.filter((s) => s.status === 'published').length

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16 flex-1">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Guides</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            14 archetypes. One rubric.
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-xl mx-auto">
            One playbook per archetype — what hiring managers screen for, the
            interview loop, salary bands, common rejection patterns, the FAQ.
            Built on the{' '}
            <a
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 hover:text-white"
            >
              career-ops
            </a>{' '}
            methodology.
          </p>
          <p className="text-[12px] text-text-2 mt-2">
            {publishedCount}/{stubs.length} published — eval works for all 14 archetypes today.
          </p>
        </header>

        <GuideGroup
          title="AI specialty"
          subtitle="Original career-ops taxonomy. Highest-resolution rubric."
          stubs={ai}
        />

        <GuideGroup
          title="General tech"
          subtitle="Same A-G rubric, broader audience. Backend, frontend, mobile, devops, data, security, EM."
          stubs={tech}
        />
      </section>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl text-[11px] text-text-2 text-center">
          A-G evaluation works for every archetype today. Long-form guides ship 1–2 per week.
        </div>
      </footer>
    </main>
  )
}

function GuideGroup({
  title,
  subtitle,
  stubs,
}: {
  title: string
  subtitle: string
  stubs: GuideStub[]
}) {
  if (stubs.length === 0) return null

  return (
    <div className="mt-10 first:mt-0">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-[11px] text-text-2">
          {stubs.filter((s) => s.status === 'published').length} / {stubs.length} live
        </span>
      </div>
      <p className="text-[12px] text-text-2 mb-4">{subtitle}</p>
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
                    <p className="text-[11px] uppercase tracking-widest text-text-2 mb-0.5">
                      {stub.archetype}
                    </p>
                    <h3 className="text-sm md:text-base font-semibold text-white truncate">
                      {stub.title}
                    </h3>
                  </div>
                  {isLive ? (
                    <span className="text-[11px] text-[color:var(--accent)] font-medium shrink-0">
                      Read →
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-text-2 shrink-0">
                      Coming soon
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
