-- ============================================================
-- file:    supabase/migrations/0002_bookings.sql
-- purpose: phase 3.2 booking flow — stripe connect account id on
--          partners, listing_boosts table, customer/partner
--          attribution table, boost_id fk on bookings, rls, and
--          the venue_rankings view used by /search sorting in
--          phase 3.4. see plan_akcji/HAKUNA_BUILD_PLAN.md
--          "commission spec — single source of truth" for the
--          commission rules this schema is designed to support.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- partners — stripe connect account id
-- ============================================================

alter table public.partners
  add column if not exists stripe_account_id text unique;


-- ============================================================
-- tables
-- ============================================================

create table if not exists public.listing_boosts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'expired', 'pending')),
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- exactly one of activity_id / venue_id must be set:
  -- activity-scoped boost xor venue-wide boost.
  check ((activity_id is null) <> (venue_id is null))
);

create table if not exists public.customer_partner_attribution (
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  first_booking_id uuid references public.bookings(id) on delete set null,
  was_boost_attributed boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, partner_id)
);


-- ============================================================
-- bookings — boost reference
-- ============================================================

alter table public.bookings
  add column if not exists boost_id uuid references public.listing_boosts(id) on delete set null;


-- ============================================================
-- updated_at triggers
-- ============================================================

drop trigger if exists trg_listing_boosts_set_updated_at on public.listing_boosts;
create trigger trg_listing_boosts_set_updated_at
  before update on public.listing_boosts
  for each row execute function public.set_updated_at();

-- customer_partner_attribution is immutable once written — no updated_at.


-- ============================================================
-- row level security
-- ============================================================

alter table public.listing_boosts               enable row level security;
alter table public.customer_partner_attribution enable row level security;


-- listing_boosts ----------------------------------------------

-- public can see only boosts that are active *right now* — this is
-- what the /search ranking view needs to read as anon.
drop policy if exists listing_boosts_select_active on public.listing_boosts;
create policy listing_boosts_select_active on public.listing_boosts
  for select
  using (
    status = 'active'
    and now() between starts_at and ends_at
  );

drop policy if exists listing_boosts_select_member on public.listing_boosts;
create policy listing_boosts_select_member on public.listing_boosts
  for select
  using (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists listing_boosts_insert_member on public.listing_boosts;
create policy listing_boosts_insert_member on public.listing_boosts
  for insert
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists listing_boosts_update_member on public.listing_boosts;
create policy listing_boosts_update_member on public.listing_boosts
  for update
  using (public.is_partner_member(partner_id) or public.is_admin())
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists listing_boosts_delete_admin on public.listing_boosts;
create policy listing_boosts_delete_admin on public.listing_boosts
  for delete
  using (public.is_admin());


-- customer_partner_attribution --------------------------------

-- the attributed user, partner members of the attributed partner,
-- and admins can read. writes happen via service role only — no
-- insert/update policy means anon + authenticated cannot write.
drop policy if exists cpa_select_own_or_partner on public.customer_partner_attribution;
create policy cpa_select_own_or_partner on public.customer_partner_attribution
  for select
  using (
    user_id = auth.uid()
    or public.is_partner_member(partner_id)
    or public.is_admin()
  );

-- intentionally: no insert/update/delete policies for client roles.
-- attribution rows are written from the stripe webhook handler using
-- the service role (bypasses rls). attribution is permanent per spec.


-- ============================================================
-- indexes
-- ============================================================

-- "does this partner have an active boost right now?" — the hot
-- path for /search ranking and for createBooking commission logic.
create index if not exists idx_listing_boosts_partner_status_ends
  on public.listing_boosts (partner_id, status, ends_at desc);

create index if not exists idx_listing_boosts_activity
  on public.listing_boosts (activity_id)
  where activity_id is not null;

create index if not exists idx_listing_boosts_venue
  on public.listing_boosts (venue_id)
  where venue_id is not null;

create index if not exists idx_bookings_boost
  on public.bookings (boost_id)
  where boost_id is not null;


-- ============================================================
-- venue_rankings view — phase 3.4 /search ordering
-- ============================================================

-- consumers should order by
--   (has_active_boost desc, has_subscription desc, rating desc, created_at desc)
-- to match the booksy-style placement rules: boosted partners first,
-- subscribed partners next, then by rating / recency. a boost row
-- with venue_id = null means the partner has a venue-wide boost, so
-- every venue under that partner inherits has_active_boost = true.
create or replace view public.venue_rankings as
  select
    v.id           as venue_id,
    p.id           as partner_id,
    exists (
      select 1
        from public.listing_boosts lb
       where lb.partner_id = p.id
         and lb.status = 'active'
         and now() between lb.starts_at and lb.ends_at
         and (lb.venue_id = v.id or lb.venue_id is null)
    )              as has_active_boost,
    (p.subscription_commission_bps is not null) as has_subscription,
    v.rating       as rating,
    v.created_at   as created_at
    from public.venues v
    left join public.partners p on p.id = v.partner_id;


-- ============================================================
-- sanity checks (paste into supabase sql editor as anon)
-- ============================================================

-- -- 1. anon sees only currently-active boosts, never expired/pending:
-- select id, status, starts_at, ends_at from public.listing_boosts;
--
-- -- 2. anon cannot see any attribution rows:
-- select count(*) from public.customer_partner_attribution;
--
-- -- 3. venue_rankings exposes boolean flags for /search ordering:
-- select venue_id, has_active_boost, has_subscription, rating
--   from public.venue_rankings
--  order by has_active_boost desc, has_subscription desc, rating desc, created_at desc
--  limit 10;
--
-- -- 4. xor constraint: inserting a boost with both activity_id and
-- --    venue_id (or neither) must fail with a check violation.
-- -- insert into public.listing_boosts (partner_id, ends_at) values (gen_random_uuid(), now() + interval '7 days');
--
-- -- 5. partners.stripe_account_id is unique — second insert with the
-- --    same value must fail.
-- -- update public.partners set stripe_account_id = 'acct_test' where id = '...';
