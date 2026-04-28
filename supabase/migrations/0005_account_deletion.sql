-- ============================================================
-- file:    supabase/migrations/0005_account_deletion.sql
-- purpose: phase 6 — GDPR account deletion.
--          Adds `profiles.deletion_requested_at` so the account
--          page can display "deletion pending" state, and the
--          `account_deletion_queue` table that the nightly cron
--          reads to actually anonymize + hard-delete users after
--          the 30-day grace period.
--
--          Bookings are NOT deleted — Polish/EU VAT law requires
--          financial records to be kept for ~5 years. We strip
--          `user_id` on hard delete (done in application code
--          via service role) so the booking row remains for
--          accounting but no longer links to a natural person.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- profiles.deletion_requested_at
-- ============================================================

alter table profiles
  add column if not exists deletion_requested_at timestamptz;


-- ============================================================
-- account_deletion_queue
--
-- Append-only queue of pending deletions. One row per user.
-- The cron at /api/cron/process-account-deletions reads rows
-- where `hard_delete_at <= now()` and processes them.
-- ============================================================

create table if not exists account_deletion_queue (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  -- 30-day grace window. Set at insert time; the cron compares
  -- this value to `now()` so changing the constant mid-flight
  -- doesn't retroactively reshape the queue.
  hard_delete_at timestamptz not null default (now() + interval '30 days'),
  -- null until processed; cron sets it on the way out for audit.
  processed_at timestamptz
);

create index if not exists account_deletion_queue_hard_delete_at_idx
  on account_deletion_queue (hard_delete_at)
  where processed_at is null;


-- ============================================================
-- RLS
--
-- Inserts come exclusively from the Server Action running with
-- the service role client — RLS is bypassed for that path. We
-- still enable RLS here so an anon-key query leak can't read
-- anyone else's deletion schedule.
-- ============================================================

alter table account_deletion_queue enable row level security;

-- SELECT: user sees own row; admins see everything. Used by the
-- account page to show "deletion requested — data will be removed
-- on {date}" state.
drop policy if exists account_deletion_queue_select_own
  on account_deletion_queue;
create policy account_deletion_queue_select_own
  on account_deletion_queue
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- INSERT / UPDATE / DELETE: no direct public path. The Server
-- Action uses the service role client, which bypasses RLS. No
-- policies here means nobody can write through the anon or
-- authenticated role.
