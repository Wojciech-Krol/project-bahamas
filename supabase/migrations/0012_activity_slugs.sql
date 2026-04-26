-- ============================================================
-- file:    supabase/migrations/0012_activity_slugs.sql
-- purpose: add SEO-friendly slug column to activities. venues.slug
--          already exists (see 0001_initial.sql). slugs are derived
--          from title_i18n.pl (fallback to en) + venue city + short
--          uuid suffix for uniqueness. used by /pl/zajecia/[slug]
--          and /en/activity/[slug] routes.
-- ============================================================

-- pgcrypto + pg_trgm are already enabled in 0001. unaccent strips
-- polish diacritics so "Joga Vinyasa" → "joga-vinyasa".
create extension if not exists unaccent;

-- ============================================================
-- helper — produce a kebab-case slug from arbitrary text.
-- ============================================================
-- 1. lowercase + unaccent (ą→a, ć→c, ł→l, etc).
-- 2. replace any run of non-alnum with single hyphen.
-- 3. trim leading/trailing hyphens.
-- 4. cap to ~80 chars to keep URLs readable.
-- ============================================================
create or replace function public.kebabify(input text)
returns text
language plpgsql
immutable
as $$
declare
  out text;
begin
  if input is null or length(trim(input)) = 0 then
    return null;
  end if;
  out := lower(unaccent(input));
  -- ł isn't covered by unaccent on every install — patch it manually.
  out := replace(out, 'ł', 'l');
  out := regexp_replace(out, '[^a-z0-9]+', '-', 'g');
  out := regexp_replace(out, '^-+|-+$', '', 'g');
  if length(out) > 80 then
    out := substring(out from 1 for 80);
    out := regexp_replace(out, '-+$', '', 'g');
  end if;
  return out;
end;
$$;

-- ============================================================
-- add slug column (nullable initially so backfill runs)
-- ============================================================

alter table public.activities
  add column if not exists slug text;

-- ============================================================
-- backfill — title (pl preferred, en fallback) + venue city + 6-char uuid tail.
-- ============================================================
-- the uuid tail guarantees uniqueness even when two venues run a
-- class with the same title in the same city. on a fresh prod
-- database this is a no-op.
-- ============================================================

update public.activities a
set slug = case
  when v.city is not null and length(trim(v.city)) > 0 then
    coalesce(public.kebabify(coalesce(a.title_i18n->>'pl', a.title_i18n->>'en', a.id::text)), 'zajecia')
    || '-'
    || coalesce(public.kebabify(v.city), 'pl')
    || '-'
    || substring(replace(a.id::text, '-', '') from 1 for 6)
  else
    coalesce(public.kebabify(coalesce(a.title_i18n->>'pl', a.title_i18n->>'en', a.id::text)), 'zajecia')
    || '-'
    || substring(replace(a.id::text, '-', '') from 1 for 6)
end
from public.venues v
where a.venue_id = v.id
  and a.slug is null;

-- any rows whose venue_id resolves to nothing get a fallback slug.
update public.activities
set slug = 'zajecia-' || substring(replace(id::text, '-', '') from 1 for 6)
where slug is null;

-- ============================================================
-- enforce NOT NULL + UNIQUE going forward
-- ============================================================

alter table public.activities
  alter column slug set not null;

create unique index if not exists idx_activities_slug
  on public.activities (slug);

-- ============================================================
-- trigger — auto-generate slug on insert when caller omits it.
-- ============================================================
-- partners creating a new class via the dashboard only know the
-- title; the trigger derives a slug exactly the way the backfill
-- did. uniqueness is enforced by the index, so collisions surface
-- as a clean 23505 to the application layer.
-- ============================================================

create or replace function public.activities_set_slug()
returns trigger
language plpgsql
as $$
declare
  city_part text;
  title_part text;
  uid_tail text;
begin
  if new.slug is not null and length(trim(new.slug)) > 0 then
    return new;
  end if;

  select v.city into city_part
    from public.venues v where v.id = new.venue_id;

  title_part := coalesce(
    public.kebabify(coalesce(new.title_i18n->>'pl', new.title_i18n->>'en')),
    'zajecia'
  );
  uid_tail := substring(replace(coalesce(new.id::text, gen_random_uuid()::text), '-', '') from 1 for 6);

  if city_part is null or length(trim(city_part)) = 0 then
    new.slug := title_part || '-' || uid_tail;
  else
    new.slug := title_part || '-' || coalesce(public.kebabify(city_part), 'pl') || '-' || uid_tail;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_activities_set_slug on public.activities;
create trigger trg_activities_set_slug
  before insert on public.activities
  for each row execute function public.activities_set_slug();
