import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ARCHETYPES } from '@/lib/careerops/archetypes'
import { getGuide, listGuideStubs, isGuideSlug } from '@/content/guides'
import { JsonLd } from '@/components/seo/JsonLd'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

interface PageProps {
  params: Promise<{ archetype: string }>
}

export function generateStaticParams() {
  return ARCHETYPES.map((a) => ({ archetype: a }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { archetype } = await params
  if (!isGuideSlug(archetype)) {
    return { title: 'Guide not found', robots: { index: false, follow: false } }
  }
  const guide = getGuide(archetype)
  if (!guide) {
    const stubs = listGuideStubs()
    const stub = stubs.find((s) => s.archetype === archetype)
    return {
      title: stub ? `${stub.title} (coming soon)` : 'Guide coming soon',
      description: 'Lakshya archetype guide — currently in production.',
      robots: { index: false, follow: true },
    }
  }
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `/guides/${guide.slug}`,
      type: 'article',
      images: [{ url: `/og?page=guide&archetype=${guide.archetype}`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.metaDescription,
      images: [`/og?page=guide&archetype=${guide.archetype}`],
    },
  }
}

export default async function GuidePage({ params }: PageProps) {
  const { archetype } = await params
  if (!isGuideSlug(archetype)) notFound()

  const guide = getGuide(archetype)
  if (!guide) return <ComingSoon archetype={archetype} />

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: { '@type': 'Organization', name: 'Lakshya' },
    publisher: {
      '@type': 'Organization',
      name: 'Lakshya',
      logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/guides/${guide.slug}` },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',   item: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.archetype, item: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/guides/${guide.slug}` },
    ],
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />

      <MarketingHeader />

      <article className="mx-auto w-full max-w-2xl px-4 py-12 md:px-6 md:py-16 flex-1">
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-text-2">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-white" aria-current="page">{guide.archetype}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-text-2 mb-3">archetype guide · {guide.archetype}</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
            {guide.title}
          </h1>
          <p className="text-sm md:text-base text-text-2 italic">{guide.tagline}</p>
        </header>

        <div className="space-y-5 text-[15px] leading-relaxed text-white/85">
          {guide.intro.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <Section title="Who hires for this role">
          <ul className="space-y-2 list-disc pl-5 text-white/85">
            {guide.whoHires.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>

        {guide.sections.map((s) => (
          <Section key={s.heading} title={s.heading}>
            <div className="space-y-4 text-[15px] leading-relaxed text-white/85">
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} className="whitespace-pre-wrap">{para}</p>
              ))}
            </div>
          </Section>
        ))}

        <Section title="The interview loop, stage by stage">
          <div className="space-y-3">
            {guide.interviewLoop.map((step, i) => (
              <div key={step.stage} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex w-6 h-6 rounded-md bg-[color:var(--accent)]/15 border border-[color:var(--accent)]/30 items-center justify-center text-[color:var(--accent)] text-[11px] font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{step.stage}</h3>
                  <span className="ml-auto text-[11px] text-text-2">{step.format}</span>
                </div>
                <p className="text-[13px] text-white/75 mb-1.5"><span className="text-text-2">Signal:</span> {step.signal}</p>
                <p className="text-[13px] text-white/75"><span className="text-text-2">Prep:</span> {step.prep}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Skills inventory">
          {guide.skills.map((cat) => (
            <div key={cat.category} className="mb-4">
              <h3 className="text-xs uppercase tracking-widest text-text-2 mb-2">{cat.category}</h3>
              <ul className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <li key={s} className="px-2.5 py-1 rounded-full text-[12px] bg-white/[0.04] border border-white/10 text-white/85">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Salary bands by region">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-text-2">
                  <th className="px-2 py-2 font-medium">Region</th>
                  <th className="px-2 py-2 font-medium">IC Senior</th>
                  <th className="px-2 py-2 font-medium">Staff</th>
                  <th className="px-2 py-2 font-medium">Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {guide.salaryBands.map((row) => (
                  <tr key={row.region}>
                    <td className="px-2 py-2.5 font-medium text-white">{row.region}</td>
                    <td className="px-2 py-2.5 tabular-nums text-white/85">{row.iC}</td>
                    <td className="px-2 py-2.5 tabular-nums text-white/85">{row.staff}</td>
                    <td className="px-2 py-2.5 tabular-nums text-white/85">{row.principal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-text-2">
            Sources: {guide.salaryBands.map((r) => r.source).filter((s, i, a) => a.indexOf(s) === i).join(' · ')}
          </p>
        </Section>

        <Section title="Common rejection patterns + recovery">
          <div className="space-y-3">
            {guide.rejectionPatterns.map((rp) => (
              <div key={rp.pattern} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold text-white mb-1.5">{rp.pattern}</h3>
                <p className="text-[13px] text-text-2 mb-2"><span className="text-white/50">Why:</span> {rp.why}</p>
                <p className="text-[13px] text-white/85"><span className="text-text-2">Recovery:</span> {rp.recovery}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="FAQ">
          <dl className="space-y-3">
            {guide.faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <dt className="text-sm font-semibold text-white">{f.q}</dt>
                <dd className="mt-2 text-[13px] text-text-2 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <section className="mt-12 rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.05] p-6 text-center">
          <h2 className="text-base md:text-lg font-semibold text-white mb-2">
            Want to know if a real {guide.archetype} role fits you?
          </h2>
          <p className="text-[13px] text-text-2 mb-4 max-w-md mx-auto">
            Paste any AI Platform JD — get a 7-block A-G evaluation in 30 seconds. Free 3 evals/month.
          </p>
          <Link
            href="/login?ref=guide-cta"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
          >
            Start free
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </article>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-2">
          <span>Last updated {guide.updatedAt}</span>
          <span>
            Built on{' '}
            <a className="underline underline-offset-2 hover:text-white" href="https://github.com/santifer/career-ops" target="_blank" rel="noreferrer noopener">
              career-ops
            </a>{' '}
            (santifer, MIT)
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

function ComingSoon({ archetype }: { archetype: string }) {
  const stubs = listGuideStubs()
  const published = stubs.filter((s) => s.status === 'published')

  return (
    <main className="min-h-screen bg-[#07070b] text-white flex flex-col">
      <MarketingHeader />
      <section className="mx-auto w-full max-w-2xl px-4 py-16 md:py-24 flex-1 text-center">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-3">archetype · {archetype}</p>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">Guide coming soon</h1>
        <p className="text-sm text-text-2 mb-8 max-w-md mx-auto">
          We&apos;re writing the {archetype} archetype guide. In the meantime, you can run an A-G
          evaluation against any {archetype} JD and get a structured verdict in 30 seconds.
        </p>
        <Link
          href="/login?ref=guide-stub"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
        >
          Run an A-G evaluation
        </Link>

        {published.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xs uppercase tracking-widest text-text-2 mb-4">Available now</h2>
            <ul className="flex flex-wrap justify-center gap-2">
              {published.map((stub) => (
                <li key={stub.archetype}>
                  <Link
                    href={`/guides/${stub.archetype}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border border-white/15 text-white hover:border-white/30"
                  >
                    {stub.archetype} →
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
