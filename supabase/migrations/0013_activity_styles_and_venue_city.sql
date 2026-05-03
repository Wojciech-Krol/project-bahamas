-- ============================================================
-- file:    supabase/migrations/0013_activity_styles_and_venue_city.sql
-- purpose: (1) add `style text[]` to activities for category-specific
--          sub-filters (e.g. dance → ['jazz','ballet','modern']).
--          (2) add `city text` to venues — referenced everywhere in
--          the read-side query layer (activities composer, search
--          ilike, programmatic city landings) but never actually
--          materialised on the table. Backfilled from `partners.city`
--          so existing data stays coherent.
-- ============================================================

-- (1) activity styles --------------------------------------------------
alter table public.activities
  add column if not exists style text[] not null default '{}'::text[];

-- GIN index for `style && $1` overlap filters in search.
create index if not exists idx_activities_style_gin
  on public.activities using gin (style);

comment on column public.activities.style is
  'Sub-category style tags (e.g. dance: [jazz, ballet]). Lower-cased '
  'kebab-case. Allowed values per category live in src/lib/categoryStyles.ts.';

-- (2) venue city -------------------------------------------------------
alter table public.venues
  add column if not exists city text;

-- Backfill venue.city from the parent partner.city. Many partners are
-- single-city operations so this is correct for the existing seed; the
-- partner UI will surface a per-venue editor in a follow-up.
update public.venues v
   set city = p.city
  from public.partners p
 where v.partner_id = p.id
   and v.city is null
   and p.city is not null;

-- Filter index — search ilike on city is the hottest discovery query.
create index if not exists idx_venues_city
  on public.venues (city);

comment on column public.venues.city is
  'Human-readable city label (e.g. "Warszawa"). Backfilled from '
  'partners.city in 0013. Future per-venue editor will let partners '
  'override per-location.';
