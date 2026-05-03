# Hakuna — Launch Checklist

Operator checklist for flipping Hakuna from staging to production. Every item is a concrete action — no principles. Tick them off before the first real PLN touches the system.

> **Read first**: `AUDIT_FINDINGS.md` lists every code-level gap discovered in the post-Phase-D audit. Items below are deploy-time / config-time tasks; items in the audit doc are code fixes that must land before this checklist starts.

## DNS + email

- [ ] Point `hakuna.pl` apex A / AAAA records (and `www` CNAME) at the Vercel project.
- [ ] Add `hakuna.club` + `www.hakuna.club` to the Vercel project as additional domains. Code redirects them to `hakuna.pl` (301 permanent) via `next.config.ts` `redirects()`. Set `HAKUNA_DUAL_DOMAIN=1` in env to disable the redirect and serve both in parallel.
- [ ] Add SPF record to the sending domain: `v=spf1 include:amazonses.com include:_spf.resend.com -all` (exact include depends on the Resend account — copy from the Resend dashboard).
- [ ] Add DKIM CNAMEs shown in the Resend "Domains" page (3 CNAME records).
- [ ] Add DMARC record: `_dmarc` TXT `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@hakuna.pl`.
- [ ] Verify sending domain in Resend dashboard (status = Verified).
- [ ] Send a test email to a Gmail and a Outlook account; confirm no spam-folder hit + DKIM pass in the headers.

## Stripe

- [ ] Flip the Stripe dashboard from Test → Live.
- [ ] Confirm business details + bank account completed.
- [ ] Complete Stripe Connect platform review; ensure Express onboarding is enabled for Poland.
- [ ] Register webhook endpoint: `https://hakuna.pl/api/webhooks/stripe` for events `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel env (Production).
- [ ] Register Connect webhook endpoint (separate) for Connect events; copy to `STRIPE_CONNECT_WEBHOOK_SECRET`.
- [ ] Create Stripe Billing Product "Hakuna Partner Plus" with a monthly Price in PLN; copy price ID to `STRIPE_PRICE_PARTNER_PLUS`.
- [ ] Create "Hakuna Partner Pro" Product + monthly Price; copy to `STRIPE_PRICE_PARTNER_PRO`.
- [ ] Swap `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to the `sk_live_…` / `pk_live_…` pair in Vercel Production env.
- [ ] Enable Stripe Radar rules (default ruleset is fine for v1).

## Supabase

- [ ] Confirm production project is in `eu-central-1` (not `us-east-1`).
- [ ] Run `supabase db reset` against the production DB (fresh start; all 5 migrations apply).
- [ ] Spot-check RLS: in the SQL editor as the `anon` role, run `select count(*) from bookings;` — must return 0 rows for an unauthenticated session.
- [ ] Enable Point-in-Time Recovery (PITR) in the Supabase dashboard (Settings → Database → Backups).
- [ ] Confirm daily backup is scheduled.
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel Production env (server-only — do NOT add to a `NEXT_PUBLIC_*` var).
- [ ] Configure Google OAuth provider in Supabase Auth with callback `https://hakuna.pl/api/auth/callback`.
- [ ] Create the first admin user: sign up through the site, then run `update profiles set role='admin' where id='<user-uuid>';` in the SQL editor.

## Turnstile

- [ ] Create a Turnstile site in the Cloudflare dashboard for `hakuna.pl`.
- [ ] Copy site key to `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and secret to `TURNSTILE_SECRET_KEY` in Vercel Production env.
- [ ] Confirm the partner-apply form on production rejects submissions without a Turnstile token (test by opening DevTools, deleting the token, submitting).

## Upstash

- [ ] Provision an Upstash Redis database in an EU region.
- [ ] Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel Production env.
- [ ] Hit the partner-apply endpoint 6× in a minute from a single IP; confirm the 6th request is 429'd.

## Sentry

- [ ] Create a Sentry project `hakuna/hakuna-web` (org slug must match `next.config.ts`).
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` (browser DSN) and `SENTRY_DSN` (server/edge DSN — can be the same project) in Vercel Production env.
- [ ] Create a user auth token with `project:releases` + `project:write`; add as `SENTRY_AUTH_TOKEN` in Vercel Production env so sourcemaps upload on build.
- [ ] Configure alert rules: Slack webhook on new issues in production, email on error-rate spike (> 50 events / 5 min).
- [ ] Hit `/api/debug-sentry` with `x-debug-sentry: <CRON_SECRET>` from curl; confirm the thrown error appears in the Sentry issues list within 2 minutes.
- [ ] Confirm the release shows up in Sentry (tagged with the commit SHA) and sourcemaps are attached.

