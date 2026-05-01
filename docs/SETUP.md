# Lakshya — Setup

> The fastest path from `git clone` to a working `/evaluate` flow.
> Read this first if you're seeing schema errors, missing-key errors, or 503s.

---

## 1. Apply Supabase migrations (the most common blocker)

The repository ships 5 SQL migrations under `supabase/migrations/`. **None of them are auto-applied.** If you see errors like:

```
Could not find the table 'public.evaluations' in the schema cache
Could not find the column 'is_public' on 'evaluations'
column "follow_up_due" of relation "applications" does not exist
```

…it means one or more migrations are missing on your Supabase project.

### Option A — Supabase CLI (recommended, 30 seconds)

```bash
# One-time install:
brew install supabase/tap/supabase   # or `npm i -g supabase` for npm-only environments

# Link your project:
supabase link --project-ref <YOUR_PROJECT_REF>   # find it in the Supabase dashboard URL

# Push every pending migration:
supabase db push
```

`db push` is idempotent — it diff-applies. Re-running it on an already-migrated project is a no-op.

### Option B — Supabase SQL Editor (no CLI needed)

For each file in `supabase/migrations/` IN ORDER (numeric prefix is the order):

1. Open the SQL Editor in your Supabase project dashboard
2. Open one of:
   - `001_initial_schema.sql`         — base tables (resumes, jobs, applications, …)
   - `002_careerops_schema.sql`       — evaluations, scan_history, followups, story_bank
   - `003_liveness_columns.sql`       — adds liveness columns to jobs
   - `004_audit_events_rls_hardening.sql` — append-only audit log + RLS hardening
   - `005_eval_public_share.sql`      — adds is_public + anon_level + shared_at to evaluations
3. Copy the file contents, paste into the editor, click **Run**.
4. Repeat for every file.

Every migration uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS` guards, so re-running is safe.

### Verify

In the SQL editor, run:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'resumes', 'resume_profiles', 'jobs', 'applications',
    'evaluations', 'scan_history', 'followups', 'story_bank',
    'audit_events'
  )
order by tablename;
```

Every row should show `rowsecurity = true`. If a table is missing, the corresponding migration didn't apply — re-run it.

---

## 2. Set required environment keys

Copy `.env.example` to `.env.local`, then fill these. **You only need ONE of the AI provider keys for the eval flow to work** — fallback chain handles the rest:

```bash
# Auth + DB (always required)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# At least one of these (Groq is the recommended default — free, no card)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

Get keys:
- Groq:      https://console.groq.com/keys (no card needed)
- Gemini:    https://aistudio.google.com/apikey (no card)
- Anthropic: https://console.anthropic.com/settings/keys (paid)

After editing `.env.local`, restart the dev server: `npm run dev`.

---

## 3. Smoke-test the eval flow

```bash
# 1. Sign up at http://localhost:3000/login
# 2. Set up a resume profile at /profile (must have full_resume_text)
# 3. Go to /evaluate, paste a JD, click Run
# 4. You should land on /eval/<id> with a 7-block report.
```

If you hit:

- **`provider_unconfigured`**     → no API key for the provider you picked. Pick a different one or set the env var.
- **`all_providers_failed`**      → every provider you have keys for is rate-limited or down. Wait 60s + retry, or add another provider key for fallback.
- **`no active CV`**              → `resume_profiles.full_resume_text` is empty. Set up your profile at `/profile` first.
- **schema cache errors**         → migrations not applied. Go to step 1.

---

## 4. (Optional) Phase 2 — job scanning + liveness

The scanning infrastructure (Greenhouse, Ashby, Lever JSON API ports of the career-ops `scan.mjs`) is shipped as libraries in `src/lib/careerops/`:

- `scanAtsApi.ts` — pure HTTP fetchers (no Playwright, no scraping)
- `livenessClassifier.ts` + `livenessDriver.ts` — Playwright-driven liveness check
- `urlGuard.ts` — SSRF protection (RFC 1918, AWS IMDS, etc.)
- `browserDriver.ts` — `@sparticuz/chromium` wrapper

These are NOT wired to public routes yet. They're imported by future routes documented in `docs/superpowers/plans/2026-04-25-phase-2-scan-liveness.md`. To unblock that phase you need:

- `QSTASH_TOKEN` + `QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY`  (Upstash QStash — free tier 100/day)
- `CRON_SECRET` (random hex >= 32 chars: `openssl rand -hex 32`)
- A `portals` table seeded with company slugs (migration 006, not yet shipped)
- Vercel Lambda memory raised from 1024 MB to 3008 MB on `/api/liveness` and `/api/health/browser` routes (Chromium needs ≥1769 MB)

---

## 5. How career-ops finds jobs (the methodology Lakshya ports)

The original `career-ops` CLI (santifer, MIT) discovers jobs through three primary channels:

1. **Public ATS JSON APIs.** Greenhouse, Ashby, and Lever expose unauthenticated JSON endpoints listing every open posting on a company's board:
   - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs`
   - Ashby: `https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true`
   - Lever: `https://api.lever.co/v0/postings/{slug}`

   Lakshya's `scanAtsApi.ts` ports these directly. `~70%` of modern tech-company ATSes are covered by these three.

2. **Liveness verification (Playwright).** A scanned URL is no good if the job was filled yesterday. career-ops uses Playwright to fetch the page, classify the response (404, "Position has been filled," "Diese Position ist bereits besetzt," etc. across 5 languages), and bucket it as `active` / `expired` / `uncertain`. Lakshya's `livenessClassifier.ts` is a pure-fn port; `livenessDriver.ts` wraps Playwright + SSRF guards around it.

3. **Apify fallback for harder portals.** Workday, BambooHR, Teamtailor have private APIs and aggressive bot detection. career-ops + Lakshya defer to Apify actors as a paid fallback when the JSON-API path fails.

**Does Lakshya scan jobs today?** No — the routes (`/api/scan`, `/api/liveness`) are next on the roadmap. Until they ship, every JD evaluated through `/evaluate` is one you paste in manually. Phase 2 wires the automation.

Read the full Phase 2 design at `docs/superpowers/plans/2026-04-25-phase-2-scan-liveness.md`.

---

## 6. Known issues / common gotchas

- **Gemini 503 "high demand"** — known free-tier saturation during US peak hours. Lakshya's eval route auto-retries with 800ms / 1600ms backoff and falls through to Groq. Set `GROQ_API_KEY` to make the fallback fire silently.
- **`NEXT_PUBLIC_DEFAULT_CURRENCY=INR`** — set to test the Indian pricing variant locally without a Vercel geo header. Otherwise INR shows only when the request originates from India.
- **`HEALTH_SECRET`** — `/api/health/browser` is auth-gated to prevent unauthenticated DoS via Chromium spawn. Set a random hex string for local probes.
- **Pre-commit secret scan** — run `./scripts/install-secret-scan-hook.sh` once to install the Anthropic / OpenAI / Stripe / etc. pattern blocker on every commit.

---

## 7. Pointer to architecture docs

- Master plan: `docs/superpowers/plans/2026-04-24-careerops-integration.md`
- Security plan: `docs/superpowers/plans/2026-04-24-security-plan.md` (S0 threat model committed; S2 is dashboard config)
- SEO plan: `docs/superpowers/plans/2026-04-24-seo-plan.md`
- UI evolution: `docs/superpowers/plans/2026-04-25-ui-evolution.md`
- Phase 2 routes: `docs/superpowers/plans/2026-04-25-phase-2-scan-liveness.md`
- Status dashboard: `docs/PROJECT-STATUS.md` (live priority roster + review findings)
