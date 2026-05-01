// src/app/(dashboard)/discover/page.tsx
import type { Metadata } from 'next'
import { UnifiedSearchPanel } from './UnifiedSearchPanel.client'

export const metadata: Metadata = {
  title: 'Discover jobs · Lakshya',
  description: 'Search 6 free job sources at once — Remotive, RemoteOK, HN Hiring, WeWorkRemotely, Naukri, and direct ATS portals.',
}

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Discover jobs</h1>
        <p className="text-sm text-text-2 mt-1 leading-relaxed">
          One search · 6 free sources in parallel. Remotive, RemoteOK, HN Who&apos;s Hiring,
          WeWorkRemotely, Naukri (India), and direct Greenhouse/Ashby/Lever portals.
        </p>
      </header>

      <UnifiedSearchPanel />
    </div>
  )
}
