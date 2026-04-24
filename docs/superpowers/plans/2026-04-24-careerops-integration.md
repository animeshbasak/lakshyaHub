# Lakshya × career-ops Integration — Master Plan

> **Brand:** Product name is **Lakshya** (Sanskrit/Hindi: *target, aim*). Tagline: *Aim before you apply.* The repo folder remains `lakshya-hub/` (filesystem path) — brand-level references in all user-facing surfaces use "Lakshya" only.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild **Lakshya** as a multi-tenant SaaS web UI over career-ops's proven job-search methodology (740+ real evaluations, 100+ tailored CVs, landed Head of Applied AI role), replacing the current app's inferior custom scoring/scraping with career-ops's battle-tested prompts and algorithms.

**Architecture:** Next.js 16 App Router + Supabase (Postgres + Auth + RLS) + Claude/Gemini via `src/lib/ai/router.ts`. Career-ops prompts (`modes/*.md`) become versioned system prompts in `src/prompts/system/`. Career-ops Node scripts (`scan.mjs`, `liveness-core.mjs`, `followup-cadence.mjs`) ported to TypeScript libraries. Playwright via `@sparticuz/chromium` on Vercel (abstracted behind `BrowserDriver` for future Fly.io swap).

**Tech Stack:** Next.js 16.2, React 19, TypeScript 5, Supabase, `@anthropic-ai/sdk`, `@google/generative-ai` (fallback), Vitest (new), Playwright `@sparticuz/chromium` (new), Stripe (deferred to billing phase), Inngest (deferred).

**Attribution:** Built on career-ops methodology by santifer (MIT). Must credit in footer, README, about page. Reach out for partnership.

---

## Strategic Context (Why We're Doing This)

career-ops is proven. Lakshya (as it currently exists) is not. Every feature built from scratch (5D scoring, 554-line ATS engine, Apify scrapers) is weaker than career-ops's equivalent. This plan sheds dead weight and replaces it with career-ops's proven system.

**Non-negotiables (from career-ops DNA):**
1. Quality filter: score < 4.0/5 → warn against applying
2. Never auto-submit applications (human-in-the-loop)
3. User layer / system layer separation — user's CV + evals never touched by app updates
4. Playwright for liveness (WebSearch lies)
5. Prompt changes go through golden-eval regression test
6. MIT attribution to santifer everywhere

**Monetization:** Free (3 evals/mo) → Pro $19/mo (50 evals) → Hunter $49/mo (200 evals) → BYOK $9/mo (unlimited with own API key). Unit economics: A-G eval ≈ $0.12 cost → 50%+ margin on Pro.

---

## Scope of THIS Plan

This plan covers **Phase 0 (Cleanup) + Phase 1 (Core Eval Loop) — executable tonight and through Week 1**. Phases 2-6 are documented in the Roadmap Appendix as reference, not actionable tasks. They get their own plan docs when we reach them.

**Tonight's realistic scope:** Phase 0 fully + Phase 1 Tasks 1-3.

---

## File Structure (What Gets Created / Modified)

### New files
```
src/prompts/
  system/                      ← 17 career-ops modes (copied Phase 0)
    _shared.md                 ← base rubric, scoring rules
    oferta.md                  ← 7-block A-G evaluator
    ofertas.md                 ← compare multiple offers
    deep.md                    ← company research
    pdf.md                     ← CV tailoring (HTML)
    latex.md                   ← CV generation (LaTeX)
    followup.md                ← cadence rules
    interview-prep.md
    patterns.md                ← rejection analytics
    contacto.md                ← LinkedIn outreach            [Phase 3.5]
    apply.md                   ← application form assistant   [Phase 4.5]
    training.md                ← course/cert evaluator        [Phase 6]
    project.md                 ← portfolio project evaluator  [Phase 6]
    scan.md
    pipeline.md
    tracker.md
    auto-pipeline.md
  user/
    _profile.template.md       ← copied per user on signup
src/lib/careerops/
  promptLoader.ts              ← composes system + user prompts + CV
  evaluator.ts                 ← A-G eval pipeline             [Phase 1]
  archetypes.ts                ← 6 archetype keyword patterns  [Phase 1]
  livenessClassifier.ts        ← port of liveness-core.mjs     [Phase 1]
  canonicalStates.ts           ← state enum + rank + aliases   [Phase 1]
  parseScoreSummary.ts         ← ---SCORE_SUMMARY--- parser    [Phase 1]
  scanAtsApi.ts                ← port of scan.mjs              [Phase 2]
  browserDriver.ts             ← Playwright abstraction        [Phase 2]
  legitimacyScorer.ts          ← weighted signal aggregation   [Phase 2]
  keywordInjector.ts           ← ethical CV reformulation      [Phase 3]
  unicodeNormalizer.ts         ← ATS-safe text cleanup         [Phase 3]
  latexCompiler.ts             ← LaTeX → PDF via Fly.io worker [Phase 3]
  outreach.ts                  ← contact finder + DM drafter   [Phase 3.5]
  cadence.ts                   ← follow-up scheduler           [Phase 4]
  tracker.ts                   ← merge + dedup                 [Phase 4]
  batchEvaluator.ts            ← parallel eval fan-out         [Phase 4]
  cvSyncCheck.ts               ← nightly integrity check       [Phase 4]
  applyAssist.ts               ← form-fill answer generator    [Phase 4.5]
  storyBank.ts                 ← STAR+R CRUD                   [Phase 5]
  patternsAnalytics.ts         ← archetype × outcome           [Phase 5]
  trainingEvaluator.ts         ← course/cert scorer            [Phase 6]
  projectEvaluator.ts          ← portfolio project scorer      [Phase 6]
src/app/api/
  ai/
    evaluate/route.ts          ← replaces jd-match-5d           [Phase 1]
    outreach/route.ts                                           [Phase 3.5]
    apply-assist/route.ts                                       [Phase 4.5]
    interview-prep/route.ts                                     [Phase 5]
    evaluate-training/route.ts                                  [Phase 6]
    evaluate-project/route.ts                                   [Phase 6]
  scan/route.ts                                                 [Phase 2]
  liveness/route.ts                                             [Phase 2]
  cv/generate/route.ts                                          [Phase 3]
  batch/route.ts                                                [Phase 4]
supabase/migrations/
  002_careerops_schema.sql     ← evaluations, scan_history, followups, story_bank
tests/
  lib/careerops/
    archetypes.test.ts
    livenessClassifier.test.ts
    canonicalStates.test.ts
    promptLoader.test.ts
    parseScoreSummary.test.ts
vitest.config.ts               ← new
```

