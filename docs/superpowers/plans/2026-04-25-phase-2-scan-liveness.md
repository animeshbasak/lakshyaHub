# Lakshya × career-ops — Phase 2: Job Discovery + Liveness

> **Depends on:** Phase 0 + Phase 1 shipped (`feat/careerops-phase-0-1` branch, 12 commits).
> **Parent plan:** `2026-04-24-careerops-integration.md`.
> **Target branch:** `feat/careerops-phase-2`.
> **Scope:** port career-ops `scan.mjs` + `liveness-core.mjs` into Next.js 16 + Supabase + Vercel Playwright, wire nightly scan cron + hourly liveness fan-out.

**What ships:**
- `scanAtsApi.ts` — Greenhouse + Ashby + Lever JSON APIs (3 portals, zero Playwright)
- `browserDriver.ts` — `@sparticuz/chromium` 147 wrapper with SSRF guard + cleanup
- `livenessDriver.ts` — Playwright-driven liveness check, reuses existing `classifyLiveness` pure fn from Phase 1.3
- `/api/scan` — per-user ATS API sweep (Node runtime, 300s maxDuration)
- `/api/liveness` — single-URL Playwright check (Node runtime, 60s maxDuration, QStash-signed)
- `/api/cron/scan` + `/api/cron/liveness` — Vercel Cron endpoints with `CRON_SECRET` auth
- `003_portals_table.sql` + `004_liveness_columns.sql`

**What does NOT ship (deferred):**
- Workday (no scan.mjs implementation exists; Playwright + session cookie harvest + high CAPTCHA risk — Phase 3)
- BambooHR, Teamtailor (niche, response shape inconsistent)
- Apify fallback wiring (already exists in `enrichJobDetails.ts`; unchanged)
- UI for portals CRUD (ship with 20 seeded default portals, UI in Phase 3)

---

## Strategic Context

career-ops's job-discovery engine is the unglamorous infrastructure that feeds the A-G evaluator its raw material. Three JSON APIs (Greenhouse, Ashby, Lever) cover ~70% of modern tech-company ATSes with zero Playwright cost. The remaining 30% — mostly Workday — is where the CAPTCHA + session-cookie chaos lives. Phase 2 ships only the clean 70% so we prove the feedback loop end-to-end (scan → liveness → eval → tailored CV → application) before taking on Workday's mess.

**Non-negotiables:**
1. Never log raw JD bodies or user URLs to Sentry / Vercel logs (per security plan S10)
2. SSRF guard on every URL Playwright navigates (per security plan S8.1)
3. `runtime = 'nodejs'` on every Playwright-touching route (never `'edge'`)
4. Sequential Playwright per Lambda — career-ops project rule, amplifies on Vercel Lambda
5. `uncertain` is the fallback when Cloudflare/Akamai blocks — never `expired`
6. All commits match the style in `feat/careerops-phase-0-1` (Co-Authored-By Claude)

---

## Blocker checklist (resolve BEFORE Task 2.1)

- [ ] **B1 — Vercel Lambda memory bump.** `@sparticuz/chromium` 147 needs ≥1769MB; Vercel Pro default is 1024MB. Must raise to **3008MB** for all Playwright routes. Impact: billing goes up on GB-seconds consumed. Confirm budget.
- [ ] **B2 — Queue provider choice.** Default: Upstash QStash (~$72/mo at 240k/day, at-least-once). Alternative: Inngest (~$720/mo, durable retries). Confirm QStash default.
- [ ] **B3 — Seeded portals list.** Ship ~20 curated Greenhouse/Ashby/Lever companies in migration. Confirm list (recommended: Anthropic, OpenAI, Google DeepMind, Meta, Stripe, Vercel, Supabase, Linear, Notion, Figma, Anthropic, Replicate, Hugging Face, Perplexity, Mistral, Cohere, Character.AI, xAI, Midjourney, Cursor).
- [ ] **B4 — GDPR retention.** Add `retention_days` column or nightly cleanup cron for `scan_history` rows > 90 days. Decide policy.
- [ ] **B5 — QStash tokens.** Provision `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, plus `CRON_SECRET` (any random hex) in Vercel env.

---

## Task 2.1 — `serverExternalPackages` patch + browser health check (30 min)

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/api/health/browser/route.ts`