## First test booking (live mode smoke)

- [ ] With Stripe live keys in place, book a real session with a real personal card (low-value, e.g. 1 PLN test listing published then unpublished).
- [ ] Confirm the email arrives with the correct sender, subject line, and booking details.
- [ ] Confirm Stripe dashboard shows the charge with the correct `application_fee_amount`.
- [ ] Cancel the booking ≥48h out; confirm the refund processes and `application_fee` is refunded too.
- [ ] Remove the listing afterward.

## DPAs signed

- [ ] Supabase DPA countersigned (downloadable from their dashboard → Settings → Billing → DPA).
- [ ] Resend DPA countersigned.
- [ ] Stripe DSA/DPA (Stripe processes data as controller for some operations — confirm with counsel).
- [ ] Upstash DPA countersigned.
- [ ] Cloudflare DPA countersigned (for Turnstile).

## Legal

- [ ] Review `/pl/cookies` and `/en/cookies` content — confirm categories listed match what the cookie banner offers.
- [ ] Review `/pl/privacy` and `/en/privacy` — confirm it names Stripe (payments), Resend (email), Supabase (hosting/auth), Upstash (rate limit), Cloudflare (bot protection) as processors.
- [ ] Update the "last updated" date on both legal pages to the launch date.
- [ ] File with GIODO / UODO if required for the processing registry.

## CI

- [ ] Enable Playwright in the GitHub Actions workflow: `npm run test:e2e:install` once per runner, `npm run test:e2e` on every PR.
- [ ] Add `npm test` (vitest) as a required PR check.
- [ ] Add `npm run build` as a required PR check.
- [ ] Configure GitHub → Vercel preview deployments so the Playwright suite can run against a real preview URL.
- [ ] Confirm `.env.test` or repo secrets include the staging Turnstile site+secret (`1x00000000000000000000AA` always-passes pair) so e2e can actually submit forms.

## Code fixes that must land before this checklist (see AUDIT_FINDINGS.md for detail)

### P0 — must fix before any production traffic