### Deleted files (Phase 0 cleanup)
```
src/lib/atsEngine.ts           ← 554 lines, replaced by ethical keyword injection
src/app/api/ai/jd-match-5d/    ← replaced by /api/ai/evaluate (A-G)
src/app/api/ai/jd-match/       ← same, old
src/lib/scrapers/apify-*.ts    ← Apify stays as fallback only (will move, not delete)
```

### Modified files
```
package.json                   ← add vitest, @sparticuz/chromium, playwright-core, @google/generative-ai
src/lib/ai/router.ts           ← extend with evaluate-offer, deep-research tasks
.env.example                   ← new vars: GEMINI_API_KEY, CAREEROPS_PROMPT_VERSION
```

---

## Environment Setup (Do First — 15 min)

- [ ] **Step 1: Get Gemini API key (FREE)**

Visit https://aistudio.google.com/apikey → create key → copy.

- [ ] **Step 2: Add to `.env.local`**

```bash
GEMINI_API_KEY=your_key_here
CAREEROPS_PROMPT_VERSION=1.0.0
```

- [ ] **Step 3: Verify existing env vars present**

```bash
cd /Users/animeshbasak/Desktop/ai-lab/projects/lakshya-hub
grep -E 'ANTHROPIC_API_KEY|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE' .env.local
```

Expected: all three lines present. If missing, add from Supabase dashboard + existing Anthropic key.

- [ ] **Step 4: Verify career-ops accessible**

```bash
ls /Users/animeshbasak/Desktop/ai-lab/projects/career-ops/modes/*.md | head -5
```

Expected: 5+ `.md` files listed. If missing, clone from https://github.com/santifer/career-ops.

---

## Phase 0 — Cleanup (2 hours)

Delete the broken before building. Reduces surface area.

### Task 0.1: Install Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest + deps**

```bash
cd /Users/animeshbasak/Desktop/ai-lab/projects/lakshya-hub
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom happy-dom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create `tests/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add test scripts to `package.json`**

Edit the `scripts` block:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 5: Smoke test vitest**

Create `tests/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm run test:run`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/smoke.test.ts
git commit -m "chore: add vitest test framework"
```

---

### Task 0.2: Install career-ops runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Gemini SDK + Chromium + Playwright core**

```bash
npm install @google/generative-ai playwright-core @sparticuz/chromium zod js-yaml
npm install -D @types/js-yaml
```

- [ ] **Step 2: Verify install**

```bash
node -e "console.log(require('@google/generative-ai').GoogleGenerativeAI.name)"
```

Expected: `GoogleGenerativeAI`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add career-ops runtime deps (gemini, playwright, zod, js-yaml)"
```

---

### Task 0.3: Delete atsEngine.ts + related routes

**Files:**
- Delete: `src/lib/atsEngine.ts`
- Delete: `src/app/api/ai/jd-match-5d/` (entire dir)
- Delete: `src/app/api/ai/jd-match/` (entire dir)

- [ ] **Step 1: Find all usages of atsEngine**

```bash
cd /Users/animeshbasak/Desktop/ai-lab/projects/lakshya-hub
grep -rn "atsEngine\|from '@/lib/atsEngine'\|from './atsEngine'" src/ --include='*.ts' --include='*.tsx'
```

List every file that imports it. These need to be updated.

- [ ] **Step 2: Comment out imports + callers temporarily**

For each file found, comment the import and the call site with `// TODO(careerops): replaced by A-G evaluator`. Build must still pass.

- [ ] **Step 3: Delete the file and routes**

```bash
rm src/lib/atsEngine.ts
rm -rf src/app/api/ai/jd-match-5d
rm -rf src/app/api/ai/jd-match
```

- [ ] **Step 4: Verify build still compiles**

```bash
npm run build
```

Expected: success (may have warnings about unused vars in commented-out code — fine for now).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove atsEngine and jd-match routes (replaced by A-G evaluator)"
```

---

### Task 0.4: Supabase schema migration for career-ops

**Files:**
- Create: `supabase/migrations/002_careerops_schema.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/002_careerops_schema.sql

-- Evaluations (A-G reports, per-user per-job)
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  jd_url text,
  jd_text text,
  company text,
  role text,
  archetype text,
  score numeric(2,1),
  legitimacy_tier text check (legitimacy_tier in ('high', 'caution', 'suspicious')),
  blocks_json jsonb not null default '{}',
  report_md text,
  prompt_version text not null default '1.0.0',
  llm_provider text not null default 'claude',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists evaluations_user_id_idx on public.evaluations(user_id);
create index if not exists evaluations_score_idx on public.evaluations(score desc);

alter table public.evaluations enable row level security;

create policy "users read own evaluations" on public.evaluations
  for select using (auth.uid() = user_id);

create policy "users insert own evaluations" on public.evaluations
  for insert with check (auth.uid() = user_id);

create policy "users update own evaluations" on public.evaluations
  for update using (auth.uid() = user_id);

create policy "users delete own evaluations" on public.evaluations
  for delete using (auth.uid() = user_id);

-- Scan history (dedup ledger)
create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  first_seen timestamptz default now(),
  portal text,
  title text,
  company text,
  status text default 'new',
  unique(user_id, url)
);

create index if not exists scan_history_user_url_idx on public.scan_history(user_id, url);

alter table public.scan_history enable row level security;

create policy "users manage own scan history" on public.scan_history
  for all using (auth.uid() = user_id);

-- Follow-up cadence tracking
create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  sent_at timestamptz default now(),
  channel text check (channel in ('email', 'linkedin', 'phone', 'form')),
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists followups_user_app_idx on public.followups(user_id, application_id);

alter table public.followups enable row level security;

create policy "users manage own followups" on public.followups
  for all using (auth.uid() = user_id);

-- Story bank (STAR+R interview stories)
create table if not exists public.story_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  situation text,
  task text,
  action text,
  result text,
  reflection text,
  tags text[] default '{}',
  archetype text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists story_bank_user_idx on public.story_bank(user_id);