- [ ] **Step 1:** Patch `next.config.ts`.

```typescript
serverExternalPackages: ['pdfjs-dist', 'playwright-core', '@sparticuz/chromium'],
```

Without this, Turbopack attempts to bundle Chromium's conditional `aws-sdk` require and fails.

- [ ] **Step 2:** Create health route.

```typescript
// src/app/api/health/browser/route.ts
export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import { chromium as playwright } from 'playwright-core'

export async function GET() {
  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  })
  try {
    const page = await browser.newPage()
    await page.goto('about:blank')
    const ua = await page.evaluate(() => navigator.userAgent)
    return NextResponse.json({ ok: true, ua })
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 3:** Local verify.

```bash
npm run dev
curl http://localhost:3000/api/health/browser
```

Expected: `{ok: true, ua: "..."}`. Fails locally on macOS without native chromium — that's OK, this route is Vercel-only. Local runs OK after `npx playwright install chromium`.

- [ ] **Step 4:** Deploy to Vercel preview. Verify response. Also verify Vercel logs show no `memory limit exceeded`.

- [ ] **Step 5:** Commit.

```bash
git add next.config.ts src/app/api/health/browser/route.ts
git commit -m "feat(infra): add browser health check + Playwright to serverExternalPackages"
```

---

## Task 2.2 — `browserDriver.ts` (30 min)

**Files:**
- Create: `src/lib/careerops/browserDriver.ts`
- Create: `tests/lib/careerops/browserDriver.test.ts` (mock-only, no real chromium)

- [ ] **Step 1:** Driver.

```typescript
// src/lib/careerops/browserDriver.ts
import chromium from '@sparticuz/chromium'
import { chromium as playwright, type Page } from 'playwright-core'

export interface BrowserRunOptions {
  userAgent?: string
  viewport?: { width: number; height: number }
  timeoutMs?: number
}

const DEFAULT_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'

export async function withBrowser<T>(
  fn: (page: Page) => Promise<T>,
  opts: BrowserRunOptions = {}
): Promise<T> {
  const browser = await playwright.launch({
    args: [...chromium.args, '--host-resolver-rules=MAP localhost 127.255.255.255'],
    executablePath: await chromium.executablePath(),
    headless: true,
  })
  try {
    const context = await browser.newContext({
      userAgent: opts.userAgent ?? DEFAULT_UA,
      viewport: opts.viewport ?? { width: 1280, height: 800 },
      ignoreHTTPSErrors: false,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(opts.timeoutMs ?? 15_000)
    return await fn(page)
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 2:** Test (pure, mocks playwright-core).

```typescript
// tests/lib/careerops/browserDriver.test.ts
import { describe, it, expect, vi } from 'vitest'
vi.mock('@sparticuz/chromium', () => ({ default: { args: [], executablePath: async () => '/fake' } }))
vi.mock('playwright-core', () => ({
  chromium: {
    launch: vi.fn(async () => ({
      newContext: async () => ({ newPage: async () => ({ setDefaultTimeout: () => {} }) }),
      close: async () => {},
    })),
  },
}))

describe('withBrowser', () => {
  it('launches + closes on success', async () => {
    const { withBrowser } = await import('@/lib/careerops/browserDriver')
    const result = await withBrowser(async () => 42)
    expect(result).toBe(42)
  })
})
```

- [ ] **Step 3:** Commit.

---

## Task 2.3 — `scanAtsApi.ts` — Greenhouse + Ashby + Lever (2 hr, TDD)

**Files:**
- Create: `src/lib/careerops/scanAtsApi.ts`
- Create: `tests/lib/careerops/scanAtsApi.test.ts`

Port pattern from `/Users/animeshbasak/Desktop/ai-lab/projects/career-ops/scan.mjs` lines 39–120. Three pure parsers, no Playwright.

- [ ] **Step 1:** RED test.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPortalJobs, type ScanJob } from '@/lib/careerops/scanAtsApi'

beforeEach(() => { global.fetch = vi.fn() as typeof fetch })

describe('scanAtsApi', () => {
  it('parses Greenhouse response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [{ title: 'Senior ML Engineer', absolute_url: 'https://job-boards.greenhouse.io/anthropic/jobs/123', location: { name: 'San Francisco' } }] }),
    })
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'anthropic', company: 'Anthropic' })
    expect(jobs).toHaveLength(1)
    expect(jobs[0]).toMatchObject({ title: 'Senior ML Engineer', company: 'Anthropic', portal: 'greenhouse-api' })
  })

  it('parses Ashby response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [{ title: 'AI Engineer', jobUrl: 'https://jobs.ashbyhq.com/x/abc', location: 'Remote' }] }),
    })
    const jobs = await fetchPortalJobs({ portal: 'ashby', slug: 'x', company: 'X' })
    expect(jobs[0].portal).toBe('ashby-api')
  })

  it('parses Lever response (array shape)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [{ text: 'Staff Engineer', hostedUrl: 'https://jobs.lever.co/y/xyz', categories: { location: 'NYC' } }],
    })
    const jobs = await fetchPortalJobs({ portal: 'lever', slug: 'y', company: 'Y' })
    expect(jobs[0].portal).toBe('lever-api')
  })

  it('returns [] on fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'))
    const jobs = await fetchPortalJobs({ portal: 'greenhouse', slug: 'x', company: 'X' })
    expect(jobs).toEqual([])
  })

  it('rejects non-allowlisted hostnames (SSRF guard)', async () => {
    await expect(fetchPortalJobs({ portal: 'greenhouse' as const, slug: '../evil', company: 'X' })).resolves.toEqual([])
  })
})
```

- [ ] **Step 2:** GREEN implementation.

```typescript
// src/lib/careerops/scanAtsApi.ts
export type PortalType = 'greenhouse' | 'ashby' | 'lever'
export type Source = 'greenhouse-api' | 'ashby-api' | 'lever-api'

