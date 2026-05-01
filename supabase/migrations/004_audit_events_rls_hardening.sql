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