- [ ] **Booking race**: replace optimistic CAS at `app/api/webhooks/stripe/route.ts:336–353` with the `increment_spots` SQL helper from migration 0008. Currently a concurrent legitimate booking is mis-classified as overbook + refunded.
- [ ] **Overbook apology email**: `app/api/webhooks/stripe/route.ts:382–392` only `console.info`s — implement a real `BookingOverbooked` email template + send.
- [ ] **Currency whitelist**: `app/[locale]/partner/(shell)/classes/actions.ts` accepts `EUR/GBP/USD` for activity currency. Lock to `PLN` until multi-currency is intentional, OR enforce that the partner's Stripe Connect account currency matches.
- [ ] **Verify `sb_secret_*` Supabase key works as service_role**: probe with an admin-client SELECT against `partners`. If it returns `permission denied`, swap to the legacy `service_role` JWT in `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **CSRF same-site → same-origin**: `src/lib/auth/csrf.ts:32` — drop the `"same-site"` accept clause to prevent sibling-subdomain CSRF.
- [ ] **`getSession` audit**: `grep -r "auth.getSession" app src` — every match must convert to `auth.getUser()` for authorization decisions.

### P1 — must fix before user-visible launch

- [ ] **Beta signup**: `app/components/BetaSignup.tsx` is a no-op form. Wire to a Server Action that persists to a `beta_signups` table + sends Resend confirmation.
- [ ] **Search filters button** (desktop + mobile): `app/[locale]/(marketing)/search/SearchClient.tsx:281` has no handler. Wire OR remove.
- [ ] **Search map**: pins are jittered Warsaw-center fakes. Add `lat, lng` to ACTIVITY_SELECT, render real coordinates.
- [ ] **Favorite/heart button**: visual-only `e.preventDefault()`. Either ship a `favorites` table + RLS + action OR remove the icon.
- [ ] **Activity `time` field**: empty string in the home/search rails. Compute next session start in `getClosestActivities` / `getFilteredActivities`.
- [ ] **Sitemap dynamic routes**: `app/sitemap.ts` only emits static + blog. Add per-locale URLs for every published activity + venue.
- [ ] **`/admin` in robots.ts disallow**: `app/robots.ts:8` only blocks `/partner`.
- [ ] **Rate-limit auth endpoints**: extend the existing Upstash limiter to `loginAction`, `signupAction`, `googleSignInAction`, `requestAccountDeletion`.
- [ ] **Rate-limit createBooking**: 5 per minute per user.
- [ ] **Rate-limit photo uploads**: 30 per hour per partner; bucket-quota check.
- [ ] **Cancel-booking refund vs status-update reconcile**: `bookingActions.ts:518–560` — retry the row update on failure, log to Sentry with bookingId + paymentIntentId.
- [ ] **Sentry-wrap silent email failures**: `app/api/webhooks/stripe/route.ts:498–500` and `bookingActions.ts:621–623` — minimum, capture the exception with tags.
- [ ] **POS error visibility on partner dashboard**: surface `pos_integrations.status` + `last_error` on `/partner/integrations`.
- [ ] **POS providers (5 of 6)**: hardcoded "Coming soon" cards. Either ship adapters OR hide behind a feature flag with "request access" CTA.
- [ ] **Account-deletion order**: cron should `auth.admin.deleteUser()` BEFORE anonymizing the profile, otherwise a deletion failure leaves orphaned PII.
- [ ] **Partner sidebar uses CURRENT_USER mock**: swap to `getCurrentUser()` profile in `(shell)/layout.tsx`.
- [ ] **TS errors in `tests/commission.spec.ts`**: hoist `overrides.partner` etc into named constants — currently blocks `tsc` as a CI required check.
- [ ] **Server-action unit tests**: every action added in Phase D has zero unit coverage. Add at least auth-check + ownership-check tests for `partner/(shell)/{settings,classes,venue,reviews}/actions.ts`.
- [ ] **Configure Supabase Auth → Resend SMTP**: signup confirmation + password reset emails currently go through Supabase default SMTP which lands in spam. Switch in Supabase dashboard, then test inbox arrival.

### P2 — hardening + polish

- [ ] **`webhook_events` admin SELECT policy**: cosmetic — admins should be able to read via the dashboard with their JWT, not just service-role bypass.
- [ ] **Curriculum + instructors DELETE policy**: migration 0011 only allows admin DELETE — verify partner members can also delete their own rows.
- [ ] **CSP frame-src**: tighten `https://js.stripe.com` to `https://checkout.stripe.com` for frames; keep `js.stripe.com` for script-src.
- [ ] **OAuth callback locale fallback**: route hardcodes `pl` when `next` missing. Carry the originating locale in the OAuth state parameter.
- [ ] **Stripe `STRIPE_CONNECT_WEBHOOK_SECRET` empty-string handling**: warn loudly if set-but-empty.
- [ ] **Mapbox token absence**: `MapboxMap.tsx` shows error modal — switch to silent hide + list-only fallback when token missing.
- [ ] **Image alt text**: hero/card images use `alt=""` — switch to descriptive alt for accessibility + SEO.
- [ ] **POS encryption key rotation playbook**: document the procedure for re-encrypting `pos_integrations.config_encrypted` blobs.
- [ ] **Sentry sourcemap upload required in production builds**: CI guard that fails the build when `SENTRY_AUTH_TOKEN` is missing in `vercel --prod`.