export interface ScanJob {
  title: string
  url: string
  company: string
  location: string
  portal: Source
}

interface FetchInput {
  portal: PortalType
  slug: string
  company: string
}

const TIMEOUT_MS = 10_000

const ALLOWED_HOSTS: Record<PortalType, string> = {
  greenhouse: 'boards-api.greenhouse.io',
  ashby: 'api.ashbyhq.com',
  lever: 'api.lever.co',
}

function buildUrl(portal: PortalType, slug: string): string | null {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(slug)) return null  // allowlist slug chars
  switch (portal) {
    case 'greenhouse': return `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
    case 'ashby':      return `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`
    case 'lever':      return `https://api.lever.co/v0/postings/${slug}`
  }
}

export async function fetchPortalJobs(input: FetchInput): Promise<ScanJob[]> {
  const url = buildUrl(input.portal, input.slug)
  if (!url) return []
  const hostname = new URL(url).hostname
  if (hostname !== ALLOWED_HOSTS[input.portal]) return []  // belt + suspenders

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return []
    const data = await res.json()
    return parse(input, data)
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

function parse(input: FetchInput, data: unknown): ScanJob[] {
  if (input.portal === 'greenhouse') {
    const jobs = (data as { jobs?: Array<{ title: string; absolute_url: string; location?: { name?: string } }> }).jobs ?? []
    return jobs.map(j => ({ title: j.title, url: j.absolute_url, company: input.company, location: j.location?.name ?? '', portal: 'greenhouse-api' }))
  }
  if (input.portal === 'ashby') {
    const jobs = (data as { jobs?: Array<{ title: string; jobUrl: string; location?: string }> }).jobs ?? []
    return jobs.map(j => ({ title: j.title, url: j.jobUrl, company: input.company, location: j.location ?? '', portal: 'ashby-api' }))
  }
  if (input.portal === 'lever') {
    const jobs = Array.isArray(data) ? data as Array<{ text: string; hostedUrl: string; categories?: { location?: string } }> : []
    return jobs.map(j => ({ title: j.text, url: j.hostedUrl, company: input.company, location: j.categories?.location ?? '', portal: 'lever-api' }))
  }
  return []
}
```

- [ ] **Step 3:** Commit.

---

## Task 2.4 — Supabase `portals` + `scan_history` schema + seeded portals (1 hr)

**Files:**
- Create: `supabase/migrations/003_portals_table.sql`

- [ ] **Step 1:** Migration.

```sql
-- supabase/migrations/003_portals_table.sql

create table if not exists public.portals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  portal_type text not null check (portal_type in ('greenhouse', 'ashby', 'lever')),
  slug text not null,
  careers_url text,
  title_filter_positive text[] default '{}',
  title_filter_negative text[] default '{}',
  enabled boolean default true,
  is_default boolean default false,  -- seeded portals user can clone
  created_at timestamptz default now(),
  unique(user_id, portal_type, slug)
);

