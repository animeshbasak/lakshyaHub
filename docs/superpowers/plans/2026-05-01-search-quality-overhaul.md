# Search Quality Overhaul — 6-Phase Plan

**Date:** 2026-05-01 · **Branch off:** `main` · **Owner:** lakshya-hub · **Primary user:** the maintainer (job-hunting Lead Frontend at Airtel)

> This plan is dual-purpose: (a) generic improvements that help any user of lakshya, (b) immediate operator-targeted improvements for the maintainer's active job change. Phase 0 (operator targeting) is unique to this product context and ships first.

## Operator persona (drives priority)

- Role today: Lead Frontend Engineer @ Airtel (~7 yrs, React/TypeScript)
- Target: Lead/Staff/Principal at a product company "better than Airtel" — FAANG-tier, well-funded startups, strong product cos
- Location: Remote (global or India) OR Noida/Delhi/NCR hybrid
- Disqualifiers: IT services (TCS/Infosys/Wipro/Cognizant/Accenture/etc.), sub-Airtel comp, generic Indian board spam

## Phase 0 — Operator-targeted ranking (THIS SESSION, ships first)

**Goal:** Add a deterministic, no-LLM personal-fit reranker that runs over every scraped job and applies the operator's persona signals BEFORE the LLM A-G grader. Cuts feed noise by ~50% on day one.

**Architecture:**
- `src/lib/jobsearch/personalFit.ts` — pure function `scorePersonalFit(job, config) → {total, reasons, disqualified}`
- `src/lib/jobsearch/personalFitConfig.ts` — checked-in default config (operator-tunable)
- Hook into `src/actions/scrapeJobs.ts` between scrape and DB insert; jobs with `disqualified=true` are filtered out (no DB write); the score becomes a feature into `fit_score` ordering.

**Signals (configurable):**
- Title boost: `Lead/Staff/Principal/Senior/Sr.` → +20
- Stack boost: `react/typescript/next.js/frontend` matches in title or JD → +15 (≥2 hits) / +5 (1 hit)
- Location: `remote` → +25; `noida/delhi/gurgaon/NCR/india` → +15; mismatch → −15
- Brand tier: preferred (Stripe/Anthropic/Linear/Vercel/Figma/etc.) → +30; disqualified (TCS/Infosys/etc.) → hard fail
- Comp floor: `LPA` regex match against `salary_range` + JD; <floor → −20; ≥1.5×floor → +15

**Test plan:**
- 9 happy/disqualifier/penalty cases for `scorePersonalFit`
- 4 false-positive guards for the substring matcher (Atcs / Honeycomb / LinkedIn / EY-alone)
- 6 comp-floor cases (LPA low/meets/high/multi-mention/45L-shorthand/volume-no-trip)
- 4 USD comp-floor cases for US preset
- 1 score-cap test
- 3 edge cases (missing fields, WFH detection, "work from home")
- 4 `applyPersonalFit` filter behavior tests (incl. empty-array)
- 5 regional-preset structure tests
- 6 `resolveConfigForUser` cases (null / explicit / IN / US / EU / inference)
- 1 `mergeConfig` undefined-vs-zero distinction

**Effort:** S (~1h, no DB, no API)
**Phase gate:** All 43 tests pass + manual smoke on a real scrape returns visibly cleaner top-10

---

## Phase 1 — Hybrid retrieval (BM25 + pgvector) + cross-encoder rerank

**Goal:** Replace URL-dedup-then-fit-score ordering with hybrid (BM25 + dense pgvector) → RRF top-50 → cross-encoder rerank top-10. The 5-D grade becomes the *explanation* layer; rerank is the *ordering* layer.

**Architecture:**
- `src/lib/search/embed.ts` → `embedJD(text)` via `gemini-embedding-001` (3072-dim Matryoshka, truncated to 768)
- New columns on `jobs`: `embedding vector(768)`, `fts tsvector` (generated from title+company+description)
- HNSW index for cosine search; GIN index for FTS
- Postgres RPC `search_jobs_hybrid(q, q_embedding, k)` returns RRF-fused top-50
- `src/lib/search/rerank.ts` runs `bge-reranker-v2-m3` via `@xenova/transformers` ONNX (CPU, free); fallback to Voyage `rerank-2.5` paid

