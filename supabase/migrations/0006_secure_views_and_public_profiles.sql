-- ============================================================
-- file:    supabase/migrations/0006_secure_views_and_public_profiles.sql
-- purpose: tighten the analytics + ranking views so they actually
--          honour the row-level security policies on their underlying
--          tables, and introduce a `public_profiles` view that exposes
--          a minimal author-display projection (id, full_name,
--          avatar_url) for review rendering without leaking `role` or
--          `locale` to anon / authenticated callers.
--
-- background:
--   postgres views run as their OWNER unless explicitly created with
--   `security_invoker = true`. our migrations 0002 + 0003 created four
--   views (`venue_rankings`, `partner_daily_revenue`, `activity_conversion`,
--   `session_occupancy`) without that option, so any authenticated user
--   could read every partner's aggregated data through the views even
--   though the table-level rls policies were correctly scoped.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- security_invoker on phase 2/3/4 views
-- ============================================================

-- recreate each view in place — `create or replace view` keeps the
-- definition body intact; we only change the option flag.

create or replace view public.venue_rankings
  with (security_invoker = true) as
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


create or replace view public.partner_daily_revenue
  with (security_invoker = true) as
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


create or replace view public.activity_conversion
  with (security_invoker = true) as
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


create or replace view public.session_occupancy
  with (security_invoker = true) as
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
-- public_profiles — author-display projection
-- ============================================================

-- expose only the columns we want anyone to be able to render in a
-- review byline. deliberately omits `role` (don't let anon enumerate
-- admins) and `locale` (mildly identifying, not needed for display).
--
-- created with `security_invoker = false` (the postgres default) so
-- anon + authenticated can SELECT through it even though the
-- underlying `profiles` table's row-level policy
-- (`profiles_select_own`) restricts direct access. the columns
-- exposed here are the minimum needed for public-facing review
-- author bylines and are considered public-by-design once a user
-- has authored at least one displayed review.
create or replace view public.public_profiles as
  select
    id,
    full_name,
    avatar_url
    from public.profiles;

grant select on public.public_profiles to anon, authenticated;


-- ============================================================
-- sanity checks (paste into supabase sql editor as anon)
-- ============================================================

-- -- 1. analytics views now respect rls — a partner member sees only
-- --    their own partner's rows; anon sees zero (because anon can't
-- --    see any bookings / view_events).
-- select count(*) from public.partner_daily_revenue;
--
-- -- 2. session_occupancy as anon: only future scheduled sessions on
-- --    published activities (the policy on `sessions` filters first).
-- select count(*) from public.session_occupancy;
--
-- -- 3. venue_rankings still queryable by anon for /search ordering,
-- --    but per-row visibility now follows the venue rls policy
-- --    (published venues only).
-- select venue_id, has_active_boost, has_subscription
--   from public.venue_rankings limit 5;
--
-- -- 4. public_profiles is readable by anyone:
-- select id, full_name, avatar_url
--   from public.public_profiles limit 5;
--
-- -- 5. role / locale are NOT visible through public_profiles even to
-- --    authenticated users — only the projected columns.
-- -- select role from public.public_profiles;   -- column does not exist