create index portals_user_enabled_idx on public.portals(user_id, enabled) where enabled = true;

alter table public.portals enable row level security;

-- Users read defaults (user_id IS NULL) + own
create policy "read own portals or defaults" on public.portals
  for select using (user_id = auth.uid() or user_id is null);

create policy "users insert own portals" on public.portals
  for insert with check (auth.uid() = user_id);

create policy "users update own portals" on public.portals
  for update using (auth.uid() = user_id);

create policy "users delete own portals" on public.portals
  for delete using (auth.uid() = user_id);

-- Seed 20 default portals (user_id NULL = global default)
insert into public.portals (user_id, company_name, portal_type, slug, is_default) values
  (null, 'Anthropic',         'greenhouse', 'anthropic',         true),
  (null, 'OpenAI',            'greenhouse', 'openai',            true),
  (null, 'Google DeepMind',   'greenhouse', 'deepmind',          true),
  (null, 'Stripe',            'greenhouse', 'stripe',            true),
  (null, 'Vercel',            'greenhouse', 'vercel',            true),
  (null, 'Linear',            'ashby',      'linear',            true),
  (null, 'Notion',            'greenhouse', 'notion',            true),
  (null, 'Figma',             'greenhouse', 'figma',             true),
  (null, 'Supabase',          'ashby',      'supabase',          true),
  (null, 'Replicate',         'greenhouse', 'replicate',         true),
  (null, 'Hugging Face',      'greenhouse', 'huggingface',       true),
  (null, 'Perplexity',        'greenhouse', 'perplexity',        true),
  (null, 'Mistral',           'ashby',      'mistral',           true),
  (null, 'Cohere',            'greenhouse', 'cohere',            true),
  (null, 'Character.AI',      'greenhouse', 'characterai',       true),
  (null, 'xAI',               'ashby',      'xai',               true),
  (null, 'Cursor',            'greenhouse', 'cursor',            true),
  (null, 'Runway',            'greenhouse', 'runwayml',          true),
  (null, 'ElevenLabs',        'ashby',      'elevenlabs',        true),
  (null, 'LangChain',         'greenhouse', 'langchain',         true)
on conflict do nothing;
```

Verify slugs are current before ship — companies rename boards. `curl https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` returns 404 for stale.

- [ ] **Step 2:** Note: `scan_history` already created in Phase 0.4 migration 002. No change needed there. Add retention helper later (B4 decision).

- [ ] **Step 3:** Commit migration.

---

## Task 2.5 — `/api/scan` route (2 hr)

**Files:**
- Create: `src/app/api/scan/route.ts`

- [ ] **Step 1:**

```typescript
// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { fetchPortalJobs } from '@/lib/careerops/scanAtsApi'