**Migration:** `006_hybrid_search.sql` — additive columns, indexes, RPC. Down-migration drops indexes + columns.

**Test plan:** golden 30-query corpus in `tests/fixtures/golden_queries.json`; assert nDCG@10 ≥ baseline + 15%; rate-limit handling (Gemini 100 RPM free tier); empty embedding fallback to BM25.

**Effort:** L (~1 week)
**Phase gate:** P95 latency ≤ 1.2s on 1k jobs; nDCG@10 +15%; zero regressions in 188 existing tests.

---

## Phase 2 — Semantic deduplication (key + MinHash + cosine)

**Goal:** Collapse near-duplicate JDs (same job on LinkedIn + Naukri + company site = 1 card with "also posted on" sub-list).

**Two-tier dedup:**
1. Surface tier: MinHash-LSH on word-5-shingles via `minhash` npm (MIT, duhaime). Jaccard ≥ 0.7 → likely dupe.
2. Semantic tier (depends on Phase 1 embeddings): cosine ≥ 0.93 → dupe. Empirical cutoff for `gemini-embedding-001` per MTEB STS-B.

**Canonical key:** `${normCompany(company)}|${normTitle(title)}|${locationBucket(location)}`

**Migration:** `007_semantic_dedup.sql` — adds `canonical_key`, `minhash_sig bytea`, `dup_of uuid`, `dup_count int`. Backfill script in `scripts/backfill-semantic-dedup.ts`.

**Test plan:** 200-pair Jaccard ground-truth fixture; 60-known-dup corpus with recall ≥ 0.85, precision ≥ 0.95; backfill clears 10k rows in <60s.

**Effort:** M (~2 days)
**Phase gate:** above + `unique(user_id, dedup_hash)` constraint preserved end-to-end.

---

## Phase 3 — Coverage expansion (HN enhancement + Wellfound + YC WaaS)

**Goal:** Promote existing HN adapter from "best-effort first-line parse" to first-class with structured location/remote/salary extraction. Add Wellfound + YC Work-at-a-Startup as new high-quality sources for senior + remote roles.

**Architecture:**
- `src/lib/jobsearch/adapters/hn/parse.ts` — testable in isolation: `extractCompany`, `extractLocation`, `extractRemoteFlag`, `extractStackTags`, `extractSalary`, `extractEmail`
- `src/lib/jobsearch/adapters/wellfound.ts` — Wellfound (formerly AngelList) public job listings
- `src/lib/jobsearch/adapters/yc-waas.ts` — YC Work-at-a-Startup feed
- Cache HN thread IDs (in-memory Map, 6h TTL)

**Edge cases:** non-pipe-delimited HN comments (parseConfidence: low), deleted/dead, multi-job comments, replies-as-jobs, email-only contacts, multilingual.

**Test plan:** 25 fixture HN comments covering pipe / freeform / Spanish / HTML-entities / no-company; msw-mocked Algolia responses; confidence-flag propagation.

**Effort:** M (~2 days)
**Phase gate:** ≥80% of HN comments extract non-empty company; ≥60% extract location; HN contributes ≥15% of top-50 results for senior+remote queries.

---

## Phase 4 — Browser extension (deferred to separate repo)

**Goal:** Chrome MV3 extension that detects Workday/Greenhouse/Lever/iCIMS/Ashby application forms, autofills from the user's Lakshya profile, and injects "Add to Lakshya" buttons on LinkedIn/Indeed cards.

**Out of scope of this repo.** Tracked at `github.com/animeshbasak/lakshya-extension`. Lakshya-hub side ships only:
- `extension_tokens` table + `008_extension_handshake.sql`
- `POST /api/extension/handshake` returning short-lived JWT scoped `read:profile`

**Effort:** L (1-2 weeks, separate repo)

---

