-- LAKSHYA — combined migrations 002-005 (auto-generated 2026-04-25).
-- Paste this entire file into Supabase SQL editor and click Run.
-- Idempotent: safe to re-run.


-- ════════════════════════════════════════════════════════════
-- 002_careerops_schema.sql
-- ════════════════════════════════════════════════════════════
-- supabase/migrations/002_careerops_schema.sql
-- career-ops integration schema (Phase 0 of careerops integration plan)
-- Adds: evaluations, scan_history, followups, story_bank + cadence cols on applications

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

-- ════════════════════════════════════════════════════════════
-- 003_liveness_columns.sql
-- ════════════════════════════════════════════════════════════
-- supabase/migrations/003_liveness_columns.sql
-- Phase 2: add liveness tracking columns to jobs table.
-- Unlocks /api/liveness and hourly QStash sweep.

alter table public.jobs
  add column if not exists liveness_status text check (liveness_status in ('active','expired','uncertain')),
  add column if not exists liveness_checked_at timestamptz;

create index if not exists jobs_liveness_idx
  on public.jobs(user_id, liveness_status, liveness_checked_at);

-- ════════════════════════════════════════════════════════════
-- 004_audit_events_rls_hardening.sql
-- ════════════════════════════════════════════════════════════
-- supabase/migrations/004_audit_events_rls_hardening.sql
-- Security S1: append-only audit log + RLS sanity asserts.

-- ─── audit_events (append-only) ──────────────────────────────
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists audit_events_user_idx
  on public.audit_events(user_id, created_at desc);
create index if not exists audit_events_action_idx
  on public.audit_events(action, created_at desc);

-- Enforce append-only via triggers (RLS policy alone can't block service-role)
create or replace function public.prevent_audit_mutation()
returns trigger as $$
begin
  raise exception 'audit_events is append-only';
end;
$$ language plpgsql;

drop trigger if exists audit_events_no_update on public.audit_events;
create trigger audit_events_no_update
  before update on public.audit_events
  for each row execute function public.prevent_audit_mutation();

drop trigger if exists audit_events_no_delete on public.audit_events;
create trigger audit_events_no_delete
  before delete on public.audit_events
  for each row execute function public.prevent_audit_mutation();

alter table public.audit_events enable row level security;

drop policy if exists "users read own audit trail" on public.audit_events;
create policy "users read own audit trail" on public.audit_events
  for select using (auth.uid() = user_id);

-- Inserts go through service role only (cron, webhook, server action)
drop policy if exists "no anon insert" on public.audit_events;
create policy "no anon insert" on public.audit_events
  for insert with check (false);

-- ─── RLS sanity audit (run manually after apply) ─────────────
-- For each user-scoped table, verify rowsecurity = true.
-- If any row returns rowsecurity = false, that table is wide open.
--
-- Run this in Supabase SQL editor:
--
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--     and tablename in (
--       'resumes', 'resume_profiles', 'jobs', 'applications',
--       'scrape_sessions', 'scrape_logs',
--       'evaluations', 'scan_history', 'followups', 'story_bank',
--       'audit_events'
--     )
--   order by tablename;
--
-- All rows must show rowsecurity = true.

-- ════════════════════════════════════════════════════════════
-- 005_eval_public_share.sql
-- ════════════════════════════════════════════════════════════
-- supabase/migrations/005_eval_public_share.sql
-- Public eval share (UI-2.3 viral loop): user opt-in, anonymizable.

alter table public.evaluations
  add column if not exists is_public boolean not null default false,
  add column if not exists anon_level text not null default 'full_anon'
    check (anon_level in ('full_anon', 'company_only', 'user_named')),
  add column if not exists shared_at timestamptz;

create index if not exists evaluations_public_idx
  on public.evaluations(is_public)
  where is_public = true;

-- Anonymous read of public evaluations (for /share/[id] page)
drop policy if exists "anyone reads public evaluations" on public.evaluations;
create policy "anyone reads public evaluations" on public.evaluations
  for select using (is_public = true);

-- Note: existing user-scoped policies still apply for non-public reads.
-- A user reading their own private eval still uses "users read own evaluations".