const Body = z.object({ portalId: z.string().uuid().optional() })

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'bad body' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const portalQuery = supabase.from('portals').select('*').eq('enabled', true)
  const { data: portals } = parsed.data.portalId
    ? await portalQuery.eq('id', parsed.data.portalId)
    : await portalQuery.or(`user_id.eq.${user.id},user_id.is.null`)

  if (!portals?.length) return NextResponse.json({ scanned: 0, new: 0, errors: [] })

  // Sequential — be polite to the APIs
  const errors: string[] = []
  let totalNew = 0
  for (const p of portals) {
    try {
      const jobs = await fetchPortalJobs({ portal: p.portal_type, slug: p.slug, company: p.company_name })
      for (const job of jobs) {
        // Dedup: URL-exact + (company, title)
        const { data: existing } = await supabase
          .from('scan_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('url', job.url)
          .maybeSingle()
        if (existing) continue

        await supabase.from('scan_history').insert({
          user_id: user.id, url: job.url, portal: job.portal, title: job.title, company: job.company, status: 'new',
        })
        await supabase.from('jobs').insert({
          user_id: user.id, url: job.url, title: job.title, company: job.company, location: job.location, source: job.portal,
        })
        totalNew += 1
      }
      // polite stagger
      await new Promise(r => setTimeout(r, 300))
    } catch (e) {
      errors.push(`${p.company_name}: ${(e as Error).message}`)
    }
  }

  return NextResponse.json({ scanned: portals.length, new: totalNew, errors })
}
```

- [ ] **Step 2:** Manual smoke with curl + auth cookie. Ensure dedup works on repeat.

- [ ] **Step 3:** Commit.

---

## Task 2.6 — `livenessDriver.ts` — Playwright probe (2 hr)

**Files:**
- Create: `src/lib/careerops/livenessDriver.ts`
- Create: `src/lib/careerops/urlGuard.ts`

- [ ] **Step 1:** URL guard (per security plan S8.1).

```typescript
// src/lib/careerops/urlGuard.ts
import { lookup } from 'node:dns/promises'

const BLOCKED_CIDR_PATTERNS = [
  /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./,
  /^169\.254\./,            // link-local (AWS IMDS)
  /^0\./,
  /^::1$/, /^fc/i, /^fe80:/i,
]

export async function assertScanAllowed(rawUrl: string): Promise<void> {
  const u = new URL(rawUrl)
  if (u.protocol !== 'https:') throw new Error('liveness: https only')
  if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) throw new Error('liveness: IP literal blocked')
  const { address } = await lookup(u.hostname)
  if (BLOCKED_CIDR_PATTERNS.some(r => r.test(address))) {
    throw new Error(`liveness: resolved to internal ${address}`)
  }
}
```

- [ ] **Step 2:** Liveness driver.

```typescript
// src/lib/careerops/livenessDriver.ts
import { withBrowser } from './browserDriver'
import { classifyLiveness, type LivenessResult } from './livenessClassifier'
import { assertScanAllowed } from './urlGuard'

export async function probeLiveness(url: string): Promise<LivenessResult> {
  await assertScanAllowed(url)
  return withBrowser(async page => {
    let httpStatus = 0
    let finalUrl = url
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 })
      httpStatus = resp?.status() ?? 0
      finalUrl = page.url()
    } catch {
      return classifyLiveness({ httpStatus: 0, finalUrl: url, bodyText: '', hasApplyControl: false })
    }
    // Cloudflare 403 → uncertain, not expired
    if (httpStatus === 403) {
      return { status: 'uncertain', reason: 'cloudflare / 403 — cannot verify' }
    }
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 50_000) ?? '')
    const hasApplyControl = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button, input'))
      return els.some(el => /apply/i.test(el.textContent ?? '') || /apply/i.test((el as HTMLInputElement).value ?? ''))
    })
    return classifyLiveness({ httpStatus, finalUrl, bodyText, hasApplyControl })
  }, { timeoutMs: 20_000 })
}
```

- [ ] **Step 3:** Skip unit test (integration-only; mocking Playwright `page` is brittle). Cover via E2E in staging.

- [ ] **Step 4:** Commit.

---

## Task 2.7 — `/api/liveness` route + QStash signature verification (1.5 hr)

**Files:**
- Create: `src/app/api/liveness/route.ts`
- Install: `@upstash/qstash`

- [ ] **Step 1:** Install.

```bash
npm install @upstash/qstash
```

- [ ] **Step 2:** Route.

```typescript
// src/app/api/liveness/route.ts
export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { z } from 'zod'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { probeLiveness } from '@/lib/careerops/livenessDriver'

