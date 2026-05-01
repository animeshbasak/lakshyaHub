// src/app/page.tsx — RSC. No hooks, no event handlers; safe as a server component.
// Per-page metadata below overrides layout defaults for SEO crawlers.
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Command,
  FileText,
  LineChart,
  Radar,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lakshya — Aim before you apply',
  description: 'Stop wasting hours on jobs you do not fit. Lakshya scores any tech JD against your resume in 30 seconds — A-G rubric, 14 archetypes (AI + general tech), legitimacy detection. Built on career-ops (740+ real evals).',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Lakshya — Aim before you apply',
    description: 'Tech job evaluation that tells you whether a role is worth applying to — before you spend 2 hours on a cover letter.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lakshya — Aim before you apply',
    description: 'Tech job evaluation in 30 seconds. AI + general tech archetypes. Free 3 evals/mo.',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white selection:bg-white/15">
      <LandingNav />

      <main>
        <Hero />
        <LogoStrip />
        <Pillars />
        <WorkflowStrip />
        <FinalCta />
      </main>

      <footer className="border-t border-white/5 px-6 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-white/40 gap-4">
        <div className="flex items-center gap-2.5">
          <Logo small />
          <span className="text-white/70">Lakshya</span>
          <span>· Aim before you apply</span>
        </div>
        <div className="flex gap-6">
          <a href="https://github.com/animeshbasak" className="hover:text-white/80 transition-colors">
            GitHub
          </a>
          <Link href="/profile" className="hover:text-white/80 transition-colors">
            Account
          </Link>
          <span>v0.9 · MIT</span>
        </div>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 inset-x-0 z-50 bg-[#07070b]/85 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-10 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Lakshya home"
          aria-current="page"
          className="flex items-center gap-2 group min-h-[44px]"
        >
          <Logo />
          <span className="text-[13px] font-semibold tracking-tight text-white">Lakshya</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="#pillars"
            className="hidden sm:inline-flex px-2 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] items-center"
          >
            Product
          </a>
          <a
            href="#workflow"
            className="hidden sm:inline-flex px-2 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] items-center"
          >
            Workflow
          </a>
          <Link
            href="/pricing"
            className="px-2 sm:px-3 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] inline-flex items-center"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="px-2 sm:px-3 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] inline-flex items-center"
          >
            About
          </Link>

          <span aria-hidden="true" className="hidden sm:block w-px h-5 bg-white/10 mx-1" />

          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] items-center"
          >
            Sign in
          </Link>
          <Link
            href="/login?ref=marketing-cta"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-white text-[#07070b] px-3 py-2 rounded-md hover:bg-white/90 transition-colors min-h-[36px]"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 18 : 22
  return (
    <div
      className="rounded-[5px] border border-white/15 bg-white/[0.04] grid place-items-center"
      style={{ width: size, height: size }}
    >
      <div className="w-1.5 h-1.5 rounded-[1px] bg-white/90" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-6 md:px-10 border-b border-white/5">
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.02] text-[11px] text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
          <span className="font-medium text-white/80">v0.9</span>
          <span className="text-white/30">·</span>
          <span>Resume parser, ATS engine, job pipeline</span>
        </div>

        <h1 className="text-[44px] md:text-[68px] leading-[1.02] tracking-[-0.02em] font-semibold max-w-4xl">
          The operating system for
          <br />
          <span className="text-white/50">running your job search</span>
          <span className="text-white"> like a project.</span>
        </h1>

        <p className="mt-6 text-[15px] md:text-base text-white/55 max-w-2xl leading-relaxed">
          For tech job seekers who refuse to spray 50+ applications hoping
          something sticks. Backend, frontend, mobile, devops, ML, AI, PM —
          Lakshya scores any tech JD against your resume in 30 seconds. 14
          archetypes covered. Built on the career-ops methodology (740+ real
          evals; rubric is open-source and audit-able).
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/evaluate"
            className="inline-flex items-center gap-2 bg-white text-[#07070b] text-sm font-medium px-4 py-2.5 rounded-md hover:bg-white/90 transition-colors min-h-[44px]"
          >
            Run your first eval
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-white/10 text-white/80 text-sm font-medium px-4 py-2.5 rounded-md hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
          >
            See pricing
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-white/40 ml-1">
            <Command className="w-3.5 h-3.5" />
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[10px] font-mono text-white/70">
              ⌘K
            </kbd>
            for actions
          </span>
        </div>

        {/* Console-style product callout */}
        <div className="mt-14 md:mt-20 max-w-5xl">
          <div className="rounded-lg border border-white/10 bg-[#0b0b12] overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="ml-2 text-[11px] font-mono text-white/40">
                  lakshya · board
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/30">
                commit 3f9a · last sync 12s
              </span>
            </div>
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
              <ConsoleColumn
                label="Applied"
                metric="17"
                rows={[
                  'Staff Engineer · Ramp',
                  'Frontend Lead · Linear',
                  'Senior SWE · Vercel',
                ]}
              />
              <ConsoleColumn
                label="In review"
                metric="5"
                rows={[
                  'Principal FE · Retool',
                  'Sr Staff · Figma',
                  'Platform Lead · Attio',
                ]}
                highlight
              />
              <ConsoleColumn
                label="Offer"
                metric="1"
                rows={['Head of FE · Series-B fintech']}
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-white/35 font-mono">
            representative UI — real data lives in /board
          </p>
        </div>
      </div>
    </section>
  )
}

