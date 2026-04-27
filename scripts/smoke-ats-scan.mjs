#!/usr/bin/env node
/**
 * Smoke test: hit each curated portal directly (no auth, no Apify) and
 * confirm the public API still responds + parses cleanly. Lets us verify
 * a slug list refresh without going through the full Next.js + Supabase
 * auth path.
 *
 * Run from repo root: `npx tsx scripts/smoke-ats-scan.mjs`
 */
import { fetchPortalJobs } from '../src/lib/careerops/scanAtsApi.ts'
import { PORTAL_SEEDS } from '../src/data/portal-seeds.ts'

const start = Date.now()

const results = await Promise.all(
  PORTAL_SEEDS.map(async (s) => {
    const t0 = Date.now()
    const jobs = await fetchPortalJobs({ portal: s.portal, slug: s.slug, company: s.company })
    return { ...s, jobs: jobs.length, ms: Date.now() - t0 }
  })
)

const ok = results.filter(r => r.jobs > 0)
const empty = results.filter(r => r.jobs === 0)
const total = results.reduce((s, r) => s + r.jobs, 0)

console.log(`\nScanned ${results.length} portals in ${(Date.now() - start) / 1000}s`)
console.log(`  Live  : ${ok.length}  (${total} jobs)`)
console.log(`  Empty : ${empty.length}\n`)

console.log('LIVE:')
for (const r of ok.sort((a, b) => b.jobs - a.jobs)) {
  console.log(`  ${r.company.padEnd(20)} ${r.portal.padEnd(11)} ${String(r.jobs).padStart(4)} jobs  ${r.ms}ms`)
}

if (empty.length) {
  console.log('\nEMPTY (slug stale OR genuinely no open roles):')
  for (const r of empty) {
    console.log(`  ${r.company.padEnd(20)} ${r.portal.padEnd(11)} ${r.slug}`)
  }
}
