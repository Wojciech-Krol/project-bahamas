-- ============================================================
-- file:    supabase/migrations/0016_user_calendar_integrations.sql
-- purpose: store per-user OAuth tokens for Google Calendar +
--          track which booking maps to which calendar event so we
--          can update / delete on lifecycle changes.
--
-- Tokens are AES-256-GCM encrypted at the app layer (see
-- src/lib/calendar/crypto.ts). We never store cleartext tokens.
-- ============================================================

create table if not exists public.user_calendar_integrations (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  provider                 text not null default 'google',
  access_token_encrypted   bytea not null,
  refresh_token_encrypted  bytea not null,
  token_expires_at         timestamptz not null,
  calendar_id              text not null default 'primary',
  scope                    text not null,
  sync_enabled             boolean not null default true,
  last_synced_at           timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

drop trigger if exists trg_user_calendar_integrations_set_updated_at
  on public.user_calendar_integrations;
create trigger trg_user_calendar_integrations_set_updated_at
  before update on public.user_calendar_integrations
  for each row execute function public.set_updated_at();

comment on table public.user_calendar_integrations is
  'OAuth tokens for the user''s connected calendar provider (currently '
  'only Google). Tokens are AES-256-GCM ciphertexts — never stored '
  'cleartext. PK = user_id so each user has at most one integration.';

create table if not exists public.booking_calendar_events (
  booking_id        uuid primary key references public.bookings(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  provider          text not null default 'google',
  calendar_event_id text not null,
  status            text not null default 'created',
  last_synced_at    timestamptz not null default now(),
  last_error        text
);

create index if not exists idx_booking_calendar_events_user
  on public.booking_calendar_events (user_id);

comment on table public.booking_calendar_events is
  'Per-booking record of the corresponding calendar event id. '
  'status: created | updated | deleted | failed. last_error captured '
  'when sync failed for the daily reconcile cron to retry.';

alter table public.user_calendar_integrations enable row level security;
alter table public.booking_calendar_events enable row level security;

-- Both tables are operated on exclusively by the service role from
-- server actions / webhook handlers. Users can SEE their own row
-- (the dashboard reads sync status), but they cannot mutate it
-- directly — connect/disconnect goes through OAuth + Server Action,
-- not a raw SQL grant. INSERT/UPDATE/DELETE policies omitted on
-- purpose; service role bypasses RLS, all user mutation goes through
-- vetted server code.
drop policy if exists user_calendar_integrations_select_own
  on public.user_calendar_integrations;
create policy user_calendar_integrations_select_own
  on public.user_calendar_integrations
  for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists booking_calendar_events_select_own
  on public.booking_calendar_events;
create policy booking_calendar_events_select_own
  on public.booking_calendar_events
  for select
  using (user_id = auth.uid() or public.is_admin());
