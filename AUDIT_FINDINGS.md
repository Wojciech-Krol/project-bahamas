# Hakuna — Pre-launch audit findings

Snapshot: after Phase A/B/C/D rollout + the four follow-up commits (curriculum/instructors, settings, insights, payouts, photo upload, cancel button). Every finding here was spot-verified against the current code on `fix/review-findings`. Severity:

- **P0** = launch blocker: loses money, leaks data, or breaks core flow
- **P1** = visibly broken or wrong for real users
- **P2** = polish, hardening, or future-proofing

---

## P0 — Launch blockers

### 1. Booking confirmation race overbooks under load
- **File**: `app/api/webhooks/stripe/route.ts:336–353`
- **Problem**: `currentSpots` read separately, then `UPDATE … WHERE spots_taken = currentSpots`. Two concurrent webhooks both read `currentSpots = N`, both attempt CAS. PostgreSQL serialises: first wins, second's UPDATE matches 0 rows → falls into the `overbooked = true` branch and refunds a perfectly legitimate booking even when capacity is far from full.
- **Fix**: Use the existing `increment_spots` SQL helper (migration 0008) which atomically `update sessions set spots_taken = spots_taken + 1 where id = ? and spots_taken < capacity returning *`. Single round trip, race-free.

### 2. Overbook apology email is a `console.info` stub
- **File**: `app/api/webhooks/stripe/route.ts:382–392`
- **Problem**: When the overbook branch fires, code logs `TODO send overbook apology email` and returns. User's card is refunded but they never hear about it — first they'll know is a Stripe statement weeks later. Will saturate support on launch day.
- **Fix**: Add `BookingOverbooked` email template + send to user (and partner) before returning.

### 3. `getSession()` vs `getUser()` audit needed (potential auth-trust on JWT)
- **File**: All Server Actions + Server Components reading auth state
- **Problem**: `getSession()` trusts the cookie blindly. Only `getUser()` revalidates the JWT against Supabase auth servers. The shared helper at `src/lib/db/server.ts:83` correctly uses `auth.getUser()` ✅, but a stray `auth.getSession()` anywhere else is a privilege-escalation hole.
- **Fix**: `grep -r "auth.getSession" app src` — convert each to `auth.getUser()`. Currently unverified across the whole tree.

### 4. Stripe currency hardcoded to PLN expectation
- **File**: `src/lib/payments/bookingActions.ts:338`, partner editor allows `EUR/GBP/USD`
- **Problem**: Class editor lets a partner pick `EUR` for `currency`. createBooking flows that value straight into Stripe Checkout `price_data.currency`. Stripe accepts it, but the partner's Stripe Connect account only settles in their declared currency. Result: cross-currency settlement fees, unexpected FX, partner refund disputes.
- **Fix**: Whitelist `currency` to `PLN` in `classes/actions.ts` until multi-currency is intentional, OR enforce that the partner's Stripe Connect account currency matches.

### 5. New-format Supabase secret key may break service_role bypass
- **File**: `.env.local` (operator), all admin-client paths
- **Problem**: User reported `permission denied for table partners` when seeding with `sb_secret_*` key. Root cause: this Supabase project has not yet migrated `sb_secret_*` → service_role grants, so the new key is treated as anon. Until verified working, every admin-bypass operation (seed, webhook attribution writes, account anonymization, integrations storage upload) silently fails.
- **Fix**: Confirm by running an admin-client SELECT against `partners` from a server route. If still failing, revert to legacy `service_role` JWT in `SUPABASE_SERVICE_ROLE_KEY`.

---

## P1 — Broken or visibly wrong

### 6. Beta signup form is a no-op
- **File**: `app/components/BetaSignup.tsx:22–28`
- **Problem**: `onSubmit` only sets local `status="success"`. No DB insert, no email, no Resend list. Shows "thanks!" UI; user never gets contacted.
- **Fix**: New `POST /api/beta-signup` route or Server Action that inserts into a `beta_signups` table + sends confirmation via Resend.

### 7. Search-page "Filters" button has no handler
- **File**: `app/[locale]/(marketing)/search/SearchClient.tsx:281`
- **Problem**: Desktop "tune" button rendered with no `onClick`. Click does nothing. The mobile sibling (`MobileTopBar`) has the same dead button.
- **Fix**: Wire to a filter drawer or remove the button entirely.

