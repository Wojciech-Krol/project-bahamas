# Pre-launch: backend wiring + security hardening + partner dashboard

Brings `main` from a static/mock prototype to a real Supabase + Stripe app with a partner dashboard, end-to-end booking flow, and the security/hardening fixes from the pre-launch audit. **Excludes** the in-progress hero landing-animation branches (`feat/hero-aurora-living-bar`, `feat/hero-orbiting-peeks`, `feat/hero-scroll-horizon`, `feat/hero-spotlight-tilt`, `feat/hero-juicy-motion-gsap`) — those stay on their own branches until the motion direction is locked.

55 commits, 197 files changed (~+40.7k / -5.0k LOC).

## High-level scope

| Area | What changed |
|------|--------------|
| Data layer | Supabase Postgres + RLS + typed query helpers + seed |
| Auth | Email/password + OAuth via Supabase, account confirmation flow, account deletion (GDPR) |
| Public site | Home / Search / Activity / School pages now read live data instead of mock JSON |
| Booking flow | "Book" button → Stripe Checkout → webhook → atomic seat decrement → receipt page → cancel button |
| Partner dashboard | Real auth, classes/bookings/reviews/instructors/venue/payouts/insights/settings/plans/promote, all wired to DB |
| Stripe Connect | Onboarding, account.updated handling, platform + Connect webhook secrets, commission split |
| POS framework | CSV import + encrypted POS config (hex-encoded for `bytea`) + sync cron |
| Analytics | Activity-view tracking, partner analytics views with RLS lockdown |
| Cron jobs | Booking expiry, account deletion, POS sync — registered in `vercel.json` |
| Security | CSP + Sentry hosts, CSRF on POSTs, rate limiting, Turnstile bot check, OAuth open-redirect close, RLS audit, upload size cap, timing-safe cron auth, SEO blocks for private routes |
| Robustness | Proxy survives Supabase outage, prod env preflight, graceful Stripe-missing paths, webhook idempotency (claim-or-skip), apology email on overbook race |
| Docs | Build plan, phase task cards, AUDIT_FINDINGS, LAUNCH_CHECKLIST, go-live runbook |

## Detailed changes

### 1. Database, auth & data layer

- `feat: phase 0 groundwork` — repo scaffolding for the build plan.
- `feat: phase 1a supabase + auth + rls` — Supabase project wiring, auth helpers, RLS baseline.
- `feat: phase 1b db query layer + seed (partial)` — typed query helpers + seed scripts.
- `fix(auth): handle email-confirmation flow + emailRedirectTo` — completes the signup → confirm-email → logged-in flow.
- `fix(auth): close OAuth callback open-redirect` — sanitises `next` param in `/api/auth/callback`.
- `fix(rls): lock down analytics views + projection for review authors` — analytics views were readable too widely; projects only public reviewer fields.
- `fix(gdpr): make bookings.user_id nullable + simplify deletion cron` — letting `user_id` go `NULL` on deletion preserves anonymised history without breaking FK.
- `fix(admin): no 500 when Supabase env missing` — admin route now returns a friendly error instead of crashing dev.

### 2. Public site goes from mock to live

- `feat(home): wire activities + reviews to Supabase`
- `feat(search): query Supabase activities with filters`
- `feat(activity): real id-driven page from Supabase`
- `feat(school): real id-driven page from Supabase`
- `feat(activity): real curriculum + instructors from Supabase`
- `chore(mock): drop unused i18nData hooks` — old mock composer hooks removed where the live route replaced them. Translatable copy still flows through `messages/{locale}.json`; only the data-shape stubs were dropped.

### 3. Booking flow (end-to-end)

- `feat(booking): wire Book buttons to createBooking + Stripe Checkout` — every "Book" CTA now calls a Server Action that creates a pending booking and redirects to Stripe Checkout.
- `feat(booking): receipt page at /bookings/[id]` — post-checkout landing page, also the cancellation entry point.
- `feat(booking): cancel button on receipt page`
- `fix(booking): atomic spots_taken decrement via SQL helper` — replaces a read-modify-write pattern with an `UPDATE … WHERE spots_taken < capacity` so concurrent buyers can't oversell.
- `fix(webhook): use increment_spots RPC to fix booking race` — same fix on the webhook side, via a stored procedure.
- `feat(webhook): real apology email on overbook race` — if the seat is gone by webhook time, refund + send the user an apology email (Resend).
- `fix(webhook): claim-or-skip idempotency` — webhook handler claims the event row in DB; duplicate Stripe deliveries are no-ops.
- `fix(webhook): support both platform + Connect signing secrets` — single endpoint verifies both `STRIPE_WEBHOOK_SECRET` and the Connect-app secret.
- `fix(plans): graceful Stripe-missing path on subscription checkout` — if Stripe env vars aren't set (dev without keys), surface a clear error rather than a 500.

### 4. Partner dashboard — wired to Supabase

All under `app/[locale]/partner/(shell)/`:

- `fix(partner-login): call Supabase auth instead of stub redirect`
- `feat(partner-classes): load from Supabase` + `feat(partner-classes): editor actions wired` — classes list + create/update/delete via Server Actions.
- `fix(partner-classes): lock currency to PLN` — UI was offering currency choice; spec says PLN-only at launch.
- `feat(partner-bookings): real bookings table`
- `feat(partner-reviews): real reviews + reply action`
- `feat(partner-instructors): list from Supabase`
- `feat(partner-venue): save changes to Supabase`
- `feat(partner-venue): hero + gallery photo upload` — uses Supabase Storage with size cap (see security fix below).
- `feat(partner-payouts): live Stripe payouts + DB net totals`
- `feat(partner-insights): deeper analytics view`
- `feat(partner-settings): edit partner profile`

