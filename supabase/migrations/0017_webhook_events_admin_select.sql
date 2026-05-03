-- ============================================================
-- file:    supabase/migrations/0017_webhook_events_admin_select.sql
-- purpose: cosmetic — let admins read `webhook_events` from the
--          Supabase dashboard (which authenticates as their user
--          JWT, not the service role). Without this policy, RLS
--          hides every row when an admin opens the table editor.
--          Service-role writes from the webhook handler are
--          unaffected; service role bypasses RLS.
--
-- No INSERT/UPDATE/DELETE policy added on purpose — webhook event
-- rows are append-only from server code only. Dashboard mutations
-- would be a footgun (would let a careless admin clobber the
-- replay protection for a Stripe event).
-- ============================================================

drop policy if exists webhook_events_select_admin on public.webhook_events;
create policy webhook_events_select_admin on public.webhook_events
  for select
  using (public.is_admin());