### 8. Search map shows fake jittered points around Warsaw center
- **File**: `app/[locale]/(marketing)/search/SearchClient.tsx:209–223`
- **Problem**: Pin coordinates computed as `WARSAW_CENTER + cos(angle)*radius` per result index — pure decoration. The `venues` schema has `lat / lng` columns but neither the activity query nor the search client uses them.
- **Fix**: Add `lat, lng` to ACTIVITY_SELECT, surface on `Activity` UI type, render real coordinates. Activities without lat/lng → drop from map (still in list).

### 9. Heart / favorite buttons are visual-only
- **Files**: `app/[locale]/(marketing)/search/SearchClient.tsx:36–43`, activity card variants
- **Problem**: `onClick={(e) => e.preventDefault()}`. No `favorites` table exists. Phase E in earlier plan deliberately deferred this; flag now so it's tracked.
- **Fix**: Add `favorites(user_id, activity_id, created_at)` table + RLS + heart action, OR remove the icon entirely so it doesn't lie.

### 10. CSRF guard accepts `sec-fetch-site: same-site`
- **File**: `src/lib/auth/csrf.ts:32`
- **Problem**: `same-site` covers sibling subdomains (e.g., anything on `*.hakuna.app`). If Hakuna ever ships an `api.hakuna.app` or a customer-controlled subdomain, an attacker on a sister subdomain can CSRF logout / data-export.
- **Fix**: Drop `"same-site"` from the accept list; keep `"same-origin"` and `"none"` only.

### 11. `webhook_events` has no DELETE policy + no admin SELECT policy
- **File**: `supabase/migrations/0001_initial.sql` (table created, RLS enabled, ZERO policies)
- **Status correction**: With RLS enabled + no policies, anon/authenticated **cannot** read or write — so the agent's "leak" claim is FALSE. But admins reading webhook history for debugging via the Supabase dashboard work fine via service-role bypass. Operationally OK; cosmetically worth a `select_admin` policy + comment.
- **Fix**: Add `webhook_events_select_admin` for `is_admin()`. No INSERT/UPDATE/DELETE policy needed (service role only).

### 12. CRON_SECRET, Stripe secret, etc — already in env preflight ✅
- **Status correction**: Agent claimed `CRON_SECRET` missing from production warning. It's at `src/env.ts:151`. ✅ Already covered.

### 13. Activity `time` field returns empty string
- **File**: `src/lib/db/queries/activities.ts:94`
- **Problem**: Comment says `// TODO Phase 1b+: compute from next sessions.starts_at`. Activity cards show empty `time` in the home/search rails.
- **Fix**: Sub-query the next `sessions.starts_at` per activity (or denormalise `next_session_at` on a trigger).

### 14. Site URL fallback is `https://hakuna.example`
- **File**: `app/sitemap.ts`, `app/robots.ts`, `src/env.ts:128`
- **Problem**: If `NEXT_PUBLIC_SITE_URL` unset in prod, sitemap canonicals + Stripe success URLs point at a non-existent host. Already in env preflight warning, but a missing env still emits the bad URL rather than failing the build.
- **Fix**: Throw at module init in production when missing.

### 15. `/admin` not in robots.ts disallow
- **File**: `app/robots.ts:8`
- **Problem**: Disallows `/pl/partner` + `/en/partner` only. Admin shell at `/{locale}/admin` is crawlable.
- **Fix**: Add `/pl/admin`, `/en/admin` to disallow list.

### 16. Sitemap missing dynamic activity + school routes
- **File**: `app/sitemap.ts`
- **Problem**: Only static + blog slugs emitted. Every activity + venue page invisible to Google. Single biggest SEO gap.
- **Fix**: Async sitemap that queries published activity + venue ids and emits per-locale URLs with hreflang alternates.

### 17. No rate limit on login / signup / account-deletion
- **Files**: `app/[locale]/(auth)/actions.ts`, `app/[locale]/account/actions.ts`
- **Problem**: Existing `partnerApplyRateLimiter` not extended to authentication endpoints. Bot-grade credential stuffing is unmitigated.
- **Fix**: Wrap loginAction, signupAction, googleSignInAction, requestAccountDeletion with the same Upstash limiter (e.g., 5/15min/IP for login, 3/h/IP for signup).

### 18. No rate limit on createBooking
- **File**: `src/lib/payments/bookingActions.ts:106`
- **Problem**: Authenticated user can mash the Book button to create N pending bookings, locking inventory until the 30-min cron expires them.
- **Fix**: Per-user limiter (e.g., 5 createBooking per minute) before the action body.

