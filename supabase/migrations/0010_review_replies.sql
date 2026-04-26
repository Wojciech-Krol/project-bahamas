-- ============================================================
-- file:    supabase/migrations/0010_review_replies.sql
-- purpose: partner replies to customer reviews. adds two
--          nullable columns to public.reviews and an rls
--          policy that lets partner_members of the venue
--          owning the review update only those columns.
-- do not edit — add a new migration if you need changes.
-- ============================================================


-- ============================================================
-- columns
-- ============================================================

alter table public.reviews
  add column if not exists partner_reply text,
  add column if not exists partner_reply_at timestamptz;


-- ============================================================
-- row level security
-- ============================================================

-- the existing reviews_update_own policy allows the AUTHOR to edit
-- their review for 24h. we add a separate policy for partner replies
-- without touching that one.
--
-- the policy uses USING + WITH CHECK on the venue → partner_members
-- chain, so a partner can only update reviews tied to a venue they
-- belong to. column-level write protection (only partner_reply* may
-- change, not rating/text/author_id) is enforced by the server action
-- that issues the update — postgres rls is row-scope, not column-scope.
drop policy if exists reviews_update_partner_reply on public.reviews;
create policy reviews_update_partner_reply on public.reviews
  for update
  using (
    exists (
      select 1
        from public.venues v
       where v.id = public.reviews.venue_id
         and public.is_partner_member(v.partner_id)
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1
        from public.venues v
       where v.id = public.reviews.venue_id
         and public.is_partner_member(v.partner_id)
    )
    or public.is_admin()
  );


-- ============================================================
-- sanity checks
-- ============================================================

-- -- 1. partner can update reply on a review for their venue:
-- update public.reviews set partner_reply = 'Thanks!' where id = '...';
--
-- -- 2. partner cannot update reply on a different partner's review:
-- update public.reviews set partner_reply = '...' where venue_id = '<other>';
--   --> 0 rows updated (RLS blocks)