function ConsoleColumn({
  label,
  metric,
  rows,
  highlight,
}: {
  label: string
  metric: string
  rows: string[]
  highlight?: boolean
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          {label}
        </span>
        <span
          className={`text-[11px] font-mono ${
            highlight ? 'text-white' : 'text-white/50'
          }`}
        >
          {metric}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r}
            className="text-[12px] text-white/75 border border-white/5 bg-white/[0.015] rounded-md px-2.5 py-2 flex items-center justify-between"
          >
            <span className="truncate">{r}</span>
            <ArrowUpRight className="w-3 h-3 text-white/25 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Logo strip (social proof / stack honesty)
// ─────────────────────────────────────────────────────────────────────────────

function LogoStrip() {
  const items = [
    'Next.js 16',
    'React 19',
    'Supabase SSR',
    'Anthropic',
    'Gemini',
    'Groq',
    '@react-pdf',
    'Zustand',
  ]
  return (
    <section className="border-b border-white/5 py-6 px-6 md:px-10">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <span className="text-[11px] uppercase tracking-wider text-white/30 mr-2">
          Built on
        </span>
        {items.map((i) => (
          <span key={i} className="text-[12px] text-white/45 font-mono">
            {i}
          </span>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pillars
// ─────────────────────────────────────────────────────────────────────────────

function Pillars() {
  return (
    <section id="pillars" className="py-20 md:py-28 px-6 md:px-10 border-b border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Product"
          title="Three connected surfaces. One source of truth."
          caption="Every piece of data — the role, the JD, the tailored resume, the ATS score, the recruiter contact — lives in a single graph. No spreadsheet. No copy-paste."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-lg border border-white/5 overflow-hidden">
          <PillarCard
            icon={Workflow}
            eyebrow="01 · Board"
            title="Kanban tracker that compiles from search."
            body="Jobs you save from the discovery engine drop straight into Applied → Interviewing → Offer. Keyboard-driven. No drag needed."
            href="/board"
          />
          <PillarCard
            icon={FileText}
            eyebrow="02 · Resume"
            title="Parser-first builder, not another form."
            body="Upload a PDF or DOCX and the layout-aware parser recovers sections even from 2-column templates. ATS score and suggestions update live."
            href="/resume"
          />
          <PillarCard
            icon={Radar}
            eyebrow="03 · Match"
            title="JD fit, skill gaps, and ghost-job signals."
            body="Paste a job description and get a 7-block A-G evaluation — archetype detection, legitimacy tier, gap analysis — before you spend time applying."
            href="/evaluate"
          />
        </div>
      </div>
    </section>
  )
}

function PillarCard({
  icon: Icon,
  eyebrow,
  title,
  body,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  eyebrow: string
  title: string
  body: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group p-7 bg-[#07070b] hover:bg-white/[0.015] transition-colors relative"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-mono mb-6">
        <Icon className="w-3.5 h-3.5" />
        {eyebrow}
      </div>
      <h3 className="text-[19px] leading-snug font-medium tracking-tight text-white mb-3">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-white/50">{body}</p>
      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/70 transition-colors absolute top-6 right-6" />
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow strip
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowStrip() {
  const steps = [
    {
      n: '01',
      k: 'Import',
      icon: FileText,
      desc: 'Upload PDF / DOCX — parser recovers sections even from 2-col layouts.',
    },
    {
      n: '02',
      k: 'Target',
      icon: Briefcase,
      desc: 'Paste a JD. Get 5-dimension fit score, missing keywords, ghost-job risk.',
    },
    {
      n: '03',
      k: 'Rewrite',
      icon: Sparkles,
      desc: 'Bullet rewrite, compact, and skim — every AI change is shown as a diff.',
    },
    {
      n: '04',
      k: 'Track',
      icon: LineChart,
      desc: 'Applications flow into the board. No spreadsheet hand-off.',
    },
  ]

  return (
    <section id="workflow" className="py-20 md:py-28 px-6 md:px-10 border-b border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Workflow"
          title="One pass, end-to-end."
          caption="Import → target → rewrite → track. No tool switching. Everything auditable."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.n}
                className="rounded-lg border border-white/10 bg-white/[0.015] p-5"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-[10px] text-white/35">
                    {s.n}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-white/45" />
                </div>
                <h4 className="text-[14px] font-medium text-white mb-1.5">
                  {s.k}
                </h4>
                <p className="text-[12.5px] leading-relaxed text-white/50">
                  {s.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <Terminal className="w-5 h-5 text-white/40 mx-auto mb-6" />
        <h2 className="text-[34px] md:text-[46px] leading-[1.05] tracking-[-0.02em] font-semibold text-white max-w-3xl mx-auto">
          Run your next role like you'd run a launch.
        </h2>
        <p className="mt-5 text-[15px] text-white/55 max-w-xl mx-auto">
          No dashboards full of vanity widgets. Just the workflow, the parser,
          the ATS engine, and a shortcut for every surface.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/evaluate"
            className="inline-flex items-center gap-2 bg-white text-[#07070b] text-sm font-medium px-4 py-2.5 rounded-md hover:bg-white/90 transition-colors min-h-[44px]"
          >
            Run your first eval
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-white/10 text-white/80 text-sm font-medium px-4 py-2.5 rounded-md hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
          >
            Import resume
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string
  title: string
  caption: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-4">
        {eyebrow}
      </div>
      <h2 className="text-[30px] md:text-[38px] leading-[1.1] tracking-[-0.02em] font-semibold text-white">
        {title}
      </h2>
      <p className="mt-4 text-[14.5px] text-white/55 leading-relaxed">
        {caption}
      </p>
    </div>
  )
}
