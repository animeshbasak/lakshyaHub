-- ============================================================
-- lakshya-hub initial schema
-- Apply in Supabase SQL Editor or via supabase db push
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── resumes ──────────────────────────────────────────────────
create table if not exists resumes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users not null,
  name        text        not null default 'Untitled Resume',
  data        jsonb       not null default '{}',
  template    text        not null default 'harvard',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── resume_profiles ──────────────────────────────────────────
-- Bridge: resume builder ↔ job search AI
create table if not exists resume_profiles (
  id               uuid      primary key references auth.users,
  target_titles    text[]    not null default '{}',
  skills           text[]    not null default '{}',
  target_locations text[]    not null default '{}',
  full_resume_text text,
  min_salary_lpa   numeric,
  max_salary_lpa   numeric,
  source           text      check (source in ('insaneresumake', 'pdf', 'manual')) default 'manual',
  synced_at        timestamptz,
  updated_at       timestamptz not null default now()
);

-- ── jobs ─────────────────────────────────────────────────────
create table if not exists jobs (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        references auth.users not null,
  session_id     uuid,
  source         text,                          -- 'linkedin' | 'naukri' | 'indeed' etc
  title          text        not null,
  company        text,
  location       text,
  description    text,
  url            text,
  salary_range   text,
  fit_score      integer     not null default 0,
  fit_breakdown  jsonb,                         -- EXPLICIT jsonb — never rely on inference
  raw_data       jsonb,
  dedup_hash     text,
  scraped_at     timestamptz not null default now(),
  unique (user_id, dedup_hash)
);

-- ── applications ─────────────────────────────────────────────
create table if not exists applications (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        references auth.users not null,
  job_id         uuid        references jobs(id) on delete cascade,
  status         text        not null check (status in ('saved','applied','interview','offer','rejected')) default 'saved',
  applied_at     timestamptz,
  notes          text,
  resume_version text,
  updated_at     timestamptz not null default now(),
  unique (user_id, job_id)
);

-- ── scrape_sessions ──────────────────────────────────────────
create table if not exists scrape_sessions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users not null,
  source        text,
  query         text,
  status        text        not null check (status in ('running','completed','failed')) default 'running',
  jobs_found    integer     not null default 0,
  jobs_saved    integer     not null default 0,
  error_message text,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ── scrape_logs ──────────────────────────────────────────────
create table if not exists scrape_logs (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        references scrape_sessions(id) on delete cascade,
  type       text        not null check (type in ('info','success','warn','error')),
  message    text,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table resumes          enable row level security;
alter table resume_profiles  enable row level security;
alter table jobs             enable row level security;
alter table applications     enable row level security;
alter table scrape_sessions  enable row level security;
alter table scrape_logs      enable row level security;

create policy "users_own_resumes"
  on resumes for all using (user_id = auth.uid());

create policy "users_own_profile"
  on resume_profiles for all using (id = auth.uid());

create policy "users_own_jobs"
  on jobs for all using (user_id = auth.uid());

create policy "users_own_applications"
  on applications for all using (user_id = auth.uid());

create policy "users_own_scrape_sessions"
  on scrape_sessions for all using (user_id = auth.uid());

-- scrape_logs: readable if session belongs to user
create policy "users_read_scrape_logs"
  on scrape_logs for select using (
    session_id in (
      select id from scrape_sessions where user_id = auth.uid()
    )
  );

-- ── updated_at triggers ───────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_updated_at
  before update on resumes
  for each row execute function update_updated_at_column();

create trigger applications_updated_at
  before update on applications
  for each row execute function update_updated_at_column();

create trigger resume_profiles_updated_at
  before update on resume_profiles
  for each row execute function update_updated_at_column();
