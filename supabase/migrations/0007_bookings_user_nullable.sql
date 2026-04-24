-- ============================================================
-- file:    supabase/migrations/0007_bookings_user_nullable.sql
-- purpose: GDPR — let users be deleted while preserving their
--          bookings as financial records.
--
--   migration 0001 declared:
--     bookings.user_id uuid not null references auth.users(id)
--                                   on delete restrict
--   that combination was correct for ordinary use (don't accidentally
--   wipe bookings when a user row goes away) but it makes the GDPR
--   account-deletion cron unworkable: it can neither set user_id to
--   null (NOT NULL violation) nor delete the auth.users row (FK
--   restrict from any of the user's bookings).
--
--   plan tradeoff: bookings must be retained for ~5 years for EU
--   VAT/accounting. They no longer need to point to a natural person
--   after the grace window. So:
--     * drop NOT NULL on bookings.user_id
--     * change the FK to ON DELETE SET NULL — the cron's "strip
--       user_id" step becomes a side-effect of the auth.users delete
--       and the explicit UPDATE in the route handler can be retired.
--
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- bookings.user_id — nullable, FK on delete set null
-- ============================================================

alter table public.bookings
  alter column user_id drop not null;

alter table public.bookings
  drop constraint if exists bookings_user_id_fkey;

alter table public.bookings
  add constraint bookings_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;


-- ============================================================
-- index — partial, anonymized booking lookup
--
-- Anonymized rows (user_id IS NULL) still need to be reachable for
-- accounting reports. The existing idx_bookings_user only covers
-- non-null values implicitly (btree skips nulls only when explicit).
-- An explicit `where user_id is null` index is cheap and lets the
-- "show me all anonymized bookings" admin query stay fast.
-- ============================================================

create index if not exists idx_bookings_user_id_null
  on public.bookings (created_at desc)
  where user_id is null;


-- ============================================================
-- sanity checks (paste into supabase sql editor as service role)
-- ============================================================

-- -- 1. column is now nullable:
-- select column_name, is_nullable
--   from information_schema.columns
--  where table_schema = 'public' and table_name = 'bookings' and column_name = 'user_id';
--
-- -- 2. FK action is now SET NULL (was RESTRICT):
-- select tc.constraint_name, rc.delete_rule
--   from information_schema.table_constraints tc
--   join information_schema.referential_constraints rc on rc.constraint_name = tc.constraint_name
--  where tc.table_name = 'bookings' and tc.constraint_name = 'bookings_user_id_fkey';
--
-- -- 3. simulate user deletion (against a test user). Their bookings should
-- --    survive with user_id = null:
-- -- delete from auth.users where id = '<test_user_id>';
-- -- select id, user_id, status from public.bookings where user_id is null;