alter table public.story_bank enable row level security;

create policy "users manage own stories" on public.story_bank
  for all using (auth.uid() = user_id);

-- Add columns to existing applications for cadence tracking
alter table public.applications
  add column if not exists follow_up_due date,
  add column if not exists follow_up_count int not null default 0,
  add column if not exists cadence_flag text check (cadence_flag in ('ok', 'urgent', 'overdue', 'cold'));
```

- [ ] **Step 2: Apply migration locally**

```bash
cd /Users/animeshbasak/Desktop/ai-lab/projects/lakshya-hub
npx supabase migration up --local
# OR if using hosted: npx supabase db push
```

Expected: "Applied migration 002_careerops_schema.sql"

- [ ] **Step 3: Verify tables exist**

```bash
npx supabase db lint
psql $DATABASE_URL -c "\dt public.*" | grep -E 'evaluations|scan_history|followups|story_bank'
```

Expected: all 4 tables listed.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_careerops_schema.sql
git commit -m "feat(db): add career-ops schema (evaluations, scan_history, followups, story_bank)"
```

---

### Task 0.5: Copy ALL career-ops prompts into src/prompts/

Copy every mode now — even ones used in later phases — so future phases have assets ready. Prompts are small markdown files, no cost to copy early.

**Files:**
- Create: `src/prompts/system/_shared.md`
- Create: `src/prompts/system/oferta.md` — offer evaluation (A-G)
- Create: `src/prompts/system/ofertas.md` — compare multiple offers
- Create: `src/prompts/system/deep.md` — company research
- Create: `src/prompts/system/pdf.md` — CV (HTML/PDF) tailoring
- Create: `src/prompts/system/latex.md` — CV (LaTeX) generation
- Create: `src/prompts/system/followup.md` — cadence rules
- Create: `src/prompts/system/interview-prep.md`
- Create: `src/prompts/system/patterns.md` — rejection analytics
- Create: `src/prompts/system/contacto.md` — LinkedIn/recruiter outreach
- Create: `src/prompts/system/apply.md` — application form assistant
- Create: `src/prompts/system/training.md` — course/cert evaluator
- Create: `src/prompts/system/project.md` — portfolio project evaluator
- Create: `src/prompts/system/scan.md` — portal scanner instructions
- Create: `src/prompts/system/pipeline.md` — URL inbox processor
- Create: `src/prompts/system/tracker.md` — tracker operations
- Create: `src/prompts/system/auto-pipeline.md` — single-URL full flow
- Create: `src/prompts/user/_profile.template.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p src/prompts/system src/prompts/user
```

- [ ] **Step 2: Copy all 17 system prompts from career-ops**

```bash
CAREEROPS=/Users/animeshbasak/Desktop/ai-lab/projects/career-ops/modes
for f in _shared oferta ofertas deep pdf latex followup interview-prep \
         patterns contacto apply training project scan pipeline tracker \
         auto-pipeline; do
  cp "$CAREEROPS/$f.md" "src/prompts/system/$f.md"
done
cp "$CAREEROPS/_profile.template.md" src/prompts/user/_profile.template.md
```

- [ ] **Step 3: Verify files copied with content**

```bash
ls src/prompts/system/*.md | wc -l     # expect 17
wc -l src/prompts/system/*.md src/prompts/user/*.md
```

Expected: 17 files in `system/`, each 30+ lines.

- [ ] **Step 4: Add attribution header to `_shared.md`**

Prepend this to `src/prompts/system/_shared.md`:
```markdown
<!--
Source: career-ops by santifer (https://github.com/santifer/career-ops)
License: MIT
Version: 1.0.0 (copied 2026-04-24)
Modifications: Lakshya-Hub integration — single-user file refs replaced with multi-tenant DB refs at prompt compose time.
-->

```

- [ ] **Step 5: Commit**

```bash
git add src/prompts/
git commit -m "feat(prompts): import career-ops system prompts (credit: santifer MIT)"
```

---

## Phase 1 — Core Eval Loop (Week 1)

Goal: user pastes a job URL → gets same-quality A-G evaluation as career-ops CLI.

### Task 1.1: Canonical States module

**Files:**
- Create: `src/lib/careerops/canonicalStates.ts`
- Test: `tests/lib/careerops/canonicalStates.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/careerops/canonicalStates.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { normalizeStatus, CANONICAL_STATES, statusRank, STATUS_ALIASES } from '@/lib/careerops/canonicalStates'

describe('canonicalStates', () => {
  it('exports 8 canonical states', () => {
    expect(CANONICAL_STATES).toEqual([
      'Evaluated', 'Applied', 'Responded', 'Interview',
      'Offer', 'Rejected', 'Discarded', 'SKIP',
    ])
  })

  it('normalizes Spanish aliases to English', () => {
    expect(normalizeStatus('Aplicado')).toBe('Applied')
    expect(normalizeStatus('Rechazado')).toBe('Rejected')
    expect(normalizeStatus('Evaluada')).toBe('Evaluated')
  })

  it('is case-insensitive and trims', () => {
    expect(normalizeStatus('  applied  ')).toBe('Applied')
    expect(normalizeStatus('INTERVIEW')).toBe('Interview')
  })

  it('returns SKIP for unknown statuses', () => {
    expect(normalizeStatus('garbage')).toBe('SKIP')
  })

  it('ranks higher states above lower ones', () => {
    expect(statusRank('Offer')).toBeGreaterThan(statusRank('Applied'))
    expect(statusRank('Interview')).toBeGreaterThan(statusRank('Evaluated'))
    expect(statusRank('Rejected')).toBeLessThan(statusRank('Offer'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/careerops/canonicalStates.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/careerops/canonicalStates.ts`**

