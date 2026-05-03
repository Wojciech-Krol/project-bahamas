-- ============================================================
-- file:    supabase/migrations/0014_beta_signups.sql
-- purpose: capture beta-list email signups from the marketing site.
--          BetaSignup.tsx form persists here. RLS: anon can INSERT
--          (one row per email — `email` is PK), only admins SELECT.
-- ============================================================

create extension if not exists citext;

create table if not exists public.beta_signups (
  email citext primary key,
  locale text not null default 'pl',
  source text,
  variant text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

comment on table public.beta_signups is
  'Beta waitlist captured from marketing site BetaSignup.tsx form. '
  'email is PK — duplicate signups upsert silently. ip_hash is a '
  'salted-and-truncated hash, not the raw IP, so we can rate-limit '
  'and de-dupe without retaining PII.';

create index if not exists idx_beta_signups_created_at
  on public.beta_signups (created_at desc);

alter table public.beta_signups enable row level security;

-- Anon INSERT — anyone can sign up. We rely on the citext PK to
-- collapse duplicates and on app-layer rate-limit + Turnstile to
-- block bots. Reading is admin-only.
drop policy if exists beta_signups_insert_anon on public.beta_signups;
create policy beta_signups_insert_anon on public.beta_signups
  for insert
  with check (true);

drop policy if exists beta_signups_select_admin on public.beta_signups;
create policy beta_signups_select_admin on public.beta_signups
  for select
  using (public.is_admin());

drop policy if exists beta_signups_delete_admin on public.beta_signups;
create policy beta_signups_delete_admin on public.beta_signups
  for delete
  using (public.is_admin());
