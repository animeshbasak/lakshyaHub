#!/usr/bin/env node
/**
 * Live smoke for the unified job-search aggregator. Hits all 6 adapters
 * against three queries (Frontend Engineer / AI Platform / Data Engineer)
 * × three regions (IN / REMOTE / GLOBAL) and reports counts.
 *
 * Run: `npx tsx scripts/smoke-jobsearch.mjs`
 */
import { aggregate } from '../src/lib/jobsearch/aggregator.ts'

const queries = ['Lead Frontend Engineer', 'AI Platform Engineer', 'Senior Data Engineer']
const regions = ['IN', 'REMOTE', 'GLOBAL']

// Loads ADZUNA_APP_ID + ADZUNA_APP_KEY from .env.local for the smoke run.
import fs from 'node:fs'
try {
  const env = fs.readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* missing .env.local is fine */ }

console.log('query × region                                portals  raw  uniq  ms')
console.log('────────────────────────────────────────────  ───────  ───  ────  ────')

for (const q of queries) {
  for (const r of regions) {
    const t0 = Date.now()
    const result = await aggregate({ query: q, region: r })
    const wall = Date.now() - t0
    const padQ = (q + ' × ' + r).padEnd(46)
    const portalsLine = result.byAdapter.length.toString().padStart(7)
    const rawLine = result.totalRaw.toString().padStart(3)
    const uniqLine = result.totalDeduped.toString().padStart(4)
    const msLine = wall.toString().padStart(4)
    console.log(`${padQ}  ${portalsLine}  ${rawLine}  ${uniqLine}  ${msLine}`)
  }
}

console.log('\n--- per-adapter detail (Lead Frontend Engineer × GLOBAL) ---')
const detail = await aggregate({ query: 'Lead Frontend Engineer', region: 'GLOBAL' })
for (const a of detail.byAdapter) {
  console.log(`  ${a.adapter.padEnd(20)}  count=${String(a.jobs.length).padStart(3)}  ${a.durationMs}ms${a.error ? '  ERROR: ' + a.error : ''}`)
}

console.log('\n--- per-adapter detail (Frontend × IN) ---')
const detailIn = await aggregate({ query: 'Frontend Engineer', region: 'IN' })
for (const a of detailIn.byAdapter) {
  console.log(`  ${a.adapter.padEnd(20)}  count=${String(a.jobs.length).padStart(3)}  ${a.durationMs}ms${a.error ? '  ERROR: ' + a.error : ''}`)
}

if (detailIn.jobs.length > 0) {
  console.log('\n--- top 5 IN results ---')
  for (const j of detailIn.jobs.slice(0, 5)) {
    console.log(`  [${j.source}] ${j.title} @ ${j.company} (${j.location ?? '—'})`)
  }
}
