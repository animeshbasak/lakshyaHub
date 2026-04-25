import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Lakshya is a careerops-based AI job-evaluator. Built on santifer\'s career-ops methodology (740+ real evals, MIT).',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-white">
      <header className="border-b border-white/5 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white hover:text-white/80">
            Lakshya
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/pricing" className="text-text-2 hover:text-white">Pricing</Link>
            <Link href="/login" className="text-text-2 hover:text-white">Sign in</Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20 prose-invert">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-3">About</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 leading-tight">
          We turned a proven CLI into a webapp.
        </h1>

        <div className="space-y-5 text-[15px] leading-relaxed text-white/85">
          <p>
            Lakshya is built on{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noreferrer noopener"
            >
              career-ops
            </a>
            , a job-search methodology by{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://github.com/santifer"
              target="_blank"
              rel="noreferrer noopener"
            >
              santifer
            </a>{' '}
            that produced 740+ real evaluations and led to a Head of Applied AI role.
            The method works. The CLI is unforgiving for non-engineers.
            We turned it into a webapp.
          </p>

          <p>
            Every evaluation runs the same 7-block A-G rubric — from candidate-fit through to
            legitimacy detection — that career-ops uses. We didn&apos;t reinvent the prompts; we
            ported them with attribution under MIT and built the multi-tenant infrastructure
            around them.
          </p>

          <h2 className="text-lg font-semibold text-white mt-8 mb-2">Non-negotiables</h2>
          <ul className="space-y-2 list-disc pl-5 text-white/85">
            <li>Score &lt; 4.0/5 → we advise against applying. No coercion, no dark patterns.</li>
            <li>Never auto-submit applications. Human-in-the-loop, always.</li>
            <li>User CV + evaluations are yours. Export anytime, delete anytime.</li>
            <li>BYOK keys encrypted at rest with AES-GCM, never logged.</li>
            <li>MIT attribution to santifer on every prompt file, in this footer, and in the README.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white mt-8 mb-2">What &ldquo;Lakshya&rdquo; means</h2>
          <p>
            <em>Lakshya</em> (Sanskrit: <span className="font-mono">लक्ष्य</span>) means &ldquo;target,&rdquo; or &ldquo;aim.&rdquo;
            Tagline: <em>aim before you apply.</em> Most job-seekers fire blindly across 200
            applications. The career-ops method is the opposite — score first, then commit your
            two hours of cover-letter time only to the jobs that earned it.
          </p>

          <p className="text-[12px] text-text-2 border-l border-white/10 pl-3 mt-4">
            Disambiguation: This Lakshya is a careerops AI SaaS — not affiliated with{' '}
            <a className="hover:text-white underline" href="https://en.wikipedia.org/wiki/Lakshya_Mittal" target="_blank" rel="noreferrer noopener">Lakshya Mittal</a>,
            the{' '}
            <a className="hover:text-white underline" href="https://en.wikipedia.org/wiki/Lakshya_(film)" target="_blank" rel="noreferrer noopener">2004 film</a>,
            or any unrelated entity sharing the name.
          </p>
        </div>
      </article>

      <footer className="border-t border-white/5 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl text-[11px] text-text-2">
          <span>
            Built on{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noreferrer noopener"
            >
              career-ops
            </a>{' '}
            (santifer, MIT) · Lakshya v0.9
          </span>
        </div>
      </footer>
    </main>
  )
}
