-- ============================================================
-- file:    supabase/migrations/0001_initial.sql
-- purpose: initial schema for the hakuna marketplace — enums,
--          core tables, row level security, policies, indexes,
--          auth.users -> profiles bridge, and storage buckets
--          (venues, avatars) with their object policies.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- extensions
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- enums
-- ============================================================

do $$ begin
  create type user_role as enum ('user', 'partner', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type partner_status as enum ('pending', 'approved', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_status as enum ('scheduled', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pos_provider as enum ('manual', 'csv', 'activenow', 'wodguru', 'efitness', 'langlion');
exception when duplicate_object then null; end $$;


-- ============================================================
-- shared trigger function — updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'user',
  locale text not null default 'pl',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status partner_status not null default 'pending',
  contact_email text not null,
  city text,
  commission_rate_bps int not null default 2000,
  subscription_tier text not null default 'none',
  subscription_commission_bps int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_members (
  partner_id uuid not null references public.partners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (partner_id, user_id)
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description_i18n jsonb not null default '{}'::jsonb,
  address text,
  lat double precision,
  lng double precision,
  hero_image text,
  gallery jsonb not null default '[]'::jsonb,
  rating numeric(2,1),
  review_count int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  price_cents int not null,
  currency text not null default 'PLN',
  duration_min int not null,
  level text,
  category text,
  age_group text,
  hero_image text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null,
  spots_taken int not null default 0 check (spots_taken <= capacity),
  status session_status not null default 'scheduled',
  pos_provider pos_provider not null default 'manual',
  pos_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  amount_cents int not null,
  currency text not null default 'PLN',
  commission_bps int not null,
  commission_cents int not null,
  is_boost_first_booking boolean not null default false,
  boost_commission_bps int,
  stripe_checkout_id text,
  stripe_payment_intent_id text,
  status text not null default 'pending',
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);


-- ============================================================
-- updated_at triggers
-- ============================================================

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_partners_set_updated_at on public.partners;
create trigger trg_partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

drop trigger if exists trg_partner_members_set_updated_at on public.partner_members;
create trigger trg_partner_members_set_updated_at
  before update on public.partner_members
  for each row execute function public.set_updated_at();

drop trigger if exists trg_venues_set_updated_at on public.venues;
create trigger trg_venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

drop trigger if exists trg_activities_set_updated_at on public.activities;
create trigger trg_activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

drop trigger if exists trg_sessions_set_updated_at on public.sessions;
create trigger trg_sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_set_updated_at on public.reviews;
create trigger trg_reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_set_updated_at on public.bookings;
create trigger trg_bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();


-- ============================================================
-- auth.users -> profiles bridge
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- authorization helpers
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and role = 'admin'
  );
$$;

create or replace function public.is_partner_member(p_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.partner_members
     where partner_id = p_partner_id
       and user_id = auth.uid()
  );
$$;


-- ============================================================
-- row level security
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.partners         enable row level security;
alter table public.partner_members  enable row level security;
alter table public.venues           enable row level security;
alter table public.activities       enable row level security;
alter table public.sessions         enable row level security;
alter table public.reviews          enable row level security;
alter table public.bookings         enable row level security;
alter table public.webhook_events   enable row level security;


-- profiles ----------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- partners ----------------------------------------------------

drop policy if exists partners_select_public on public.partners;
create policy partners_select_public on public.partners
  for select
  using (
    status = 'approved'
    or public.is_partner_member(id)
    or public.is_admin()
  );

drop policy if exists partners_insert_member on public.partners;
create policy partners_insert_member on public.partners
  for insert
  with check (public.is_admin());

drop policy if exists partners_update_member on public.partners;
create policy partners_update_member on public.partners
  for update
  using (public.is_partner_member(id) or public.is_admin())
  with check (public.is_partner_member(id) or public.is_admin());

drop policy if exists partners_delete_admin on public.partners;
create policy partners_delete_admin on public.partners
  for delete
  using (public.is_admin());


-- partner_members ---------------------------------------------

drop policy if exists partner_members_select on public.partner_members;
create policy partner_members_select on public.partner_members
  for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists partner_members_insert on public.partner_members;
create policy partner_members_insert on public.partner_members
  for insert
  with check (
    public.is_admin()
    or exists (
      select 1
        from public.partner_members pm
       where pm.partner_id = partner_members.partner_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

drop policy if exists partner_members_delete on public.partner_members;
create policy partner_members_delete on public.partner_members
  for delete
  using (
    public.is_admin()
    or exists (
      select 1
        from public.partner_members pm
       where pm.partner_id = partner_members.partner_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );


-- venues ------------------------------------------------------

drop policy if exists venues_select on public.venues;
create policy venues_select on public.venues
  for select
  using (
    is_published
    or public.is_partner_member(partner_id)
    or public.is_admin()
  );

drop policy if exists venues_insert on public.venues;
create policy venues_insert on public.venues
  for insert
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists venues_update on public.venues;
create policy venues_update on public.venues
  for update
  using (public.is_partner_member(partner_id) or public.is_admin())
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists venues_delete on public.venues;
create policy venues_delete on public.venues
  for delete
  using (public.is_partner_member(partner_id) or public.is_admin());


-- activities --------------------------------------------------

drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities
  for select
  using (
    (
      is_published
      and exists (
        select 1
          from public.venues v
         where v.id = activities.venue_id
           and v.is_published
      )
    )
    or exists (
      select 1
        from public.venues v
       where v.id = activities.venue_id
         and public.is_partner_member(v.partner_id)
    )
    or public.is_admin()
  );

drop policy if exists activities_insert on public.activities;
create policy activities_insert on public.activities
  for insert
  with check (
    public.is_admin()
    or exists (
      select 1
        from public.venues v
       where v.id = activities.venue_id
         and public.is_partner_member(v.partner_id)
    )
  );

drop policy if exists activities_update on public.activities;
create policy activities_update on public.activities
  for update
  using (
    public.is_admin()
    or exists (
      select 1
        from public.venues v
       where v.id = activities.venue_id
         and public.is_partner_member(v.partner_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
        from public.venues v
       where v.id = activities.venue_id
         and public.is_partner_member(v.partner_id)
    )
  );

drop policy if exists activities_delete on public.activities;
create policy activities_delete on public.activities
  for delete
  using (
    public.is_admin()
    or exists (
      select 1
        from public.venues v
       where v.id = activities.venue_id
         and public.is_partner_member(v.partner_id)
    )
  );


-- sessions ----------------------------------------------------

drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions
  for select
  using (
    (
      status = 'scheduled'
      and starts_at > now()
      and exists (
        select 1
          from public.activities a
          join public.venues v on v.id = a.venue_id
         where a.id = sessions.activity_id
           and a.is_published
           and v.is_published
      )
    )
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = sessions.activity_id
         and public.is_partner_member(v.partner_id)
    )
    or public.is_admin()
  );

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions
  for insert
  with check (
    public.is_admin()
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = sessions.activity_id
         and public.is_partner_member(v.partner_id)
    )
  );

drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions
  for update
  using (
    public.is_admin()
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = sessions.activity_id
         and public.is_partner_member(v.partner_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = sessions.activity_id
         and public.is_partner_member(v.partner_id)
    )
  );

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions
  for delete
  using (
    public.is_admin()
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = sessions.activity_id
         and public.is_partner_member(v.partner_id)
    )
  );


-- reviews -----------------------------------------------------

drop policy if exists reviews_select_all on public.reviews;
create policy reviews_select_all on public.reviews
  for select
  using (true);

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1
        from public.bookings b
        join public.sessions s on s.id = b.session_id
        join public.activities a on a.id = s.activity_id
       where b.user_id = auth.uid()
         and b.status = 'confirmed'
         and a.venue_id = reviews.venue_id
         and (reviews.activity_id is null or a.id = reviews.activity_id)
    )
  );

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
  for update
  using (
    author_id = auth.uid()
    and created_at > now() - interval '24 hours'
  )
  with check (author_id = auth.uid());

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews
  for delete
  using (
    author_id = auth.uid()
    and created_at > now() - interval '24 hours'
  );


-- bookings ----------------------------------------------------

drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings
  for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
        from public.sessions s
        join public.activities a on a.id = s.activity_id
        join public.venues    v on v.id = a.venue_id
       where s.id = bookings.session_id
         and public.is_partner_member(v.partner_id)
    )
  );

