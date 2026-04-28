-- ============================================================
-- file:    supabase/migrations/0004_pos_integrations.sql
-- purpose: phase 5a — POS integration framework. Adds the
--          `pos_integrations` table (per-partner per-provider
--          connection record with an encrypted credentials blob),
--          plus the private `pos-uploads` storage bucket used by
--          the CSV adapter. RLS is scoped so partners see only
--          their own integrations and objects; admins see all.
--          The `config_encrypted` column is a binary AEAD ciphertext
--          (IV || auth_tag || ciphertext) produced by
--          `src/lib/pos/crypto.ts` using aes-256-gcm. The key
--          lives in env (`POS_CONFIG_ENCRYPTION_KEY`) — Postgres
--          never sees the plaintext, never has the key, and cannot
--          decrypt.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- extensions — pgcrypto already exists from 0001, re-assert for
-- safety if this migration is ever re-run standalone.
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- pos_integrations
-- ============================================================

-- one row per (partner, provider). `pos_provider` enum was created
-- in 0001 so all providers are already valid targets even while
-- only the csv adapter is implemented (see src/lib/pos/adapter.ts).
--
-- lifecycle:
--   * status='active'    — cron picks up this integration every sync
--   * status='disabled'  — partner turned it off; cron skips
--   * status='error'     — cron hit >=3 consecutive failures; admin
--                          was notified. operator or partner must
--                          fix config and re-enable.
--
-- `consecutive_failures` resets to 0 on every successful fetch;
-- `last_error` is cleared on success; `last_synced_at` is set only
-- on success. `last_error` may be null even with status='error'
-- transiently between the failure increment and the row update.
create table if not exists public.pos_integrations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  provider pos_provider not null,
  config_encrypted bytea not null,
  status text not null default 'active'
    check (status in ('active', 'disabled', 'error')),
  last_synced_at timestamptz,
  last_error text,
  consecutive_failures int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, provider)
);


-- ============================================================
-- updated_at trigger — shared function defined in 0001.
-- ============================================================

drop trigger if exists trg_pos_integrations_set_updated_at on public.pos_integrations;
create trigger trg_pos_integrations_set_updated_at
  before update on public.pos_integrations
  for each row execute function public.set_updated_at();


-- ============================================================
-- row level security
-- ============================================================

alter table public.pos_integrations enable row level security;

-- partner members of the owning partner + admins can read the row.
-- note: `config_encrypted` is only meaningful with the app-level
-- aes-256-gcm key in env. even if a client somehow read the bytea,
-- they could not decrypt without POS_CONFIG_ENCRYPTION_KEY, which
-- is server-only. the column is still covered by this select policy
-- so we don't advertise ciphertext to anon/authenticated at all.
drop policy if exists pos_integrations_select_member on public.pos_integrations;
create policy pos_integrations_select_member on public.pos_integrations
  for select
  using (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists pos_integrations_insert_member on public.pos_integrations;
create policy pos_integrations_insert_member on public.pos_integrations
  for insert
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists pos_integrations_update_member on public.pos_integrations;
create policy pos_integrations_update_member on public.pos_integrations
  for update
  using (public.is_partner_member(partner_id) or public.is_admin())
  with check (public.is_partner_member(partner_id) or public.is_admin());

drop policy if exists pos_integrations_delete_member on public.pos_integrations;
create policy pos_integrations_delete_member on public.pos_integrations
  for delete
  using (public.is_partner_member(partner_id) or public.is_admin());


-- ============================================================
-- indexes
-- ============================================================

-- cron: "all active integrations, any provider" — small table,
-- but the status index keeps the cron scan cheap as it grows.
create index if not exists idx_pos_integrations_status
  on public.pos_integrations (status)
  where status = 'active';

create index if not exists idx_pos_integrations_partner
  on public.pos_integrations (partner_id);


-- ============================================================
-- storage — pos-uploads bucket (private)
-- ============================================================

-- private bucket: unlike `venues` / `avatars` from 0001, the POS
-- uploads bucket is NOT publicly readable. the CSV adapter fetches
-- from it through the service-role admin client only.
insert into storage.buckets (id, name, public)
values ('pos-uploads', 'pos-uploads', false)
on conflict (id) do nothing;


-- ============================================================
-- storage — pos-uploads object policies
-- ============================================================

-- read: partner members of the partner encoded in the first path
-- segment. no anon / public read. admin via is_admin().
drop policy if exists storage_pos_uploads_select on storage.objects;
create policy storage_pos_uploads_select on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pos-uploads'
    and (
      public.is_admin()
      or public.is_partner_member(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists storage_pos_uploads_insert on storage.objects;
create policy storage_pos_uploads_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pos-uploads'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_pos_uploads_update on storage.objects;
create policy storage_pos_uploads_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pos-uploads'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'pos-uploads'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_pos_uploads_delete on storage.objects;
create policy storage_pos_uploads_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pos-uploads'
    and public.is_partner_member(((storage.foldername(name))[1])::uuid)
  );


-- ============================================================
-- sanity checks (paste into supabase sql editor as anon / partner)
-- ============================================================

-- -- 1. anon sees zero pos_integrations (no select policy applies):
-- select count(*) from public.pos_integrations;
--
-- -- 2. anon cannot enumerate pos-uploads objects:
-- select count(*) from storage.objects where bucket_id = 'pos-uploads';
--
-- -- 3. partner member sees only own integration rows:
-- select id, provider, status, last_synced_at, last_error,
--        consecutive_failures
--   from public.pos_integrations;
--
-- -- 4. config_encrypted is binary, not plaintext — eyeballing the
-- --    column should show \x…-encoded bytea, not recognisable json:
-- select provider, length(config_encrypted) as cfg_bytes
--   from public.pos_integrations;
--
-- -- 5. unique (partner_id, provider): a second insert with the same
-- --    (partner_id, 'csv') pair must fail. the partner integrations
-- --    page upserts to avoid that path.
