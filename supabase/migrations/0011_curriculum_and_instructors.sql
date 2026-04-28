-- ============================================================
-- file:    supabase/migrations/0011_curriculum_and_instructors.sql
-- purpose: schema-backed curriculum bullets and instructor profiles
--          for activity detail pages. each activity owns 0..N
--          curriculum items (numbered, optional image) and 0..N
--          instructor entries (name + role/bio i18n + optional
--          avatar + credentials list). rls mirrors the activities
--          policy stack: published rows readable by anon,
--          drafts visible to partner_members, writes gated by
--          partner_members of the venue's owning partner.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- tables
-- ============================================================

create table if not exists public.activity_curriculum_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  position int not null,
  title_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, position)
);

create table if not exists public.activity_instructors (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  position int not null default 0,
  name text not null,
  role_i18n jsonb not null default '{}'::jsonb,
  bio_i18n jsonb not null default '{}'::jsonb,
  avatar_url text,
  credentials_i18n jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- updated_at triggers — reuse public.set_updated_at from 0001
-- ============================================================

drop trigger if exists trg_curriculum_items_set_updated_at on public.activity_curriculum_items;
create trigger trg_curriculum_items_set_updated_at
  before update on public.activity_curriculum_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_activity_instructors_set_updated_at on public.activity_instructors;
create trigger trg_activity_instructors_set_updated_at
  before update on public.activity_instructors
  for each row execute function public.set_updated_at();


-- ============================================================
-- indexes
-- ============================================================

create index if not exists idx_curriculum_items_activity
  on public.activity_curriculum_items (activity_id, position);

create index if not exists idx_activity_instructors_activity
  on public.activity_instructors (activity_id, position);


-- ============================================================
-- row level security
-- ============================================================

alter table public.activity_curriculum_items enable row level security;
alter table public.activity_instructors      enable row level security;


-- helper: a partner_member of the partner that owns the activity's venue
-- can see + write the child rows. inlined as exists() subselect rather
-- than a SQL function so the policy planner can use the existing
-- idx_curriculum_items_activity / idx_activity_instructors_activity index.

-- curriculum_items --------------------------------------------

drop policy if exists curriculum_items_select_published on public.activity_curriculum_items;
create policy curriculum_items_select_published on public.activity_curriculum_items
  for select
  using (
    exists (
      select 1
        from public.activities a
       where a.id = activity_id
         and a.is_published = true
    )
  );

drop policy if exists curriculum_items_select_member on public.activity_curriculum_items;
create policy curriculum_items_select_member on public.activity_curriculum_items
  for select
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists curriculum_items_insert_member on public.activity_curriculum_items;
create policy curriculum_items_insert_member on public.activity_curriculum_items
  for insert
  with check (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists curriculum_items_update_member on public.activity_curriculum_items;
create policy curriculum_items_update_member on public.activity_curriculum_items
  for update
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists curriculum_items_delete_member on public.activity_curriculum_items;
create policy curriculum_items_delete_member on public.activity_curriculum_items
  for delete
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );


-- activity_instructors ----------------------------------------

drop policy if exists activity_instructors_select_published on public.activity_instructors;
create policy activity_instructors_select_published on public.activity_instructors
  for select
  using (
    exists (
      select 1
        from public.activities a
       where a.id = activity_id
         and a.is_published = true
    )
  );

drop policy if exists activity_instructors_select_member on public.activity_instructors;
create policy activity_instructors_select_member on public.activity_instructors
  for select
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists activity_instructors_insert_member on public.activity_instructors;
create policy activity_instructors_insert_member on public.activity_instructors
  for insert
  with check (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists activity_instructors_update_member on public.activity_instructors;
create policy activity_instructors_update_member on public.activity_instructors
  for update
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );

drop policy if exists activity_instructors_delete_member on public.activity_instructors;
create policy activity_instructors_delete_member on public.activity_instructors
  for delete
  using (
    exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = activity_id
         and (public.is_partner_member(v.partner_id) or public.is_admin())
    )
  );


-- ============================================================
-- sanity checks (paste into supabase sql editor)
-- ============================================================

-- -- 1. anon sees only items of published activities:
-- select count(*) from public.activity_curriculum_items;
-- select count(*) from public.activity_instructors;
--
-- -- 2. partner member of the right partner sees drafts too.
--
-- -- 3. partner member of a DIFFERENT partner cannot insert a row pointing
-- --    at a foreign activity (RLS check fails).