-- intentionally: no insert/update/delete policies for client roles.
-- inserts happen via server actions using the service role (bypasses rls)
-- and webhook-driven updates likewise use the service role.


-- webhook_events ----------------------------------------------

-- rls enabled, no policies = no access to anon / authenticated roles.
-- service role bypasses rls and is the only writer/reader.


-- ============================================================
-- indexes
-- ============================================================

create index if not exists idx_sessions_starts_at
  on public.sessions (starts_at);

create index if not exists idx_sessions_activity_starts
  on public.sessions (activity_id, starts_at);

create unique index if not exists uq_sessions_activity_pos_external
  on public.sessions (activity_id, pos_external_id)
  where pos_external_id is not null;

create index if not exists idx_activities_venue
  on public.activities (venue_id);

create index if not exists idx_venues_published_rating
  on public.venues (is_published, rating desc);

create index if not exists idx_partner_members_user
  on public.partner_members (user_id);

create index if not exists idx_bookings_user
  on public.bookings (user_id);

create index if not exists idx_bookings_session
  on public.bookings (session_id);

create index if not exists idx_reviews_venue
  on public.reviews (venue_id);


-- ============================================================
-- storage — buckets
-- ============================================================

insert into storage.buckets (id, name, public)
values ('venues', 'venues', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


-- ============================================================
-- storage — object policies
-- ============================================================

-- public read for both buckets
drop policy if exists storage_read_public_buckets on storage.objects;
create policy storage_read_public_buckets on storage.objects
  for select
  using (bucket_id in ('venues', 'avatars'));


-- venues: partner members of the partner encoded in the first path segment
drop policy if exists storage_venues_insert on storage.objects;
create policy storage_venues_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'venues'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_venues_update on storage.objects;
create policy storage_venues_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'venues'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'venues'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_venues_delete on storage.objects;
create policy storage_venues_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'venues'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );


-- avatars: owning user encoded in the first path segment
drop policy if exists storage_avatars_insert on storage.objects;
create policy storage_avatars_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );

drop policy if exists storage_avatars_update on storage.objects;
create policy storage_avatars_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  )
  with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );

drop policy if exists storage_avatars_delete on storage.objects;
create policy storage_avatars_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );


-- ============================================================
-- sanity checks (paste into supabase sql editor as anon)
-- ============================================================

-- -- 1. anon sees zero unpublished venues (should return 0, not error):
-- select count(*) from public.venues where is_published = false;
--
-- -- 2. anon sees zero bookings regardless of who made them:
-- select count(*) from public.bookings;
--
-- -- 3. anon cannot read webhook_events at all:
-- select count(*) from public.webhook_events;
--
-- -- 4. anon-visible sessions are only future, scheduled, on published rows:
-- select id, starts_at, status from public.sessions limit 10;
--
-- -- 5. anon sees only approved partners:
-- select id, slug, status from public.partners;