### 19. No image-upload abuse limit
- **File**: `app/[locale]/partner/(shell)/venue/actions.ts:102+` (`uploadVenueHero`, `uploadVenueGalleryPhoto`)
- **Problem**: Authenticated partner could fill the `venues` Storage bucket with 10MB JPEGs in a loop. No request count cap.
- **Fix**: Per-partner upload-rate limit (e.g., 30/hour) + total-quota check.

### 20. `tsx` test file has duplicate-key TS errors
- **File**: `tests/commission.spec.ts:26, 31, 32`
- **Problem**: Pre-existing. `npx tsc --noEmit` fails. Vitest still passes (last-key-wins). Blocks adding `tsc` to CI as a required check.
- **Fix**: Hoist `overrides.partner` etc into named constants instead of duplicate object spreads.

### 21. Cancel-booking refund + status update not transactional
- **File**: `src/lib/payments/bookingActions.ts:518–560`
- **Problem**: Stripe refund issued first, then booking row updated to `status='cancelled'`. If the update fails (DB blip), refund is processed but user still sees confirmed booking — perceived double-charge support load.
- **Fix**: After Stripe refund, retry the row update with backoff; on permanent failure log to Sentry with `bookingId + paymentIntentId` so ops can reconcile.

### 22. Email sending failures swallowed
- **Files**: `app/api/webhooks/stripe/route.ts:498–500`, `bookingActions.ts:621–623`
- **Problem**: `try { await sendEmail(...) } catch (err) { console.error(...) }`. No Sentry. No retry queue. Resend outage = user gets booking but no confirmation email. Pure user-trust hit.
- **Fix**: `Sentry.captureException(err, { tags: { kind: "email_send_fail" } })` minimum. Long-term: persist to `email_queue` table + cron retry.

### 23. POS sync error not surfaced to partner UI
- **File**: `app/api/cron/pos-sync/route.ts` + integrations dashboard
- **Problem**: After 3 consecutive failures the cron emails the admin and flips `status='error'`. The partner sees no in-app banner or email. They keep believing schedules are syncing.
- **Fix**: Show `status` + `last_error` on `/partner/integrations`; partner-facing email on first error after a healthy run.

### 24. Activity `time` value drives sort + display but is empty
- See finding #13. Knock-on visual: home page + search show no time.

### 25. POS providers (5 of 6) hardcoded "Coming soon"
- **File**: `app/[locale]/partner/(shell)/integrations/page.tsx`
- **Problem**: Only CSV provider is wired. ActiveNow / WodGuru / eFitness / Langlion / Booksy cards render but cannot connect.
- **Fix**: Either ship the adapters (each is ~1–2 days) or hide the cards behind an env flag and a "request access" CTA.

### 26. Account deletion cron may anonymize profile but fail to delete auth user
- **File**: `app/api/cron/process-account-deletions/route.ts:113–122`
- **Problem**: Profile anonymization succeeds, then `auth.admin.deleteUser()` fails (network blip, FK conflict). User's PII is gone but the auth row + email remain. They can never sign back up with the same email; ops must manually reconcile.
- **Fix**: Run auth deletion FIRST, then anonymize on success only. Or wrap both in a per-user idempotent transaction with explicit "rollback profile" path.

### 27. PartnerSidebar uses CURRENT_USER mock
- **File**: `app/components/partner/PartnerSidebar.tsx`
- **Problem**: Sidebar still imports a mock user pill (name, avatar, initial). Real partner sees "Ava Morin" not their own identity.
- **Fix**: `getCurrentUser()` in `(shell)/layout.tsx`, pass profile down via context or prop, swap the mock.

### 28. Signup confirmation email path untested with Resend
- **File**: `app/[locale]/(auth)/actions.ts:69–110` (signupAction), `src/lib/email/resend.ts`
- **Problem**: signupAction calls `supabase.auth.signUp` with `emailRedirectTo` — Supabase sends the confirmation email via its own transactional templates (not Resend). Until Supabase Auth → SMTP → Resend integration is configured in the dashboard, the email is a Supabase-default styled message that may go to spam. Dashboard checklist item exists but not verified.
- **Fix**: Configure Supabase Auth → SMTP custom (Resend SMTP creds) and customise the template; add a launch-checklist test that signs up + confirms a Gmail+Outlook arrival.

### 29. Tests directory has 0 unit tests for new code
- **Files**: `app/[locale]/partner/(shell)/{settings,classes,venue,reviews,bookings,instructors}/actions.ts`
- **Problem**: All Server Actions added in Phase D + follow-ups have no test coverage. Webhook idempotency, RLS bypass attempts, slug-uniqueness — none verified.
- **Fix**: Add vitest specs for the auth-check / ownership-check / validation paths at minimum. E2E coverage in `tests/e2e/` is decent but server-action units are missing.