```typescript
export const CANONICAL_STATES = [
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
] as const

export type CanonicalState = typeof CANONICAL_STATES[number]

export const STATUS_ALIASES: Record<string, CanonicalState> = {
  // Spanish
  'evaluada': 'Evaluated',
  'evaluado': 'Evaluated',
  'aplicado': 'Applied',
  'aplicada': 'Applied',
  'respondido': 'Responded',
  'respondida': 'Responded',
  'entrevista': 'Interview',
  'oferta': 'Offer',
  'rechazado': 'Rejected',
  'rechazada': 'Rejected',
  'descartado': 'Discarded',
  'descartada': 'Discarded',
  // English
  'evaluated': 'Evaluated',
  'applied': 'Applied',
  'responded': 'Responded',
  'interview': 'Interview',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'discarded': 'Discarded',
  'skip': 'SKIP',
}

const RANK: Record<CanonicalState, number> = {
  SKIP: 0,
  Evaluated: 1,
  Discarded: 1,
  Applied: 2,
  Responded: 3,
  Interview: 4,
  Rejected: 5,
  Offer: 6,
}

export function normalizeStatus(raw: string | null | undefined): CanonicalState {
  if (!raw) return 'SKIP'
  const key = raw.trim().toLowerCase()
  return STATUS_ALIASES[key] ?? 'SKIP'
}

export function statusRank(state: CanonicalState): number {
  return RANK[state]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/careerops/canonicalStates.test.ts
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/careerops/canonicalStates.ts tests/lib/careerops/canonicalStates.test.ts
git commit -m "feat(careerops): add canonical state machine (8 states, alias normalization)"
```

---

### Task 1.2: Archetype Detector

**Files:**
- Create: `src/lib/careerops/archetypes.ts`
- Test: `tests/lib/careerops/archetypes.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/careerops/archetypes.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { detectArchetype, ARCHETYPES, archetypeKeywords } from '@/lib/careerops/archetypes'

describe('archetypes', () => {
  it('exports 6 archetypes', () => {
    expect(ARCHETYPES).toEqual([
      'ai-platform',
      'agentic',
      'ai-pm',
      'solutions-architect',
      'forward-deployed',
      'transformation',
    ])
  })

  it('detects ai-platform from LLMOps keywords', () => {
    const jd = 'Building LLM observability and evals infrastructure. Monitor reliability of RAG pipelines.'
    expect(detectArchetype(jd)).toBe('ai-platform')
  })

  it('detects agentic from agent/HITL keywords', () => {
    const jd = 'Design multi-agent orchestration workflows with human-in-the-loop.'
    expect(detectArchetype(jd)).toBe('agentic')
  })

  it('detects ai-pm from PRD/roadmap keywords', () => {
    const jd = 'Product Manager owning roadmap, PRDs, and stakeholder discovery for our AI platform.'
    expect(detectArchetype(jd)).toBe('ai-pm')
  })

  it('detects solutions-architect from enterprise/integration keywords', () => {
    const jd = 'Solutions Architect designing enterprise architecture and systems integration.'
    expect(detectArchetype(jd)).toBe('solutions-architect')
  })

  it('detects forward-deployed from client-facing/prototype keywords', () => {
    const jd = 'Forward Deployed Engineer: client-facing, fast prototype delivery in the field.'
    expect(detectArchetype(jd)).toBe('forward-deployed')
  })

  it('detects transformation from change-management keywords', () => {
    const jd = 'Drive AI transformation, change management, enablement, and adoption across the enterprise.'
    expect(detectArchetype(jd)).toBe('transformation')
  })

  it('returns null when no archetype matches', () => {
    expect(detectArchetype('We sell mattresses online.')).toBeNull()
  })

  it('returns keyword list per archetype', () => {
    expect(archetypeKeywords('agentic')).toContain('agent')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/careerops/archetypes.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/careerops/archetypes.ts`**

```typescript
export const ARCHETYPES = [
  'ai-platform',
  'agentic',
  'ai-pm',
  'solutions-architect',
  'forward-deployed',
  'transformation',
] as const

export type Archetype = typeof ARCHETYPES[number]

const KEYWORDS: Record<Archetype, readonly string[]> = {
  'ai-platform':          ['observability', 'evals', 'llmops', 'pipelines', 'monitoring', 'reliability', 'rag'],
  'agentic':              ['agent', 'multi-agent', 'hitl', 'human-in-the-loop', 'orchestration', 'workflow'],
  'ai-pm':                ['prd', 'roadmap', 'discovery', 'stakeholder', 'product manager'],
  'solutions-architect':  ['architecture', 'enterprise', 'integration', 'solutions architect', 'systems'],
  'forward-deployed':     ['client-facing', 'forward deployed', 'prototype', 'fast delivery', 'field'],
  'transformation':       ['change management', 'adoption', 'enablement', 'transformation'],
}

export function archetypeKeywords(a: Archetype): readonly string[] {
  return KEYWORDS[a]
}

export function detectArchetype(jdText: string): Archetype | null {
  const lower = jdText.toLowerCase()
  let best: { archetype: Archetype; hits: number } | null = null

  for (const archetype of ARCHETYPES) {
    const hits = KEYWORDS[archetype].filter(kw => lower.includes(kw)).length
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { archetype, hits }
    }
  }

  return best?.archetype ?? null
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/careerops/archetypes.test.ts
```

Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/careerops/archetypes.ts tests/lib/careerops/archetypes.test.ts
git commit -m "feat(careerops): add archetype detector (6 patterns from career-ops modes)"
```

---

### Task 1.3: Liveness Classifier (pure function, no Playwright)

**Files:**
- Create: `src/lib/careerops/livenessClassifier.ts`
- Test: `tests/lib/careerops/livenessClassifier.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/careerops/livenessClassifier.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { classifyLiveness, type LivenessInput } from '@/lib/careerops/livenessClassifier'

const base: LivenessInput = {
  httpStatus: 200,
  finalUrl: 'https://example.com/jobs/123',
  bodyText: 'Senior AI Engineer. Requirements: 5 years experience. Apply now.',
  hasApplyControl: true,
}

