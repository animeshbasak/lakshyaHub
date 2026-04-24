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
