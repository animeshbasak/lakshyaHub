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