## Phase 5 — Personalized contextual bandit reranker

**Goal:** Per-user re-ranking on top of Phase 1 cross-encoder using LinUCB on impression / click / save / dismiss / time-on-card.

**Architecture:**
- `src/lib/search/bandit/linucb.ts` (~150 LoC, no deps)
- Event capture in `JobCard.tsx` → `POST /api/bandit/event`
- State: `user_bandit_state(user_id, A_inv, b)` + `bandit_events(user_id, job_id, event, context, ts)`
- Reranker multiplier on top of Phase 1 score

**Test plan:** synthetic 5-arm bandit cumulative regret bound; RLS enforcement; cold-start; feature-vector NaN drop.

**Effort:** L (~1 week)
**Phase gate:** A/B vs Phase-1-only on internal cohort shows ≥8% lift in save-rate or click-rate at p<0.1.

---

## Phase 6 — Ghost-job hardening + freshness webhooks

**Goal:** Tighten the existing 7-point ghost-job filter with pay-transparency-law signals (CA/CO/WA/NY/HI/MD/IL + Ontario Jan 2026); replace polling with Greenhouse/Lever webhooks for sub-hour freshness.

**Migration:** `010_ghost_freshness.sql` — adds `ghost_score_v2 smallint`, `source_metadata jsonb`, `freshness_score real`. Indexes for ordering by freshness desc.

**API:** `POST /api/webhooks/greenhouse`, `/api/webhooks/lever` — HMAC-verified.

**Test plan:** 12 cases per state law; signed-payload accept / unsigned reject; webhook replay idempotency; clock skew tolerance.

**Effort:** M (~3 days)

---

## Sequencing & cross-cutting

**Dependency DAG:** P0 (this session) | P1 → P2 → P5 / P6 | P3 independent | P4 independent

**Recommended order:** **P0 → P3 (HN+Wellfound+YC) → P2 (key+MinHash, no cosine) → P1 (hybrid+rerank) → P6 → P5**.

**Migration order:** schema first, code second; HNSW index build is async (won't block); every column additive with default.

**Rollback:** every phase guarded by `LAKSHYA_*` env flag; flipping off restores previous code path within seconds. Global kill: `LAKSHYA_SEARCH_QUALITY_OVERHAUL=0`.

**Cost monitoring:** Gemini embedding token counter aggregated daily into `llm_costs(date, provider, op, tokens, usd)`; alert at $5/day default.

**Telemetry:** Sentry transactions tagged `op: search.hybrid|search.rerank|search.dedup`; new `search_metrics` table for request latency / candidate count / cost.

---

## Phase 0 implementation checklist (THIS SESSION — execution order)

1. **Branch:** `personal-fit-reranker-and-hn-enhance` off `main` (done)
2. Implement `src/lib/jobsearch/personalFit.ts` (operator-targeted reranker)
3. Implement `src/lib/jobsearch/personalFitConfig.ts` (operator-tunable config)
4. Tests: `tests/lib/jobsearch/personalFit.test.ts` (8 unit + 3 integration)
5. Run `npm run test` — confirm 188 prior + 11 new pass
6. Hook into `src/actions/scrapeJobs.ts` — gated by `LAKSHYA_PERSONAL_FIT=true`
7. Manual smoke on a real scrape session
8. Commit `feat(rank): personal-fit reranker — operator-targeted signals`
9. Push branch + open draft PR (NOT merging to main without explicit go-ahead)

## Phase 3 (HN enhancement) — ship if time permits this session

10. Refactor `src/lib/jobsearch/adapters/hn-algolia.ts` parsers into `hn/parse.ts`
11. Add `extractRemoteFlag`, `extractStackTags`, `extractSalary`, `extractEmail`
12. Tests: `tests/lib/jobsearch/adapters/hn/parse.test.ts` with 15+ fixtures
13. Wire enhanced parser back into `hn-algolia.ts`
14. Commit `feat(hn): structured parser for remote / location / stack / salary`

## Phase 2 (semantic dedup) — defer if time runs short
15-22. (See Phase 2 section above)
