# Career-Ops Feature Port Plan

**Date:** 2026-05-01 · **Branch:** `personal-fit-reranker-and-hn-enhance`
**Source:** career-ops upstream (19 commits ahead at time of pull)
**Strategy:** standalone-library-first (matches Phase 0 reranker pattern); wire-ins as follow-up commits

## Three features, ranked by ROI

| # | Feature | Source commit | Effort | Status this session |
|---|---|---|---|---|
| 1 | Writing-Style Calibration (anti-AI-detection) | `9ae201d` | L (~1.5d) | Schema + extractor scaffold only; UI + wire-in deferred |
| 2 | Role-fuzzy match: stopwords + overlap ratio | `7821113` | S (~3h) | **Full ship** as standalone util |
| 3 | Liveness regex patterns (closed-banner detect) | `7f8217e` | S (~2h) | **Full ship** as standalone util + migration |

## Realistic single-session ship

**This session:** Features 2 + 3 land complete (utility + tests + migration). Feature 1 deferred — schema migration `006_writing_style.sql` may land next session; UI + cover-letter wiring is its own focused PR.

## Sequencing notes

- F2 and F3 both eventually modify `src/lib/filters/jobFilters.ts` — landing as standalone utilities first (no jobFilters changes) avoids the merge dance.
- Migration numbers reserved: F1 = `006_writing_style.sql`, F3 = `007_jobs_liveness.sql`.
- All three features will be flag-gated when wired in: `WRITING_STYLE_ENABLED`, `JOB_DEDUP_FUZZY`, `JOB_LIVENESS_FILTER`.

## Feature 2 — Role-fuzzy match utility

**Goal:** Drop-in replacement for naive role-overlap dedup that filters seniority/work-mode/city stopwords and enforces a Jaccard-style ratio (≥ 0.6 on smaller side) on top of the overlap count (≥ 2).

**Files (this session):**
- `src/lib/dedup/roleStopwords.ts` — ROLE_STOPWORDS Set ported from `merge-tracker.mjs:76-95`, extended with Indian cities (Noida, Gurgaon, Gurugram, Kolkata)
- `src/lib/dedup/roleSimilarity.ts` — `roleTokens(s)` and `roleFuzzyMatch(a, b)` ported from `merge-tracker.mjs:97-121`
- `tests/lib/dedup/roleSimilarity.test.ts` — 8+ tests

**Length-3 token allowlist:** keep `ai`, `ml`, `qa`, `ux`, `ux/ui` past the `length > 3` filter so we don't drop AI/ML role differentiators.

**Edge cases handled:**
- All-stopword titles ("Senior Engineer Bangalore" both sides) → empty token list → no match
- Allowlist preserves "AI Engineer" vs "Backend Engineer" as distinct
- Company normalization mismatch ("Acme, Inc." vs "Acme Inc") via `normalizeCompany` strip

**Wire-in (deferred to follow-up commit):**
- `src/lib/dedup.ts` will gain a `canonicalTitle` param computed from `roleTokens(...).sort().join('-')`, gated behind `JOB_DEDUP_FUZZY=1`
- `src/lib/filters/jobFilters.ts` `deduplicateJobs` switches to the fuzzy matcher under the same flag

**Rollback:** flag-gated; old hash format coexists in DB.

## Feature 3 — Liveness checker utility + migration

**Goal:** Detect expired job postings via regex patterns on the page HTML; add `liveness` column to `jobs` table; expose `checkLiveness(html, url)` for future scraper integration.

**Files (this session):**
- `src/lib/scrapers/liveness.ts` — `checkLiveness(html, url): {status, signals}` ported from `liveness-core.mjs:1-40`. Patterns: `HARD_EXPIRED_PATTERNS` (incl. the 3 new "Applications have closed" variants from commit `7f8217e`), `LISTING_PAGE_PATTERNS`, `EXPIRED_URL_PATTERNS`, `MIN_CONTENT_CHARS`
- `supabase/migrations/007_jobs_liveness.sql` — additive: `liveness` text column with check constraint (`'live'|'expired'|'unknown'`), `liveness_checked_at timestamptz`, index on `(user_id, liveness)`
- `tests/lib/scrapers/liveness.test.ts` — 8+ tests covering each pattern + boundary cases

**Edge cases handled:**
- Apply button + closed banner both present → HARD_EXPIRED wins (career-ops convention)
- HTML below `MIN_CONTENT_CHARS` (300) → marked `unknown`, not `expired`
- "we closed our seed round" inside JD body → does NOT trip (regex anchors specific phrasing)

**Wire-in (deferred to follow-up commit):**
- `src/lib/scrapers/enrichJobDetails.ts` calls `checkLiveness` on fetched HTML; attaches `liveness` field
- `src/lib/filters/jobFilters.ts` `filterLiveJobs` drops `liveness === 'expired'` rows
- `/api/jobs` listing API filters by `liveness IN ('live', 'unknown')`

**Rollback:** flag-gated (`JOB_LIVENESS_FILTER`); migration is purely additive (drop columns to roll back).

## Feature 1 — Writing-Style Calibration (NEXT SESSION)

**Goal:** Anti-AI-detection voice mimicry — scan user's writing samples → extract abstract style descriptors → cache → condition cover-letter prompt on them.

**Out of scope this session.** Lift the architect's full breakdown when picking it up:

| Sub-step | Files | Effort |
|---|---|---|
| A1: schema + types + extractor | migration 006 + `src/lib/writingStyle/extractStyle.ts` + types + tests | 4h |
| A2: API routes + RLS | 3 routes under `/api/writing-style/*` | 2h |
| A3: cover-letter wiring | modify `taskRunner.ts` + `cover-letter/route.ts` + integration test | 2h |
| (deferred) UI | `/profile/writing-style` page | follow-up |

**Privacy non-negotiables:**
- No verbatim sample text persisted in the descriptors
- PII (name/email/phone) stripped before LLM extraction
- 50 KB per sample, 20 samples per user max
- LLM extraction failure does NOT clobber existing profile

## Cross-feature concerns

- **Feature flags everywhere.** No feature defaults on in production until 24–48h staging soak.
- **Migration order:** ship F3's `007_jobs_liveness.sql` THIS session; F1's `006_writing_style.sql` next session. Migration numbers are reserved and consistent.
- **Test infrastructure:** `vitest` is installed but no `npm test` script; runs via `npx vitest run`. Worth adding `"test": "vitest run"` to package.json scripts as a small QoL fix in a separate commit.

## Rollback plan (consolidated)

| Feature | Code | Schema |
|---|---|---|
| F1 (next session) | `WRITING_STYLE_ENABLED=0` | `drop table writing_samples; alter table resume_profiles drop column writing_style, drop column writing_style_calibrated_at` |
| F2 | `JOB_DEDUP_FUZZY=0` | n/a in this commit |
| F3 | `JOB_LIVENESS_FILTER=0` | `alter table jobs drop column liveness, drop column liveness_checked_at` |

All migrations are purely additive; rollback = drop columns. No data loss.
