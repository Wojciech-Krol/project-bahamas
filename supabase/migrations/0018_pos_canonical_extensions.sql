-- ============================================================
-- file:    supabase/migrations/0018_pos_canonical_extensions.sql
-- purpose: POS integration phase 2 — canonical schema extensions
--          for batch CSV imports + multi-provider observability.
--
-- Adds three tables:
--   pricing_rules     — partner products (single, pass_count,
--                       pass_unlimited, subscription)
--   pos_import_jobs   — per-CSV-upload audit + idempotency
--                       (SHA-256 file_hash unique)
--   pos_sync_logs     — per-sync-run structured log for the
--                       integrations dashboard + Sentry crosswalk
--
-- Reuses existing schema: activities (= plan's "classes"),
-- activity_instructors (= plan's "instructors"), sessions
-- (already has pos_provider + pos_external_id from 0001).
--
-- Service-role writes only on import_jobs / sync_logs from
-- server actions + cron. RLS scopes SELECT to the owning
-- partner's members.
-- ============================================================

-- ============================================================
-- pricing_rules
-- ============================================================

create table if not exists public.pricing_rules (
  id                       uuid primary key default gen_random_uuid(),
  partner_id               uuid not null references public.partners(id) on delete cascade,
  external_id              text not null,
  name                     text not null,
  rule_type                text not null check (
    rule_type in ('single', 'pass_count', 'pass_unlimited', 'subscription')
  ),
  price_minor              int not null check (price_minor >= 0),
  currency                 text not null default 'PLN' check (length(currency) = 3),
  pass_count               int check (pass_count is null or pass_count > 0),
  validity_days            int check (validity_days is null or validity_days > 0),
  applies_to_activity_ids  uuid[] not null default '{}'::uuid[],
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (partner_id, external_id)
);

comment on table public.pricing_rules is
  'Partner products / passes. rule_type=single → one entry. '
  'pass_count → 10x card. pass_unlimited → unlimited within validity_days. '
  'subscription → recurring (Stripe Price billing tier in future phase). '
  'applies_to_activity_ids empty array = applies to all of partner''s activities.';

drop trigger if exists trg_pricing_rules_set_updated_at on public.pricing_rules;
create trigger trg_pricing_rules_set_updated_at
  before update on public.pricing_rules
  for each row execute function public.set_updated_at();

create index if not exists idx_pricing_rules_partner
  on public.pricing_rules (partner_id);

create index if not exists idx_pricing_rules_applies_to_gin
  on public.pricing_rules using gin (applies_to_activity_ids);

alter table public.pricing_rules enable row level security;

drop policy if exists pricing_rules_select_public on public.pricing_rules;
create policy pricing_rules_select_public on public.pricing_rules
  for select using (true);

drop policy if exists pricing_rules_insert_member on public.pricing_rules;
create policy pricing_rules_insert_member on public.pricing_rules
  for insert
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists pricing_rules_update_member on public.pricing_rules;
create policy pricing_rules_update_member on public.pricing_rules
  for update
  using (public.is_partner_member(partner_id) or public.is_admin())
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists pricing_rules_delete_member on public.pricing_rules;
create policy pricing_rules_delete_member on public.pricing_rules
  for delete
  using (public.is_partner_member(partner_id) or public.is_admin());


-- ============================================================
-- pos_import_jobs
-- ============================================================

create table if not exists public.pos_import_jobs (
  id                uuid primary key default gen_random_uuid(),
  partner_id        uuid not null references public.partners(id) on delete cascade,
  pos_provider      pos_provider not null,
  resource_type     text not null check (
    resource_type in ('sessions', 'activities', 'instructors', 'pricing')
  ),
  status            text not null default 'pending' check (
    status in ('pending', 'parsing', 'validating', 'importing', 'completed', 'failed')
  ),
  storage_path      text,
  file_hash         text,
  encoding          text,
  total_rows        int,
  successful_rows   int,
  error_count       int,
  errors            jsonb not null default '[]'::jsonb,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  created_by        uuid references auth.users(id) on delete set null
);

-- Idempotency: same partner uploading the byte-identical file
-- twice = no-op (returns previous job result). Composite UNIQUE
-- on (partner, resource_type, file_hash) so re-uploading the same
-- sessions.csv is a no-op even if instructors.csv hash collides.
create unique index if not exists uq_pos_import_jobs_idempotent
  on public.pos_import_jobs (partner_id, resource_type, file_hash)
  where file_hash is not null;

create index if not exists idx_pos_import_jobs_partner_started
  on public.pos_import_jobs (partner_id, started_at desc);

create index if not exists idx_pos_import_jobs_active
  on public.pos_import_jobs (status)
  where status in ('pending', 'parsing', 'validating', 'importing');

comment on table public.pos_import_jobs is
  'Per-CSV-upload audit row. file_hash = SHA-256 of the raw bytes; '
  'duplicate uploads short-circuit via uq_pos_import_jobs_idempotent. '
  'Service-role writes only — partners READ via RLS, server action '
  'creates the row.';

alter table public.pos_import_jobs enable row level security;

drop policy if exists pos_import_jobs_select_member on public.pos_import_jobs;
create policy pos_import_jobs_select_member on public.pos_import_jobs
  for select
  using (public.is_partner_member(partner_id) or public.is_admin());


-- ============================================================
-- pos_sync_logs
-- ============================================================

create table if not exists public.pos_sync_logs (
  id              uuid primary key default gen_random_uuid(),
  partner_id      uuid not null references public.partners(id) on delete cascade,
  pos_provider    pos_provider not null,
  sync_type       text not null check (
    sync_type in ('webhook', 'poll', 'reconciliation', 'manual', 'cron')
  ),
  correlation_id  uuid not null,
  resource_type   text,
  external_id     text,
  hakuna_id       uuid,
  event_type      text check (
    event_type is null or event_type in ('created', 'updated', 'deleted', 'noop', 'error')
  ),
  payload         jsonb,
  error_message   text,
  duration_ms     int,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pos_sync_logs_partner_time
  on public.pos_sync_logs (partner_id, created_at desc);

create index if not exists idx_pos_sync_logs_correlation
  on public.pos_sync_logs (correlation_id);

create index if not exists idx_pos_sync_logs_errors
  on public.pos_sync_logs (partner_id, created_at desc)
  where event_type = 'error';

comment on table public.pos_sync_logs is
  'Structured per-event log for every POS sync run. correlation_id '
  'groups all rows from a single cron tick / webhook delivery. '
  'Append-only; the daily reconcile cron prunes rows older than '
  '90 days.';

alter table public.pos_sync_logs enable row level security;

drop policy if exists pos_sync_logs_select_member on public.pos_sync_logs;
create policy pos_sync_logs_select_member on public.pos_sync_logs
  for select
  using (public.is_partner_member(partner_id) or public.is_admin());