const Body = z.object({ jobId: z.string().uuid(), userId: z.string().uuid() })

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
})

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('upstash-signature') ?? ''
  const valid = await receiver.verify({ signature, body: raw }).catch(() => false)
  if (!valid) return NextResponse.json({ error: 'bad sig' }, { status: 401 })

  const parsed = Body.safeParse(JSON.parse(raw))
  if (!parsed.success) return NextResponse.json({ error: 'bad body' }, { status: 400 })

  // Service-role client (QStash = no user session)
  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: job } = await admin.from('jobs').select('id, url, user_id').eq('id', parsed.data.jobId).single()
  if (!job || job.user_id !== parsed.data.userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const result = await probeLiveness(job.url)

  await admin.from('jobs')
    .update({ liveness_status: result.status, liveness_checked_at: new Date().toISOString() })
    .eq('id', job.id)

  return NextResponse.json({ jobId: job.id, ...result })
}
```

- [ ] **Step 3:** Commit.

---

## Task 2.8 — Schema: liveness columns on `jobs` (15 min)

**Files:**
- Create: `supabase/migrations/004_liveness_columns.sql`

- [ ] **Step 1:**

```sql
alter table public.jobs
  add column if not exists liveness_status text check (liveness_status in ('active','expired','uncertain')),
  add column if not exists liveness_checked_at timestamptz;

create index if not exists jobs_liveness_idx on public.jobs(user_id, liveness_status, liveness_checked_at);
```

Commit.

---

## Task 2.9 — Vercel Cron: nightly scan (45 min)

**Files:**
- Modify: `vercel.json` (create if missing)
- Create: `src/app/api/cron/scan/route.ts`

- [ ] **Step 1:** `vercel.json`.

```json
{
  "crons": [
    { "path": "/api/cron/scan",     "schedule": "0 2 * * *" },
    { "path": "/api/cron/liveness", "schedule": "0 * * * *" }
  ],
  "functions": {
    "src/app/api/scan/route.ts":          { "memory": 1024, "maxDuration": 300 },
    "src/app/api/liveness/route.ts":      { "memory": 3008, "maxDuration": 60  },
    "src/app/api/health/browser/route.ts":{ "memory": 3008, "maxDuration": 60  },
    "src/app/api/cron/liveness/route.ts": { "memory": 1024, "maxDuration": 300 },
    "src/app/api/cron/scan/route.ts":     { "memory": 1024, "maxDuration": 300 }
  }
}
```

- [ ] **Step 2:** Cron endpoint.

```typescript
// src/app/api/cron/scan/route.ts
export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: users } = await admin.from('portals').select('user_id').not('user_id', 'is', null).eq('enabled', true)
  const uniq = [...new Set((users ?? []).map(u => u.user_id as string))]

  // Fire-and-forget to /api/scan per user, 2s stagger
  let triggered = 0
  for (const uid of uniq) {
    // Note: real impl uses service-role to impersonate user OR POST with signed internal header
    // Skeleton below — adapt to your auth model
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-user-id': uid, 'x-internal-secret': process.env.CRON_SECRET! },
      body: JSON.stringify({}),
    }).catch(() => {})
    triggered += 1
    await new Promise(r => setTimeout(r, 2000))
  }
  return NextResponse.json({ users: uniq.length, triggered })
}
```

⚠ **Design note:** `/api/scan` currently uses user session auth. Cron will need an internal-auth bypass. Defer the full wiring to Task 2.10 review; for MVP, skip cron trigger and let users hit /api/scan manually from UI.

---

## Task 2.10 — Vercel Cron: hourly liveness fan-out via QStash (1 hr)

**Files:**
- Create: `src/app/api/cron/liveness/route.ts`

- [ ] **Step 1:**

```typescript
// src/app/api/cron/liveness/route.ts
export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { Client as QStash } from '@upstash/qstash'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const qstash = new QStash({ token: process.env.QSTASH_TOKEN! })

  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: jobs } = await admin
    .from('jobs')
    .select('id, user_id, url, liveness_checked_at')
    .or(`liveness_checked_at.is.null,liveness_checked_at.lt.${cutoff}`)
    .neq('liveness_status', 'expired')
    .limit(500)

  for (const j of jobs ?? []) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/liveness`,
      body: { jobId: j.id, userId: j.user_id },
      retries: 2,
      delay: 0,
    })
  }

  return NextResponse.json({ enqueued: (jobs ?? []).length })
}
```

- [ ] **Step 2:** Commit.