describe('classifyLiveness', () => {
  it('returns active when apply control present and content sufficient', () => {
    expect(classifyLiveness(base).status).toBe('active')
  })

  it('returns expired on HTTP 404', () => {
    expect(classifyLiveness({ ...base, httpStatus: 404 }).status).toBe('expired')
  })

  it('returns expired on HTTP 410', () => {
    expect(classifyLiveness({ ...base, httpStatus: 410 }).status).toBe('expired')
  })

  it('returns expired on hard-expired English pattern', () => {
    const input = { ...base, bodyText: 'This position has been filled. No longer accepting applications.' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on German "bereits besetzt" pattern', () => {
    const input = { ...base, bodyText: 'Diese Position ist bereits besetzt.' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on French "expirée" pattern', () => {
    const input = { ...base, bodyText: "Cette offre d'emploi est expirée." }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on listing page redirect', () => {
    const input = { ...base, bodyText: '42 jobs found. Filter by location.', hasApplyControl: false }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired on URL error param', () => {
    const input = { ...base, finalUrl: 'https://example.com/jobs?error=true' }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns expired when content under 300 chars', () => {
    const input = { ...base, bodyText: 'Short nav. Footer.', hasApplyControl: false }
    expect(classifyLiveness(input).status).toBe('expired')
  })

  it('returns uncertain when content present but no apply control', () => {
    const input = {
      ...base,
      bodyText: 'Senior AI Engineer role description with enough content. '.repeat(20),
      hasApplyControl: false,
    }
    expect(classifyLiveness(input).status).toBe('uncertain')
  })

  it('includes reason string', () => {
    const result = classifyLiveness({ ...base, httpStatus: 404 })
    expect(result.reason).toMatch(/http|404/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/careerops/livenessClassifier.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/careerops/livenessClassifier.ts`**

```typescript
export type LivenessStatus = 'active' | 'expired' | 'uncertain'

export interface LivenessInput {
  httpStatus: number
  finalUrl: string
  bodyText: string
  hasApplyControl: boolean
}

export interface LivenessResult {
  status: LivenessStatus
  reason: string
}

const HARD_EXPIRED_PATTERNS = [
  /job no longer available/i,
  /position (has been|is) filled/i,
  /no longer (accepting|open|available)/i,
  /job expired/i,
  /application closed/i,
  /bereits besetzt/i,           // German
  /nicht mehr verf[uü]gbar/i,   // German
  /offre.*expir[ée]e?/i,        // French
  /poste.*pourvu/i,              // French
  /募集は終了/,                   // Japanese
]

const LISTING_REDIRECT_PATTERNS = [
  /\d+ jobs? found/i,
  /search results loaded/i,
  /filter by (location|role|level)/i,
]

const MIN_CONTENT_CHARS = 300

export function classifyLiveness(input: LivenessInput): LivenessResult {
  const { httpStatus, finalUrl, bodyText, hasApplyControl } = input

  if (httpStatus === 404 || httpStatus === 410) {
    return { status: 'expired', reason: `http ${httpStatus}` }
  }

  if (/[?&]error=true/i.test(finalUrl)) {
    return { status: 'expired', reason: 'url error param' }
  }

  for (const pattern of HARD_EXPIRED_PATTERNS) {
    if (pattern.test(bodyText)) {
      return { status: 'expired', reason: `hard pattern: ${pattern.source}` }
    }
  }

  for (const pattern of LISTING_REDIRECT_PATTERNS) {
    if (pattern.test(bodyText)) {
      return { status: 'expired', reason: 'redirected to listing page' }
    }
  }

  if (bodyText.length < MIN_CONTENT_CHARS) {
    return { status: 'expired', reason: `content under ${MIN_CONTENT_CHARS} chars` }
  }

  if (hasApplyControl) {
    return { status: 'active', reason: 'apply control visible' }
  }

  return { status: 'uncertain', reason: 'content present, no apply control detected' }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/careerops/livenessClassifier.test.ts
```

Expected: 11 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/careerops/livenessClassifier.ts tests/lib/careerops/livenessClassifier.test.ts
git commit -m "feat(careerops): add liveness classifier (pure fn, ported from liveness-core.mjs)"
```

---

### Task 1.4: Prompt Loader

**Files:**
- Create: `src/lib/careerops/promptLoader.ts`
- Test: `tests/lib/careerops/promptLoader.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/careerops/promptLoader.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { composePrompt, type PromptContext } from '@/lib/careerops/promptLoader'

const ctx: PromptContext = {
  mode: 'oferta',
  userProfile: '## My Profile\nSenior AI Engineer targeting platform roles.',
  cvMarkdown: '## Experience\n- Built X\n- Shipped Y',
  jdText: 'Senior AI Engineer role at Acme. Requirements: 5y exp.',
}

describe('promptLoader.composePrompt', () => {
  it('includes system _shared content', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toMatch(/SYSTEM CONTEXT/i)
  })

  it('includes mode-specific content (oferta)', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toMatch(/EVALUATION MODE|oferta/i)
  })

  it('embeds the user CV', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('Built X')
  })

  it('embeds the user profile', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('targeting platform roles')
  })

  it('embeds the JD as user input section', async () => {
    const prompt = await composePrompt(ctx)
    expect(prompt).toContain('Acme')
  })

  it('throws on unknown mode', async () => {
    await expect(composePrompt({ ...ctx, mode: 'nonexistent' as any })).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/careerops/promptLoader.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/careerops/promptLoader.ts`**

```typescript
import fs from 'node:fs/promises'
import path from 'node:path'

export type PromptMode =
  | 'oferta'
  | 'ofertas'
  | 'deep'
  | 'pdf'
  | 'latex'
  | 'followup'
  | 'interview-prep'
  | 'patterns'
  | 'contacto'
  | 'apply'
  | 'training'
  | 'project'
  | 'scan'
  | 'pipeline'
  | 'tracker'
  | 'auto-pipeline'

export interface PromptContext {
  mode: PromptMode
  userProfile: string
  cvMarkdown: string
  jdText?: string
}

const PROMPTS_DIR = path.join(process.cwd(), 'src', 'prompts')

const SECTION = (title: string, body: string) => `
═══════════════════════════════════════════════════════
${title}
═══════════════════════════════════════════════════════
${body.trim()}
`

async function readSystemPrompt(mode: PromptMode): Promise<string> {
  const file = path.join(PROMPTS_DIR, 'system', `${mode}.md`)
  try {
    return await fs.readFile(file, 'utf8')
  } catch {
    throw new Error(`Prompt mode not found: ${mode} (expected at ${file})`)
  }
}

async function readShared(): Promise<string> {
  return fs.readFile(path.join(PROMPTS_DIR, 'system', '_shared.md'), 'utf8')
}

export async function composePrompt(ctx: PromptContext): Promise<string> {
  const [shared, modePrompt] = await Promise.all([
    readShared(),
    readSystemPrompt(ctx.mode),
  ])

  const sections: string[] = [
    SECTION('SYSTEM CONTEXT (_shared.md)', shared),
    SECTION(`EVALUATION MODE (${ctx.mode}.md)`, modePrompt),
    SECTION('USER PROFILE', ctx.userProfile),
    SECTION('CANDIDATE CV', ctx.cvMarkdown),
  ]

  if (ctx.jdText) {
    sections.push(SECTION('JOB DESCRIPTION TO EVALUATE', ctx.jdText))
  }

  sections.push(SECTION(
    'OPERATING RULES',
    `1. Generate all blocks A-G in full
2. End output with machine-parseable summary:

---SCORE_SUMMARY---
COMPANY: <name>
ROLE: <title>
SCORE: <X.X/5>
ARCHETYPE: <detected>
LEGITIMACY: <high|caution|suspicious>
---END_SUMMARY---`
  ))

  return sections.join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/careerops/promptLoader.test.ts
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/careerops/promptLoader.ts tests/lib/careerops/promptLoader.test.ts
git commit -m "feat(careerops): add prompt loader (composes shared + mode + user CV + JD)"
```

---

### Task 1.5: Score Summary Parser

**Files:**
- Create: `src/lib/careerops/parseScoreSummary.ts`
- Test: `tests/lib/careerops/parseScoreSummary.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/careerops/parseScoreSummary.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseScoreSummary } from '@/lib/careerops/parseScoreSummary'

describe('parseScoreSummary', () => {
  it('extracts summary block from full A-G output', () => {
    const output = `
Block A: ...
Block G: Legitimacy...

---SCORE_SUMMARY---
COMPANY: Anthropic
ROLE: Senior AI Engineer
SCORE: 4.5/5
ARCHETYPE: ai-platform
LEGITIMACY: high
---END_SUMMARY---
`
    const result = parseScoreSummary(output)
    expect(result).toEqual({
      company: 'Anthropic',
      role: 'Senior AI Engineer',
      score: 4.5,
      archetype: 'ai-platform',
      legitimacy: 'high',
    })
  })

  it('returns null when no summary present', () => {
    expect(parseScoreSummary('no summary here')).toBeNull()
  })

  it('handles extra whitespace', () => {
    const output = `---SCORE_SUMMARY---
COMPANY:   Acme Inc
ROLE:  Engineer
SCORE: 3.0/5
ARCHETYPE: agentic
LEGITIMACY: caution
---END_SUMMARY---`
    expect(parseScoreSummary(output)?.company).toBe('Acme Inc')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/careerops/parseScoreSummary.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/careerops/parseScoreSummary.ts`**

```typescript
export interface ScoreSummary {
  company: string
  role: string
  score: number
  archetype: string
  legitimacy: 'high' | 'caution' | 'suspicious'
}

const BLOCK_RE = /---SCORE_SUMMARY---([\s\S]*?)---END_SUMMARY---/
const FIELD_RE = (key: string) => new RegExp(`${key}:\\s*(.+)`, 'i')

export function parseScoreSummary(text: string): ScoreSummary | null {
  const match = text.match(BLOCK_RE)
  if (!match) return null

  const body = match[1]
  const read = (k: string) => body.match(FIELD_RE(k))?.[1]?.trim()

  const company = read('COMPANY')
  const role = read('ROLE')
  const scoreStr = read('SCORE')
  const archetype = read('ARCHETYPE')
  const legitimacy = read('LEGITIMACY')?.toLowerCase()

  if (!company || !role || !scoreStr || !archetype || !legitimacy) return null

  const score = parseFloat(scoreStr.replace(/\/5$/, ''))
  if (Number.isNaN(score)) return null

  if (legitimacy !== 'high' && legitimacy !== 'caution' && legitimacy !== 'suspicious') {
    return null
  }

  return { company, role, score, archetype, legitimacy }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/careerops/parseScoreSummary.test.ts
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/careerops/parseScoreSummary.ts tests/lib/careerops/parseScoreSummary.test.ts
git commit -m "feat(careerops): add score summary parser"
```

---

### Task 1.6: Evaluate API Route (the core feature)

**Files:**
- Create: `src/app/api/ai/evaluate/route.ts`
- Test: `tests/app/api/evaluate.test.ts`

- [ ] **Step 1: Write failing route test (integration-style)**

Create `tests/app/api/evaluate.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

// This test verifies the route wiring with a mocked LLM.
// Full E2E happens via the /app/evaluate UI.
describe('POST /api/ai/evaluate (contract)', () => {
  it('accepts { jdText, cvMarkdown, userProfile } and returns { report, summary }', async () => {
    const mockLLM = vi.fn().mockResolvedValue(`
Block A-G content...

---SCORE_SUMMARY---
COMPANY: Acme
ROLE: AI Engineer
SCORE: 4.2/5
ARCHETYPE: ai-platform
LEGITIMACY: high
---END_SUMMARY---
`)

    // Import after mock setup
    const { runEvaluation } = await import('@/lib/careerops/evaluator')

    const result = await runEvaluation(
      {
        jdText: 'Senior AI Engineer at Acme...',
        cvMarkdown: '## Experience\nBuilt LLM platforms',
        userProfile: 'Target: platform roles',
      },
      { llm: mockLLM }
    )

    expect(result.summary?.score).toBe(4.2)
    expect(result.summary?.company).toBe('Acme')
    expect(result.summary?.archetype).toBe('ai-platform')
    expect(result.report).toContain('---SCORE_SUMMARY---')
    expect(mockLLM).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/app/api/evaluate.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/careerops/evaluator.ts`**

```typescript
import { composePrompt } from './promptLoader'
import { parseScoreSummary, type ScoreSummary } from './parseScoreSummary'

export interface EvaluationInput {
  jdText: string
  cvMarkdown: string
  userProfile: string
}

export interface EvaluationResult {
  report: string
  summary: ScoreSummary | null
  promptVersion: string
}

export type LLMFn = (systemPrompt: string, userPrompt: string) => Promise<string>

export async function runEvaluation(
  input: EvaluationInput,
  opts: { llm: LLMFn; promptVersion?: string }
): Promise<EvaluationResult> {
  const systemPrompt = await composePrompt({
    mode: 'oferta',
    userProfile: input.userProfile,
    cvMarkdown: input.cvMarkdown,
  })

  const userPrompt = `JOB DESCRIPTION TO EVALUATE:\n\n${input.jdText}`

  const report = await opts.llm(systemPrompt, userPrompt)
  const summary = parseScoreSummary(report)

  return {
    report,
    summary,
    promptVersion: opts.promptVersion ?? process.env.CAREEROPS_PROMPT_VERSION ?? '1.0.0',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/app/api/evaluate.test.ts
```

Expected: 1 passed.

- [ ] **Step 5: Implement the actual Next.js route `src/app/api/ai/evaluate/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { runEvaluation, type LLMFn } from '@/lib/careerops/evaluator'

const BodySchema = z.object({
  jdText: z.string().min(50),
  jdUrl: z.string().url().optional(),
  cvId: z.string().uuid().optional(),
  provider: z.enum(['claude', 'gemini']).default('claude'),
})

const claudeLLM: LLMFn = async (system, user) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = resp.content[0]
  return block.type === 'text' ? block.text : ''
}

const geminiLLM: LLMFn = async (system, user) => {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: system,
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  })
  const resp = await model.generateContent(user)
  return resp.response.text()
}

export async function POST(req: Request) {
  const body = BodySchema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Load CV
  const cvQuery = body.data.cvId
    ? supabase.from('cv_documents').select('markdown').eq('id', body.data.cvId).single()
    : supabase.from('cv_documents').select('markdown').eq('user_id', user.id).eq('is_active', true).single()
  const { data: cv } = await cvQuery
  if (!cv?.markdown) return NextResponse.json({ error: 'no active CV' }, { status: 400 })

  // Load profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('narrative')
    .eq('user_id', user.id)
    .single()

  const result = await runEvaluation(
    {
      jdText: body.data.jdText,
      cvMarkdown: cv.markdown,
      userProfile: profile?.narrative ?? '',
    },
    { llm: body.data.provider === 'gemini' ? geminiLLM : claudeLLM }
  )

  // Persist
  const { data: saved, error } = await supabase.from('evaluations').insert({
    user_id: user.id,
    jd_url: body.data.jdUrl,
    jd_text: body.data.jdText,
    company: result.summary?.company,
    role: result.summary?.role,
    archetype: result.summary?.archetype,
    score: result.summary?.score,
    legitimacy_tier: result.summary?.legitimacy,
    report_md: result.report,
    blocks_json: { summary: result.summary },
    prompt_version: result.promptVersion,
    llm_provider: body.data.provider,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ evaluation: saved })
}
```

- [ ] **Step 6: Manual smoke test**

```bash
npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/ai/evaluate \
  -H 'Content-Type: application/json' \
  -H "Cookie: <your-supabase-auth-cookie>" \
  -d '{"jdText": "Senior AI Engineer role. Build LLM platforms. 5+ years experience. Apply at anthropic.com.", "provider": "gemini"}'
```

Expected: `{ evaluation: { id, score, ... } }` after ~5-10 seconds. If unauthorized, sign in first via UI.

- [ ] **Step 7: Commit**

```bash
git add src/lib/careerops/evaluator.ts src/app/api/ai/evaluate/route.ts tests/app/api/evaluate.test.ts
git commit -m "feat(api): add POST /api/ai/evaluate — A-G evaluation with Claude/Gemini"
```

---

## Self-Review Gate (End of Phase 1)

Before claiming Phase 1 complete:

- [ ] Run full test suite: `npm run test:run` → all pass
- [ ] Run build: `npm run build` → success
- [ ] Manually evaluate 5 real job URLs via `/api/ai/evaluate`
- [ ] Compare output quality vs running same JD through `career-ops` CLI (golden-eval check)
- [ ] If career-ops output is materially better, do NOT proceed to Phase 2. Diagnose prompt loader or CV composition issue first.

---

## Roadmap Appendix — Future Phases (NOT in this plan)

Each phase below gets its own `docs/superpowers/plans/YYYY-MM-DD-phase-N-*.md` when we reach it.

### Phase 2 — Job Discovery + Liveness (Week 2)
- Port `scan.mjs` → `src/lib/careerops/scanAtsApi.ts` (Greenhouse, Ashby, Lever, Workday, BambooHR, Teamtailor)
- Port Playwright wrapper → `src/lib/careerops/browserDriver.ts` (`@sparticuz/chromium` on Vercel, swappable to Fly.io via interface)
- `/api/scan` and `/api/liveness` routes
- Vercel cron: hourly liveness sweep on active jobs
- Apify as fallback only (keep `src/lib/scrapers/apify-*` as fallback lib, never primary)

### Phase 3 — CV Tailoring + PDF + LaTeX (Week 3)
- Ethical keyword injector (`src/lib/careerops/keywordInjector.ts`) — reformulate, never invent
- **HTML path**: React-PDF template port of `templates/cv-template.html` (Space Grotesk + DM Sans)
- **LaTeX path**: port `generate-latex.mjs` + `templates/cv-template.tex` → server-side `pdflatex` via Fly.io worker OR swap to Overleaf API. Needed for senior/academic/EU market (`\pdfgentounicode=1` mandatory for ATS).
- ATS unicode normalizer (em-dash, smart quotes, ZWSP, nbsp — port `generate-pdf.mjs:34-75`)
- `/api/cv/generate?jobId=X&format=html|latex` route
- Download button on each evaluation (dual format)

### Phase 3.5 — LinkedIn Outreach (`contacto.md`) — NEW

Why: A-G eval tells user "apply" but doesn't help them reach out. Without this, Lakshya ends at "here's your score" — users bounce to LinkedIn manually. Closes the loop.

- Port `modes/contacto.md` prompt → `/api/ai/outreach`
- Contact finder: WebSearch "site:linkedin.com/in [role] at [company]" → surface 3-5 likely recruiter/hiring-manager profiles
- DM draft generator: 3 variants (referral ask, cold intro, warm context) using user's CV highlights + company research
- UI: "Reach out" button on every `Evaluated` / `Applied` row in Kanban
- Optional Chrome extension to auto-populate LinkedIn DM field
- Never auto-sends — user reviews + copies/pastes

### Phase 4 — Tracker + Cadence + Batch + Billing (Week 4)
- Port `merge-tracker.mjs` + `dedup-tracker.mjs` → `src/lib/careerops/tracker.ts`
- Port `normalize-statuses.mjs` logic (already covered by Task 1.1 canonicalStates)
- Follow-up cadence Vercel cron (daily) — computes URGENT/OVERDUE/COLD per-user
- Kanban badges wired to cadence output
- **Batch / parallel evaluation** — port `batch/batch-prompt.md` logic. User pastes 10 URLs → Inngest fan-out → 10 parallel Claude calls → stream results. Throughput = stickiness for power users.
- **CV sync check** — port `cv-sync-check.mjs` as nightly user-scoped cron: warns if CV and profile drift apart, flags stale `article-digest`.
- Stripe checkout + webhook → `subscriptions` table (Free / Pro / Hunter / BYOK)
- Usage metering: increment `usage_events` per eval, enforce plan quota, soft-limit with upgrade prompt

### Phase 4.5 — Application Form Assistant (`apply.md`) — NEW

Why: users get an A-G eval + tailored CV but still manually fill 40-field Greenhouse forms. This is the highest-pain moment. Owning it = owning retention.

- Port `modes/apply.md` prompt → `/api/ai/apply-assist`
- Input: job URL + user's profile + current application form fields (scraped via Playwright or pasted by user via extension)
- Output: pre-filled answers for each form field tailored to JD, including "why this company?" "tell us about a time when..." long-form answers drawn from story bank
- UI: split-pane — form preview on left, AI answers on right, "copy" button per field
- **Never submits** — human reviews + clicks Apply themselves (career-ops ethical rule)
- Chrome extension (v2): injects answers directly into form fields on Greenhouse/Ashby/Workday

### Phase 5 — Interview Prep + Patterns (Week 5)
- Story bank CRUD UI (`src/app/(dashboard)/stories/`) — edit in place, tag by archetype, accumulate over evaluations
- Interview-prep generator (`/api/ai/interview-prep`) — Glassdoor/Blind/LeetCode WebSearch + question matcher against story bank
- Voice interview practice (v2) — OpenAI Realtime or ElevenLabs, user practices STAR+R out loud
- Pattern analytics dashboard (`/app/insights`) — archetype × outcome conversion, score threshold recommender. Unlocks at 10+ evals (retention hook)
- Negotiation scripts library (from `modes/_profile.template.md` negotiation section) — per-archetype templates

### Phase 6 — Course/Project Evaluators + Launch Polish (Week 6)

**Upskilling evaluators** (nice-to-have but cheap to add since prompts already exist):
- Port `modes/training.md` → `/api/ai/evaluate-training` — "should I take this course / cert?" scored vs user's target archetypes
- Port `modes/project.md` → `/api/ai/evaluate-project` — "will this portfolio project help me land role X?"
- UI: `/app/grow` page with both evaluators. Cross-sell from tracker ("your archetype conversion is low — here are 3 courses that'd lift you")

**Launch polish**:
- Landing page + docs (Nextra or simple MDX)
- Attribution audit — santifer credit on footer, about, README, LICENSE.md references career-ops MIT
- Mobile responsive audit
- Load test (k6) — 100 concurrent evals without p99 > 15s
- Empty states, loading skeletons, error boundaries
- **Launch**: ProductHunt + HN + career-ops Discord (pending santifer approval)

### Phase 7 (deferred) — Growth surface
- Chrome/Firefox extension (evaluate from LinkedIn/Indeed)
- Weekly digest email (Resend)
- Referral engine (month free per invite)
- Public share of A-G reports (viral loop)
- Multi-language modes (DE/FR/JA) — prompts exist in career-ops `modes/de/`, `modes/fr/`, `modes/ja/`
- B2B tier (career coach dashboard, university placement)

---

## Decision Log

| Decision | Rationale | Date |
|---|---|---|
| Option B (port prompts, keep Next.js) | Multi-user + monetize needs webapp, not single-user CLI | 2026-04-24 |
| `@sparticuz/chromium` on Vercel Pro | Fast ship, $20/mo. Migrate to Fly.io at >100 liveness/day | 2026-04-24 |
| Apify as fallback only | career-ops ATS API approach = free + reliable. Apify costs + flaky | 2026-04-24 |
| English-only v1 | Scope discipline. Add DE/FR/JA in v2 | 2026-04-24 |
| Public SaaS monetized | Free 3/mo → Pro $19 → Hunter $49 → BYOK $9 | 2026-04-24 |
| Vitest over Jest | Faster, Vite-native, better TS support | 2026-04-24 |
| Gemini for dev, Claude for prod | Gemini free tier = $0 dev cost. Claude = quality prod evals | 2026-04-24 |
| Rebrand lakshya-hub → **Lakshya** | Public launch, unique name. Folder path stays for git continuity | 2026-04-24 |
| Copy ALL 17 career-ops prompts in Phase 0 | Tiny markdown files, zero cost to copy early — future phases ready | 2026-04-24 |
| LaTeX CV path mandatory alongside HTML | Senior/academic/EU market expects LaTeX output, `\pdfgentounicode=1` for ATS | 2026-04-24 |
| Phase 3.5 LinkedIn outreach added | Without it, Lakshya ends at "here's your score" — users bounce to LinkedIn manually. Closes the loop. | 2026-04-24 |
| Phase 4.5 Apply-form assistant added | Form-filling is highest-pain moment. Owning it = owning retention. | 2026-04-24 |
| Phase 6 Training + Project evaluators | Cross-sell from tracker ("low conversion → these courses would help") | 2026-04-24 |
| Parallel batch evaluator in Phase 4 | Power-user throughput feature. Career-ops has `batch.md`; port via Inngest fan-out. | 2026-04-24 |
| CV sync check as nightly cron | Prevents "blank CV" bugs when user edits profile but not CV. Ported from `cv-sync-check.mjs`. | 2026-04-24 |

---

## Attribution (non-negotiable)

Every surface must credit career-ops:

- `README.md`: "Built on the career-ops methodology by [santifer](https://github.com/santifer/career-ops) (MIT)."
- App footer: "Powered by career-ops · santifer.io"
- About page: full story + link
- Prompt files: `<!-- Source: career-ops ... -->` header
- Public launch post: "We turned the career-ops CLI into a webapp, with permission/partnership from the creator."

Action item: **email santifer within 48 hours of starting**. Offer: revenue share, co-marketing, or equity. Worst case: MIT covers us, launch anyway with prominent credit.