---

## P2 — Polish + hardening

### 30. CSP allows `js.stripe.com` frame-src wide
- `next.config.ts`: tighten to `https://checkout.stripe.com` for frames, leave `js.stripe.com` for script-src only.

### 31. Partner / curriculum / instructors DELETE policies allow only admin
- `supabase/migrations/0011_curriculum_and_instructors.sql` delete policies use `is_admin()` only — partner can't delete a curriculum item they added. Likely an oversight in the verified write — check & fix to also include `is_partner_member()`.

### 32. `SCHOOL_DETAIL_BASE`, `ACTIVITY_DETAIL_BASE`, `AVATAR`, mock decorations still imported
- Not blockers — used as fallback hero images + avatar piles when DB doesn't supply. Either add the missing columns (e.g., `joined_count`) or strip the decoration completely.

### 33. Sentry init untested in production
- `instrumentation.ts` and `sentry.*.config.ts` exist but no test-fire path. Launch checklist has the `/api/debug-sentry` step — keep but verify pre-launch.

### 34. OAuth callback hardcodes `pl` fallback locale
- `app/api/auth/callback/route.ts`: when `next` missing, lands on `/pl` regardless of starting locale. UX bug for English-speaking signups.

### 35. Stripe `STRIPE_CONNECT_WEBHOOK_SECRET` filtering fragility
- `app/api/webhooks/stripe/route.ts:85–89`: empty-string env var silently filters out. Add explicit warning if set-but-empty.

### 36. POS encryption key has no rotation playbook
- `src/lib/pos/crypto.ts` requires `POS_CONFIG_ENCRYPTION_KEY`. No documented procedure for re-encrypting `pos_integrations.config_encrypted` blobs after rotation.

### 37. `next.config.ts` Sentry silent-skip when `SENTRY_AUTH_TOKEN` missing
- Builds succeed without sourcemap upload — fine, but production builds without sourcemaps make crash triage painful. Add a CI guard that requires the token in production builds.

### 38. Image alt text mostly empty / decorative
- Across activity/school cards: `alt=""` for hero images. Accessibility hit + SEO miss. Use `alt={activity.title}` etc.

### 39. Mapbox token absence shows error modal instead of list-only fallback
- `app/components/MapboxMap.tsx`: fail-graceful path renders an error card. Search page becomes mostly blank. Better: hide the map area, expand the results list to full width.

### 40. Activity hero image fallback to `IMG.hero` constant
- `ActivityClient.tsx`: when DB returns `hero_image=null`, falls back to a hardcoded Unsplash URL. Acceptable transitional, but consider a branded gradient placeholder + ALT explaining "no photo".

---

## Verified-FALSE claims from the audit agents (not real issues)

- ❌ "webhook_events readable by authenticated users" — RLS enabled + no policies = total deny. ✅ secure.
- ❌ "CRON_SECRET missing from production preflight" — present at `src/env.ts:151`. ✅
- ❌ "Account delete button missing from /account" — wired via `requestAccountDeletion` action + `AccountForms.tsx`. ✅
- ❌ "Closest activities still uses mock" — Phase A1 swapped to `getClosestActivities()` from DB. ✅
- ❌ "Webhook signature verification missing" — covered at `route.ts:62–80`, supports both platform + Connect signing secrets. ✅
- ❌ "All 40 tests passing" — `tsc --noEmit` reports 3 type errors in `commission.spec.ts`. Vitest passes but TS checks fail.

---

## Recommended pre-launch order

1. **Fix booking race** (#1) — single highest-impact + cheapest fix (swap to `increment_spots` RPC).
2. **Implement overbook apology email** (#2) — paired with #1.
3. **Currency whitelist** (#4) — one-line change to the editor schema.
4. **Verify `sb_secret_*` actually grants service-role** (#5) — five-minute probe; revert to legacy JWT if not.
5. **Wire beta signup, search filters, heart button** OR remove all three (#6, #7, #9) — kill features that lie.
6. **Tighten CSRF same-site → same-origin** (#10).
7. **Rate-limit auth + booking + uploads** (#17, #18, #19).
8. **Real session time on activity cards** (#13).
9. **Sitemap dynamic routes** (#16).
10. **`/admin` to robots disallow** (#15).
11. **Sentry-wrap email + Stripe action error swallows** (#21, #22).
12. **Run end-to-end test booking with live keys** — already in LAUNCH_CHECKLIST.

After 1–11 land, cycle the LAUNCH_CHECKLIST.md from top to bottom and tick boxes.
