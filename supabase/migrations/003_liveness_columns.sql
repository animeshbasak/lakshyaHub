-- supabase/migrations/003_liveness_columns.sql
-- Phase 2: add liveness tracking columns to jobs table.
-- Unlocks /api/liveness and hourly QStash sweep.

alter table public.jobs
  add column if not exists liveness_status text check (liveness_status in ('active','expired','uncertain')),
  add column if not exists liveness_checked_at timestamptz;

create index if not exists jobs_liveness_idx
  on public.jobs(user_id, liveness_status, liveness_checked_at);