Earlier infrastructure commits behind these:

- `feat: phase 2 partner dashboard mvp` — sidebar shell, route group, mock-data scaffolding (now backfilled with real data).
- `feat: phase 3a bookings + connect + commission core` — Stripe Connect onboarding, commission-split math.
- `feat: phase 3b subscriptions + boost` — partner plan tiers + paid promotion ("boost").
- `feat: phase 4 partner analytics` — analytics tables + views consumed by `/partner/insights`.
- `feat: phase 5a pos framework + csv` — POS abstraction layer + CSV import flow.
- `fix(pos): hex-encode encrypted config for bytea column` — POS config is encrypted at rest; `bytea` insert needed `\x` hex prefix.

### 5. Security & hardening

- `fix(security): CSP Sentry hosts + CSRF on POSTs + cron timing-safe + upload cap` —
  - CSP `connect-src` now includes Sentry ingest hosts.
  - All non-GET routes verify a CSRF token (origin/referer + token cookie pair).
  - Cron auth header check uses `crypto.timingSafeEqual` to defeat timing-leak comparisons.
  - File-upload routes enforce a max-byte cap before parsing.
- `fix(csrf): reject Sec-Fetch-Site: same-site` — only `same-origin` and (for whitelisted endpoints) `none` allowed; blocks subdomain/co-located CSRF vectors.
- `feat(ratelimit): cover auth + booking + uploads + deletion` — Upstash-backed sliding-window limits on login, signup, booking, photo upload, account-deletion request.
- `fix(env+turnstile): prod fail-closed bot check + relaxed Resend From validator` — Turnstile failures now block in prod (previously open-failed); From-address validation no longer rejected legitimate display-name formats.
- `fix(seo): block /admin /account /bookings from search indexing` — adds robots `Disallow` and `noindex` on private route layouts.
- `feat: phase 6 hardening + launch checklist` — consolidated hardening pass + initial `LAUNCH_CHECKLIST.md`.

### 6. Robustness, infra, ops

- `fix(proxy): don't take whole site down on Supabase auth outage` — proxy now degrades to "logged-out" when Supabase is unreachable instead of throwing 500.
- `fix(robustness): proxy cookie sync + prod env preflight + Connect account.updated` — fixes auth-cookie sync in `proxy.ts` (Next 16 middleware), preflight that fails the build if required prod env vars are missing, handles Stripe Connect `account.updated` to keep partner Stripe state in sync.
- `fix(react): eliminate cascading-render setState-in-effect bugs` — removes the patterns that triggered Next 16's stricter render warnings.
- `chore: register Vercel cron schedules` — `vercel.json` now declares `expire-bookings`, `process-account-deletions`, `pos-sync` crons.
- `fix(low-batch): hygiene cleanup from REVIEW_FINDINGS` — small follow-ups from the review pass (typing, dead code, error messages).

### 7. Docs

- `docs: add Hakuna build plan and phase task cards` — phase 0–6 plan that drove the rest of the work.
- `docs: add implementation status + go-live runbook`
- `docs: pre-launch audit findings + LAUNCH_CHECKLIST extension` — `AUDIT_FINDINGS.md` (223 lines) + extended `LAUNCH_CHECKLIST.md` covering remaining gates.
- `feat: implement partner dashboard shell and overview page with mock data and components` — earliest commit, kept here for completeness (mock UI later replaced by live data).

## What is intentionally NOT in this PR

- Hero landing animations: `feat/hero-aurora-living-bar`, `feat/hero-spotlight-tilt`, `feat/hero-orbiting-peeks`, `feat/hero-scroll-horizon`, `feat/hero-juicy-motion-gsap`. These stack on top of this branch; merging the chosen one is a separate PR once the motion direction is picked.

## Required environment / migrations before merging

- New env vars (set on Vercel preview + prod):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `RESEND_API_KEY`, `RESEND_FROM`
  - `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `CRON_SECRET`
  - `POS_CONFIG_ENCRYPTION_KEY`
  - `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
  - Existing: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_STYLE_URL`
- DB: run the SQL migrations in `supabase/migrations/` (RLS, RPC `increment_spots`, analytics views, deletion cron tables, `bookings.user_id` nullable).
- Stripe: register both webhook endpoints (platform + Connect) pointing at `/api/webhooks/stripe`.

See `LAUNCH_CHECKLIST.md` for the gated go-live order.

## Test plan

- [ ] `pnpm build` (or `npm run build`) succeeds on a clean clone with all env vars set.
- [ ] Public flow: home → search → activity → Book → Stripe Checkout → receipt page → cancel.
- [ ] Auth: signup → confirm email → login → logout → OAuth login. Account-deletion request schedules deletion and the cron processes it.
- [ ] Partner flow: login → classes CRUD → bookings list → reviews reply → instructors → venue edit + photo upload (≤ cap, > cap rejected) → payouts → insights → settings → plans → promote/boost.
- [ ] Stripe webhook: success path, idempotent replay, overbook race triggers refund + apology email.
- [ ] Proxy: site stays up when Supabase auth is unreachable (logged-out fallback).
- [ ] Security: CSRF blocked from cross-origin POST, rate limits trigger on rapid login attempts, `/admin /account /bookings` excluded from `robots.txt` and `noindex`'d.
- [ ] Cron: `expire-bookings`, `process-account-deletions`, `pos-sync` runnable via the Vercel cron UI with the cron secret.

## Risk notes

- This is a large merge; recommend deploying to a Vercel preview first and walking the test plan there before promoting to prod.
- After merge, rebase the open hero-animation branches onto `main`.
