import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ScoreHero } from '@/app/(dashboard)/eval/[id]/ScoreHero'
import { BlockAccordion } from '@/app/(dashboard)/eval/[id]/BlockAccordion'

interface PageProps {
  params: Promise<{ id: string }>
}

interface PublicEvalRow {
  id: string
  jd_url: string | null
  company: string | null
  role: string | null
  archetype: string | null
  score: number | null
  legitimacy_tier: 'high' | 'caution' | 'suspicious' | null
  report_md: string | null
  anon_level: 'full_anon' | 'company_only' | 'user_named'
  is_public: boolean
  shared_at: string | null
}

function anonLabel(row: PublicEvalRow): { company: string | null; role: string | null } {
  if (row.anon_level === 'full_anon') {
    return { company: 'Anonymous company', role: row.role ? `${row.role} (anonymized)` : null }
  }
  return { company: row.company, role: row.role }
}

async function loadPublic(id: string): Promise<PublicEvalRow | null> {
  // Anon-key client; RLS allows SELECT WHERE is_public=true.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const client = createServiceClient(url, key)
  const { data, error } = await client
    .from('evaluations')
    .select('id, jd_url, company, role, archetype, score, legitimacy_tier, report_md, anon_level, is_public, shared_at')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle()

  if (error || !data) return null
  return data as PublicEvalRow
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const row = await loadPublic(id)
  if (!row) return { title: 'Evaluation', robots: { index: false, follow: false } }

  const labeled = anonLabel(row)
  const title = labeled.role
    ? `${labeled.role}${labeled.company ? ' at ' + labeled.company : ''} · Lakshya`
    : 'A-G Evaluation · Lakshya'
  const desc = `Scored ${row.score?.toFixed(1) ?? '—'}/5 · Archetype: ${row.archetype ?? 'unknown'} · Legitimacy: ${row.legitimacy_tier ?? 'unknown'}`

  // Dynamic OG card with score ring + archetype badge per /og?page=eval
  const ogParams = new URLSearchParams({
    page: 'eval',
    score: String(row.score ?? 0),
    archetype: row.archetype ?? '',
    company: labeled.company ?? 'Anonymous company',
  })
  const ogUrl = `/og?${ogParams.toString()}`

  return {
    title,
    description: desc,
    alternates: { canonical: `/share/${id}` },
    openGraph: {
      title,
      description: desc,
      type: 'article',
      url: `/share/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [ogUrl] },
  }
}

export default async function PublicEvalPage({ params }: PageProps) {
  const { id } = await params
  const row = await loadPublic(id)
  if (!row) notFound()

  const labeled = anonLabel(row)
  const evalShape = {
    company: labeled.company,
    role: labeled.role,
    archetype: row.archetype,
    score: row.score,
    legitimacy_tier: row.legitimacy_tier,
    jd_url: row.anon_level === 'user_named' ? row.jd_url : null,
  }

  // JSON-LD Article schema for rich results
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${labeled.role ?? 'A-G Evaluation'}${labeled.company ? ` at ${labeled.company}` : ''}`,
    datePublished: row.shared_at ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Lakshya',
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app',
    },
    description: `Scored ${row.score?.toFixed(1) ?? '—'}/5 across the career-ops A-G rubric.`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'}/share/${id}` },
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <header className="border-b border-white/5 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white hover:text-white/80">
            Lakshya
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-text-2">Public evaluation</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 space-y-8">
        <ScoreHero evaluation={evalShape} />
        <BlockAccordion reportMd={row.report_md ?? ''} />

        <section className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 p-5 md:p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Get your own A-G evaluation</h2>
          <p className="text-sm text-text-2 mb-4">
            Free 3 evals/mo. Built on the career-ops methodology — 740+ real evals, no fluff.
          </p>
          <Link
            href="/?ref=share"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-[#07070b] font-medium text-sm hover:bg-white/90 transition-colors min-h-[44px]"
          >
            Start free
          </Link>
        </section>

        <footer className="text-[11px] text-text-2 flex flex-wrap gap-3 pt-6 border-t border-white/5 justify-between">
          <span>Anonymization: {row.anon_level.replace('_', ' ')}</span>
          {row.shared_at && <span>Shared {new Date(row.shared_at).toLocaleDateString()}</span>}
          <span className="ml-auto">
            Built on{' '}
            <a className="underline underline-offset-2 hover:text-white" href="https://github.com/santifer/career-ops" target="_blank" rel="noreferrer noopener">
              career-ops
            </a>{' '}
            (santifer, MIT)
          </span>
        </footer>
      </div>
    </main>
  )
}
