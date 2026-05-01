-- 007_jobs_liveness.sql
--
-- Adds liveness classification columns to the jobs table for the
-- (lite, HTTP-only) liveness checker ported from career-ops in commit 7f8217e.
--
-- Strategy: additive only. Existing rows default to 'unknown'. The
-- liveness checker writes results during scrape enrichment (wired up in a
-- follow-up commit gated behind JOB_LIVENESS_FILTER=1).
--
-- Rollback: alter table jobs drop column liveness, drop column liveness_checked_at;

alter table jobs
  add column if not exists liveness text
    check (liveness in ('live', 'expired', 'unknown')) default 'unknown',
  add column if not exists liveness_checked_at timestamptz;

-- Index supports filtering job feeds by liveness without scanning rows.
-- (user_id, liveness) composite mirrors the existing access pattern.
create index if not exists jobs_liveness_idx
  on jobs (user_id, liveness);

-- RLS: jobs already has user_id-scoped policy from migration 001 — no new
-- policy needed since these columns are part of the same row.

comment on column jobs.liveness is
  'Liveness classification: live | expired | unknown. Set by the lite checker (lib/scrapers/liveness.ts) during scrape enrichment.';
comment on column jobs.liveness_checked_at is
  'Timestamp of the most recent liveness check. NULL until first check.';
