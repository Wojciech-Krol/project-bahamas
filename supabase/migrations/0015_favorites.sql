-- ============================================================
-- file:    supabase/migrations/0015_favorites.sql
-- purpose: per-user favorited activities. PK is composite
--          (user_id, activity_id) so duplicates are impossible.
--          Strict own-row RLS — nobody but the user (and admins)
--          can read or modify their list.
-- ============================================================

create table if not exists public.favorites (
  user_id     uuid not null references auth.users(id)        on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, activity_id)
);

comment on table public.favorites is
  'Per-user saved activities. Composite PK enforces "favorite once". '
  'No share / collection feature — strictly private per user.';

-- Listing a user''s favorites in created-at order is the hot path.
create index if not exists idx_favorites_user_created
  on public.favorites (user_id, created_at desc);

-- "Is X favorited by anyone" / count badges off activity → secondary path.
create index if not exists idx_favorites_activity
  on public.favorites (activity_id);

alter table public.favorites enable row level security;

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites
  for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
  for insert
  with check (user_id = auth.uid());

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
  for delete
  using (user_id = auth.uid() or public.is_admin());