---

## Task 2.11 — Full test + build verification (30 min)

- [ ] `npm run test:run` → all existing + new tests pass
- [ ] `npm run build` → type check clean, no Turbopack errors (proves `serverExternalPackages` works)
- [ ] Smoke `/api/scan` against one seeded portal locally
- [ ] Smoke `/api/health/browser` on Vercel preview → confirms memory config
- [ ] Manually enqueue one QStash message to `/api/liveness` from curl for E2E
- [ ] Final commit + push branch + open PR against `main`

---

## Self-Review Gate (End of Phase 2)

Before merging:

- [ ] `/api/health/browser` returns `{ok: true}` on Vercel (proves memory + chromium)
- [ ] Scan a seeded portal end-to-end, confirm rows land in `scan_history` + `jobs`
- [ ] Rescan same portal immediately → zero new rows (dedup works)
- [ ] Liveness check a known-expired job URL → returns `expired` with reason
- [ ] Liveness check a known-live job URL → returns `active`
- [ ] Liveness check `http://169.254.169.254/latest/meta-data/` → throws SSRF guard error
- [ ] Cron auth: call `/api/cron/scan` without `CRON_SECRET` → 401
- [ ] QStash: call `/api/liveness` without signature → 401

If any fail, do not proceed to Phase 3.

---

## Decision Log (Phase 2)

| Decision | Rationale | Date |
|---|---|---|
| Vercel Lambda memory 3008MB on Playwright routes | `@sparticuz/chromium` 147 needs ≥1769MB; default 1024MB fails | 2026-04-25 |
| `serverExternalPackages` includes `playwright-core` + `@sparticuz/chromium` | Turbopack fails on chromium's conditional `aws-sdk` require | 2026-04-25 |
| Workday deferred to Phase 3 | No scan.mjs impl; session cookie + CAPTCHA risk too high for MVP | 2026-04-25 |
| BambooHR + Teamtailor deferred | Response shape inconsistent; niche | 2026-04-25 |
| Upstash QStash over Inngest for Phase 2 | ~$72/mo vs $720/mo at 240k/day scale; at-least-once is enough | 2026-04-25 |
| Vercel Cron for nightly scan trigger | Free on Pro tier; low volume | 2026-04-25 |
| 20 seeded default portals shipped in migration | UI for portals CRUD deferred to Phase 3; users need discovery on day 1 | 2026-04-25 |
| Sequential Playwright per Lambda | Project rule + Lambda memory amplifies on parallel contexts | 2026-04-25 |
| Cloudflare 403 maps to `uncertain` not `expired` | Avoid false positives when datacenter IPs get rate-limited | 2026-04-25 |

---

## Reference Links

- Parent plan: `docs/superpowers/plans/2026-04-24-careerops-integration.md`
- Security plan (SSRF): `docs/superpowers/plans/2026-04-24-security-plan.md` § S8
- SEO plan (JobPosting): `docs/superpowers/plans/2026-04-24-seo-plan.md` § SEO-5.3
- career-ops source: `/Users/animeshbasak/Desktop/ai-lab/projects/career-ops/scan.mjs`, `liveness-core.mjs`
- Sparticuz chromium: https://github.com/Sparticuz/chromium
- Upstash QStash: https://upstash.com/docs/qstash
- Vercel cron: https://vercel.com/docs/cron-jobs

---

## Rough Effort Total

| Task | Effort |
|---|---|
| 2.1 serverExternalPackages + browser health | 30 min |
| 2.2 browserDriver | 30 min |
| 2.3 scanAtsApi (TDD) | 2 h |
| 2.4 portals migration + seed | 1 h |
| 2.5 /api/scan | 2 h |
| 2.6 livenessDriver + urlGuard | 2 h |
| 2.7 /api/liveness + QStash | 1.5 h |
| 2.8 jobs liveness columns | 15 min |
| 2.9 cron scan | 45 min |
| 2.10 cron liveness fan-out | 1 h |
| 2.11 verify + PR | 30 min |
| **Total** | **~12 h** over 2-3 sessions |

Plus: ~2h unblocking B1-B5 (Vercel memory config, QStash provisioning, portals list verification).
