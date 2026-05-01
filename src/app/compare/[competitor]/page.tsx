import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, X, ArrowRight } from 'lucide-react'
import { getCompetitor, listCompetitors, isCompetitorSlug } from '@/content/compare'
import { JsonLd } from '@/components/seo/JsonLd'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

interface PageProps {
  params: Promise<{ competitor: string }>
}

export function generateStaticParams() {
  return listCompetitors().map((c) => ({ competitor: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor } = await params
  if (!isCompetitorSlug(competitor)) {
    return { title: 'Comparison not found', robots: { index: false, follow: false } }
  }
  const data = getCompetitor(competitor)
  if (!data) {
    const stub = listCompetitors().find((c) => c.slug === competitor)
    return {
      title: stub ? `Lakshya vs ${stub.competitorName} (coming soon)` : 'Comparison coming soon',
      description: 'Comparison page in production.',
      robots: { index: false, follow: true },
    }
  }
  return {
    title: `Lakshya vs ${data.competitorName}`,
    description: data.metaDescription,
    alternates: { canonical: `/compare/${data.slug}` },
    openGraph: {
      title: `Lakshya vs ${data.competitorName}`,
      description: data.metaDescription,
      url: `/compare/${data.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Lakshya vs ${data.competitorName}`,
      description: data.metaDescription,
    },
  }
}

export default async function ComparePage({ params }: PageProps) {
  const { competitor } = await params
  if (!isCompetitorSlug(competitor)) notFound()

  const data = getCompetitor(competitor)
  if (!data) return <ComingSoon competitor={competitor} />

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Lakshya vs ${data.competitorName}`,
    description: data.metaDescription,
    datePublished: data.publishedAt,
    dateModified: data.updatedAt,
    author: { '@type': 'Organization', name: 'Lakshya' },
    publisher: {
      '@type': 'Organization',
      name: 'Lakshya',
      logo: { '@type': 'ImageObject', url: `${SITE}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/compare/${data.slug}` },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE}/compare` },
      { '@type': 'ListItem', position: 3, name: data.competitorName, item: `${SITE}/compare/${data.slug}` },
    ],
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />

      <MarketingHeader />

      <article className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16 flex-1">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-text-2">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-white" aria-current="page">{data.competitorName}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Comparison</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
            Lakshya vs {data.competitorName}
          </h1>
          <p className="text-sm md:text-base text-text-2 max-w-2xl">{data.metaDescription}</p>
        </header>

        <div className="space-y-5 text-[15px] leading-relaxed text-white/85">
          {data.intro.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <Section title="Who each is for">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AudienceCard title="Lakshya" body={data.whoEachIsFor.lakshyaAudience} highlight />
            <AudienceCard title={data.competitorName} body={data.whoEachIsFor.competitorAudience} />
          </div>
        </Section>

        <Section title="Capability comparison">
          <div className="overflow-x-auto -mx-1 rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-text-2 border-b border-white/5">
                  <th className="px-3 py-3 font-medium w-2/6">Capability</th>
                  <th className="px-3 py-3 font-medium w-2/6 text-[color:var(--accent)]">Lakshya</th>
                  <th className="px-3 py-3 font-medium w-2/6">{data.competitorName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.rows.map((row) => (
                  <tr key={row.capability} className="align-top">
                    <td className="px-3 py-3 font-medium text-white">{row.capability}</td>
                    <td className="px-3 py-3 text-white/85">{row.lakshya}</td>
                    <td className="px-3 py-3 text-white/85">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title={`Where ${data.competitorName} wins`}>
          <ul className="space-y-2">
            {data.competitorWins.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 w-4 h-4 text-[color:var(--tier-mid)] shrink-0" aria-hidden="true" />
                <span className="text-[14px] text-white/85">{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Where Lakshya wins">
          <ul className="space-y-2">
            {data.lakshyaWins.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 w-4 h-4 text-[color:var(--tier-high)] shrink-0" aria-hidden="true" />
                <span className="text-[14px] text-white/85">{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="When to pick which">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PickCard title="Pick Lakshya if" body={data.whenToPick.pickLakshya} highlight />
            <PickCard title={`Pick ${data.competitorName} if`} body={data.whenToPick.pickCompetitor} />
          </div>
        </Section>

        <Section title="FAQ">
          <dl className="space-y-3">
            {data.faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <dt className="text-sm font-semibold text-white">{f.q}</dt>
                <dd className="mt-2 text-[13px] text-text-2 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <section className="mt-12 rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.05] p-6 text-center">
          <h2 className="text-base md:text-lg font-semibold text-white mb-2">
            Try Lakshya — 3 free A-G evaluations / month
          </h2>
          <p className="text-[13px] text-text-2 mb-4 max-w-md mx-auto">
            See whether the structured rubric fits your job hunt. No credit card required for the free tier.
          </p>
          <Link
            href="/login?ref=compare-cta"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
          >
            Start free
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </article>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-2">
          <span>Last updated {data.updatedAt}</span>
          <span>
            <a className="underline underline-offset-2 hover:text-white" href={data.competitorUrl} target="_blank" rel="noreferrer noopener nofollow">
              {data.competitorName} website
            </a>
          </span>
        </div>
      </footer>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  )
}

function AudienceCard({ title, body, highlight = false }: { title: string; body: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 md:p-5 ${highlight ? 'border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}>
      <h3 className={`text-sm font-semibold mb-1.5 ${highlight ? 'text-[color:var(--accent)]' : 'text-white'}`}>{title}</h3>
      <p className="text-[13px] text-white/80 leading-relaxed">{body}</p>
    </div>
  )
}

function PickCard({ title, body, highlight = false }: { title: string; body: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 md:p-5 ${highlight ? 'border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}>
      <h3 className={`text-xs uppercase tracking-widest mb-2 ${highlight ? 'text-[color:var(--accent)]' : 'text-text-2'}`}>{title}</h3>
      <p className="text-[14px] text-white/85 leading-relaxed">{body}</p>
    </div>
  )
}

function ComingSoon({ competitor }: { competitor: string }) {
  const list = listCompetitors()
  const stub = list.find((c) => c.slug === competitor)
  const published = list.filter((c) => c.status === 'published')

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <MarketingHeader />
      <section className="mx-auto w-full max-w-2xl px-4 py-16 md:py-24 flex-1 text-center">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-3">Comparison</p>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          Lakshya vs {stub?.competitorName ?? competitor}
        </h1>
        <p className="text-sm text-text-2 mb-1">Coming soon.</p>
        {stub?.oneLiner && <p className="text-[13px] text-text-2 max-w-md mx-auto mb-8 italic">{stub.oneLiner}</p>}

        <Link
          href="/login?ref=compare-stub"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
        >
          Try Lakshya free
        </Link>

        {published.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xs uppercase tracking-widest text-text-2 mb-4">Available now</h2>
            <ul className="flex flex-wrap justify-center gap-2">
              {published.map((stub) => (
                <li key={stub.slug}>
                  <Link
                    href={`/compare/${stub.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border border-white/15 text-white hover:border-white/30"
                  >
                    Lakshya vs {stub.competitorName} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}
