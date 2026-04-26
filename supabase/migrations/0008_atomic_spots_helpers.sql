-- ============================================================
-- file:    supabase/migrations/0008_atomic_spots_helpers.sql
-- purpose: SQL helpers that perform atomic mutations on
--          sessions.spots_taken so application code stops doing
--          racy read-then-write updates.
--
-- Why this matters:
--   `cancelBooking` previously read `spots_taken`, decremented in
--   memory, and wrote back. Two concurrent cancels racing on the
--   same session would both read N, both write N-1 — net effect:
--   the counter loses one decrement.
--
-- Two functions:
--   `decrement_spots(s_id)` — clamp at zero, atomic.
--   `increment_spots(s_id)` — atomic increment with capacity guard.
--      Returns the new spots_taken on success, NULL when the session
--      is already full (callers treat NULL as the overbook signal).
--
-- Both are SECURITY DEFINER so they can update sessions even when
-- the caller's RLS would otherwise restrict the row. Webhook /
-- cancel paths run with the service role and bypass RLS anyway, so
-- this is purely a defence-in-depth label.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- decrement_spots — atomic, clamped at zero
-- ============================================================

create or replace function public.decrement_spots(s_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  update public.sessions
     set spots_taken = greatest(0, spots_taken - 1)
   where id = s_id
   returning spots_taken into new_count;

  return new_count;
end;
$$;

revoke execute on function public.decrement_spots(uuid) from public;
grant execute on function public.decrement_spots(uuid) to service_role;


-- ============================================================
-- increment_spots — atomic, capacity-guarded
-- ============================================================

create or replace function public.increment_spots(s_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  update public.sessions
     set spots_taken = spots_taken + 1
   where id = s_id
     and spots_taken < capacity
   returning spots_taken into new_count;

  -- NULL when no row matched (either id doesn't exist or capacity
  -- already reached). Callers must distinguish "session vanished"
  -- from "overbooked" by checking the row's existence first.
  return new_count;
end;
$$;

revoke execute on function public.increment_spots(uuid) from public;
grant execute on function public.increment_spots(uuid) to service_role;


-- ============================================================
-- sanity checks (paste into supabase sql editor as service role)
-- ============================================================

-- -- 1. decrement clamps at zero — no underflow:
-- -- create test session with spots_taken = 0, then:
-- -- select public.decrement_spots('<session_id>');   -- returns 0
--
-- -- 2. increment respects capacity — returns NULL when full:
-- -- create test session capacity = 2, spots_taken = 2, then:
-- -- select public.increment_spots('<session_id>');   -- returns NULL
--
-- -- 3. increment + decrement are net zero under racing transactions
-- --    (verify in psql with two concurrent BEGIN/COMMIT blocks).
