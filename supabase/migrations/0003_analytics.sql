-- ============================================================
-- file:    supabase/migrations/0003_analytics.sql
-- purpose: phase 4 partner analytics — view_events table for
--          activity pageview tracking, plus three sql views
--          (partner_daily_revenue, activity_conversion,
--          session_occupancy) that feed the partner overview
--          charts (revenue cards, bookings trend, top activities,
--          occupancy heatmap). see plan_akcji/HAKUNA_BUILD_PLAN.md
--          "phase 4 — partner analytics".
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- view_events — raw client-side pageview log
-- ============================================================

-- stores one row per public activity pageview. populated by the
-- /api/events/view route handler using the service role. no pii
-- beyond what's specified here: an opaque anonymous_id cookie
-- value (uuid generated client-side, rotates only when cleared)
-- and an optional referrer url. user_id is populated only when
-- the visitor is signed in at view time.
create table if not exists public.view_events (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  anonymous_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  referrer text,
  created_at timestamptz not null default now()
);


-- ============================================================
-- row level security
-- ============================================================

alter table public.view_events enable row level security;

-- intentionally: no insert policy. the route handler writes
-- through the service-role admin client which bypasses rls.
-- clients (anon + authenticated) cannot write view_events.

-- partner members of the activity's venue can read their own
-- analytics; admins can read everything. no public / user-facing
-- read policy — regular users never see these rows.
drop policy if exists view_events_select_partner on public.view_events;
create policy view_events_select_partner on public.view_events
  for select
  using (
    public.is_admin()
    or exists (
      select 1
        from public.activities a
        join public.venues v on v.id = a.venue_id
       where a.id = view_events.activity_id
         and public.is_partner_member(v.partner_id)
    )
  );


-- ============================================================
-- indexes
-- ============================================================

-- primary analytics access pattern: "all views for this activity
-- in a time window, newest first" — powers the per-activity
-- conversion view and any future activity-scoped dashboards.
create index if not exists idx_view_events_activity_created
  on public.view_events (activity_id, created_at desc);


-- ============================================================
-- analytics views
-- ============================================================

-- all three views intentionally inherit rls from their underlying
-- tables. a partner member sees only their own bookings / view_events
-- because the row-level policies on bookings + view_events + venues
-- filter before the view's aggregation runs. grant select on the
-- views themselves to authenticated so postgrest can query them.


-- partner_daily_revenue -------------------------------------------
--
-- one row per (partner, utc day) where the partner had at least
-- one confirmed booking. gross = sum(amount_cents). commission =
-- sum(commission_cents) — the value hakuna kept (inclusive of any
-- boost-inflated first-booking commission). net_partner = the
-- share that went to the partner's stripe account
-- (gross − commission).
--
-- commission math here mirrors what the stripe connect transfer
-- actually split (application_fee vs. destination amount); see
-- `src/lib/payments/commission.ts` and the checkout session
-- construction in `src/lib/payments/bookingActions.ts`.
create or replace view public.partner_daily_revenue as
  select
    p.id                                              as partner_id,
    (b.confirmed_at at time zone 'utc')::date         as day,
    count(*)::int                                     as confirmed_count,
    sum(b.amount_cents)::int                          as gross_cents,
    sum(b.commission_cents)::int                      as commission_cents,
    sum(b.amount_cents - b.commission_cents)::int     as net_partner_cents
    from public.bookings b
    join public.sessions   s on s.id = b.session_id
    join public.activities a on a.id = s.activity_id
    join public.venues     v on v.id = a.venue_id
    join public.partners   p on p.id = v.partner_id
   where b.status = 'confirmed'
     and b.confirmed_at is not null
   group by p.id, (b.confirmed_at at time zone 'utc')::date;


-- activity_conversion ---------------------------------------------
--
-- one row per activity, pairing lifetime view count with confirmed
-- booking count and a precomputed conversion rate. safe-divides
-- (returns 0 when views_count is zero rather than nulling out).
-- partner_id is denormalised onto the view for cheap filtering from
-- the partner dashboard.
create or replace view public.activity_conversion as
  with v_counts as (
    select activity_id, count(*)::int as views_count
      from public.view_events
     group by activity_id
  ),
  b_counts as (
    select s.activity_id, count(*)::int as booking_count
      from public.bookings b
      join public.sessions s on s.id = b.session_id
     where b.status = 'confirmed'
     group by s.activity_id
  )
  select
    a.id                                                  as activity_id,
    ven.partner_id                                        as partner_id,
    coalesce(v_counts.views_count, 0)                     as views_count,
    coalesce(b_counts.booking_count, 0)                   as booking_count,
    case
      when coalesce(v_counts.views_count, 0) = 0 then 0::numeric(5,4)
      else (coalesce(b_counts.booking_count, 0)::numeric
            / v_counts.views_count::numeric)::numeric(5,4)
    end                                                   as conversion_rate
    from public.activities a
    join public.venues ven on ven.id = a.venue_id
    left join v_counts on v_counts.activity_id = a.id
    left join b_counts on b_counts.activity_id = a.id;


-- session_occupancy -----------------------------------------------
--
-- one row per scheduled session, exposing the spots_taken /
-- capacity ratio. skips capacity=0 rows so consumers never divide
-- by zero. partner_id is denormalised here too, same reason.
-- occupancy_rate is clamped in [0, 1] by the spots_taken <= capacity
-- check constraint on sessions.
create or replace view public.session_occupancy as
  select
    s.id                                           as session_id,
    s.activity_id                                  as activity_id,
    v.partner_id                                   as partner_id,
    s.starts_at                                    as starts_at,
    s.spots_taken                                  as spots_taken,
    s.capacity                                     as capacity,
    (s.spots_taken::numeric / s.capacity::numeric) as occupancy_rate
    from public.sessions s
    join public.activities a on a.id = s.activity_id
    join public.venues     v on v.id = a.venue_id
   where s.capacity > 0;


-- ============================================================
-- grants — views
-- ============================================================

-- let authenticated (postgrest) query the views. the underlying
-- table policies still govern row visibility, so a partner member
-- will only see their own partner's aggregated rows.
grant select on public.partner_daily_revenue to authenticated;
grant select on public.activity_conversion  to authenticated;
grant select on public.session_occupancy    to authenticated;


-- ============================================================
-- sanity checks (paste into supabase sql editor as anon / partner)
-- ============================================================

-- -- 1. anon sees zero view_events (no select policy applies):
-- select count(*) from public.view_events;
--
-- -- 2. anon cannot write view_events (no insert policy applies):
-- -- insert into public.view_events (activity_id, anonymous_id)
-- --   values (gen_random_uuid(), 'abcd');   -- should fail / 403
--
-- -- 3. a signed-in partner member sees only their own activities
-- --    through activity_conversion (row-level inheritance):
-- select activity_id, views_count, booking_count, conversion_rate
--   from public.activity_conversion;
--
-- -- 4. a signed-in partner member's revenue is per-utc-day:
-- select day, confirmed_count, gross_cents, commission_cents,
--        net_partner_cents
--   from public.partner_daily_revenue
--  order by day desc;
--
-- -- 5. session_occupancy skips capacity=0 rows and stays in [0,1]:
-- select session_id, spots_taken, capacity, occupancy_rate
--   from public.session_occupancy
--  order by occupancy_rate desc
--  limit 10;
