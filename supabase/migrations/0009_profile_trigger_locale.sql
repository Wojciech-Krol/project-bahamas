-- ============================================================
-- file:    supabase/migrations/0009_profile_trigger_locale.sql
-- purpose: extend handle_new_user to also persist the user's
--          locale from their auth metadata.
--
--   signupAction (after fix/auth-confirm-flow) passes the form's
--   locale into auth.signUp.options.data, but the trigger from
--   migration 0001 only read full_name + avatar_url. New profiles
--   defaulted to 'pl' regardless of the signup language. With this
--   migration the locale picked at signup actually sticks.
-- do not edit — add a new migration if you need changes.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, locale)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'locale', ''), 'pl')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger from 0001 still references this function — no need to drop+recreate
-- the trigger itself. CREATE OR REPLACE FUNCTION rewires the body in place.
