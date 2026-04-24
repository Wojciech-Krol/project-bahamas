# Hakuna — Implementation Status & Go-Live Runbook

Snapshot after offline build-out of phases 0 through 6. Everything that does
not require a live third-party credential is in place. Paired with
`HAKUNA_BUILD_PLAN.md` (spec) and `LAUNCH_CHECKLIST.md` (launch-day human
tasks).

Generated 2026-04-24.

---

## 1. Where the code lives

Nine branches stacked on top of `wojtek/logo-navbar`. Each phase is a single
atomic commit you can review / merge independently.

```
main
  └─ wojtek/logo-navbar
       └─ phase/0-groundwork            chore: phase 0 groundwork
            └─ phase/1a-supabase        feat: phase 1a supabase + auth + rls
                 └─ phase/1b-queries    feat: phase 1b db query layer + seed (partial)
                      └─ phase/2-partner-dashboard
                                        feat: phase 2 partner dashboard mvp
                           └─ phase/3a-bookings-commission
                                        feat: phase 3a bookings + connect + commission core
                                └─ phase/3b-subs-boost
                                        feat: phase 3b subscriptions + boost
                                     └─ phase/4-analytics
                                        feat: phase 4 partner analytics
                                          └─ phase/5a-pos-framework-csv
                                        feat: phase 5a pos framework + csv
                                               └─ phase/6-hardening
                                        feat: phase 6 hardening + launch checklist
```

Nothing pushed to origin yet. `.agents` submodule untouched.

Merge order when you're ready: **0 → 1a → 1b → 2 → 3a → 3b → 4 → 5a → 6**,
each as its own PR. Rebase onto `main` at merge time if needed — no
cross-branch conflicts expected because each phase adds new files or
extends existing ones idempotently.

---

## 2. What shipped, by phase

### Phase 0 — groundwork  *(commit `e0dac7c`)*

- `app/[locale]/(marketing)/` route group. All public pages moved in; URLs
  unchanged. Plan said `app/(marketing)/` at root but every route lives
  under `[locale]/` because `localePrefix: "always"`. Adapted.
- Imports in moved files converted to `@/*` alias so route-group moves
  don't break relative paths.
- `src/env.ts` — Zod-validated env, server/client split. Throws on invalid
  typed vars; all Hakuna-specific keys are `.optional()` so pre-launch
  clones build.
- `.env.example` at repo root — complete key list grouped by phase.
- Scaffolding: `app/[locale]/(auth)/`, `app/[locale]/(dashboard)/`,
  `app/api/`, `src/lib/{db,email,payments,pos}/`,
  `supabase/{migrations,seed}/` (each with `.gitkeep`).
- README rewrite — Hakuna-specific stack, dev steps, structure, plan pointer.
- **NOT done** (plan diverged from Next 16 reality): proxy.ts → middleware.ts
  rename. Next 16 renamed `middleware` → `proxy`, so current `proxy.ts` is
  correct. Plan's rename would break the app. Documented in progress log.

Build green, 51 routes pre-phase-1, 57 post.

### Phase 1a — Supabase foundations  *(commit `c7f0f39`)*

- Migration `supabase/migrations/0001_initial.sql` (775 lines):
  - Extensions: `pgcrypto`.
  - Enums: `user_role`, `partner_status`, `session_status`, `pos_provider`.
  - Tables: `profiles`, `partners`, `partner_members`, `venues`,
    `activities`, `sessions`, `reviews`, `bookings`, `webhook_events`.
    Every mutable table gets `created_at` + `updated_at` + shared
    `set_updated_at` trigger.
  - Triggers: `auth.users` insert → `profiles` row via
    `handle_new_user` (SECURITY DEFINER).
  - Authorization helpers: `is_admin()` + `is_partner_member(partner_id)`,
    both SECURITY DEFINER.
  - RLS enabled on every table with explicit policies per plan spec
    (profiles select/update own, partners select approved + member
    access, public sees only published venues/activities, reviews
    require confirmed booking, bookings and webhook_events service-role
    only for writes).
  - Indexes per plan.
  - Storage buckets `venues` + `avatars` (public read, path-prefixed
    write policies on `storage.objects`).
  - Commented-out anon sanity SELECTs at bottom.
- SSR clients in `src/lib/db/`:
  - `server.ts` — request-scoped, async, official `getAll`/`setAll`
    cookie pattern with swallow comment explaining why RSC-write failures
    are harmless (proxy refreshes next request). Exports `getCurrentUser()`
    using `auth.getUser()` (revalidated) not `getSession()`.
  - `client.ts` — browser singleton.
  - `admin.ts` — service-role, runtime-guarded against `typeof window`.
- `proxy.ts` updated to chain: intl middleware first (owns response),
  Supabase `auth.getUser()` refreshes cookies onto same response. No-op
  when Supabase env missing so marketing site keeps building.
- Auth routes:
  - `app/[locale]/(auth)/login/` + `signup/` pages with client forms
    (useActionState + useFormStatus) + shared `actions.ts`
    (loginAction / signupAction / googleSignInAction).
  - `app/api/auth/callback/route.ts` — OAuth code exchange. Lives outside
    `[locale]/` so Supabase dashboard redirect-URL allowlist is stable.
  - `app/api/auth/logout/route.ts` — POST only (CSRF hygiene).
- SiteNavbar login/signup buttons wired via locale-aware `Link`.
- `Auth.*` + `Nav.logout` i18n both locales.

### Phase 1b — DB query layer (partial)  *(commit `b55da22`)*

- `src/lib/db/queries/{activities,venues,reviews,_i18n,index}.ts` +
  `src/lib/db/types.ts` (UI-contract types mirroring `app/lib/mockData.ts`).
- Functions: `getClosestActivities`, `getActivityById`,
  `getSearchResults`, `getFilteredActivities`, `getVenueById`,
  `getReviews`. Each handles "Supabase not configured" by returning
  `[]` / `null` with a `console.warn`.
- `supabase/seed/seed.ts` — idempotent TS script. Service-role. Stable
  FNV-derived UUIDs on mock IDs so re-runs don't duplicate. Creates seed
  reviewer auth users. Usage:
  `npx tsx supabase/seed/seed.ts`.
- **Deferred** (blocked on live DB): (a) rewriting pages to call these
  queries instead of `i18nData.ts` hooks, (b) removing `activities.*` /
  `reviews.*` from `messages/{pl,en}.json`. Those are destructive without
  a seeded DB.

### Phase 2 — Partner dashboard MVP  *(commit `ecd90e4`)*

- Deps installed: `@upstash/redis`, `@upstash/ratelimit`,
  `react-turnstile`, `resend`, `react-email`, `@react-email/components`.
- Email infra:
  - `src/lib/email/resend.ts` singleton + **stub fallback** (logs
    `[email stub]` when `RESEND_API_KEY` missing). TODO-OPERATOR SPF/DKIM/
    DMARC note at top.
  - React Email templates:
    `PartnerApplicationReceived`, `PartnerApproved`, `PartnerRejected`,
    `AdminNewApplication`. PL + EN. Brand tokens inline (`#b40f55`,
    `#fdf9f0`, `#1a1a1a`). `<Preview>` set for Gmail snippet.
- Rate limit + bot:
  - `src/lib/ratelimit.ts` — Upstash sliding-window.
    `partnerApplyRateLimiter` 5/h/IP. No-op when Upstash env absent.
  - `src/lib/turnstile.ts` — server siteverify with `AbortSignal.timeout
    (5000)`. No-op when secret absent.
  - `app/components/TurnstileWidget.tsx` — renders null when site key
    absent, calls `onVerify("")` once so server-side pass-through works.
- `/partners/apply`:
  - Server page + client form + Server Action. Zod schema, rate-limit
    check, Turnstile verify, slug-with-collision-suffix, admin-client
    insert of `partners` row (pending), two emails sent (applicant +
    admin). Bracket for `expected_monthly_bookings` passed to admin
    email only — no DB column. Full `PartnerApply.*` i18n.
  - Added to sitemap with hreflang.
- `/admin`:
  - `app/[locale]/(dashboard)/layout.tsx` — guards with `notFound()` if
    `profile.role !== 'admin'`.
  - `app/[locale]/(dashboard)/admin/page.tsx` — pending partners list.
  - `admin/actions.ts`:
    - `approvePartner`: re-checks admin, service-role status flip with
      `.eq('status','pending')` double-approve guard. If applicant email
      matches an existing auth user, upserts `partner_members` row.
      Otherwise calls `admin.auth.admin.generateLink({ type:
      'magiclink' })` and passes link into approval email.
    - `rejectPartner`: optional `reason` (500 char cap), templated email.
  - `Admin.*` i18n.
- Existing `app/[locale]/partner/(shell)/layout.tsx` wrapped with auth
  guard: no-op when Supabase env absent (mock demo path stays open);
  gates on signed-in + `partner_members` row (or admin) otherwise.
- **Deferred in Phase 2**:
  - Full venue/activity/session CRUD rewrite under
    `app/[locale]/(dashboard)/partner/` — pointless without live DB.
    Existing mock at `app/[locale]/partner/(shell)/` stays as design reference.
  - SiteNavbar "Dashboard" link for authed partners/admins. Needs a
    server wrapper refactor. Cosmetic.

### Phase 3a — Bookings + commission core  *(commit `587269a`)*

- Deps: `stripe`, `@stripe/stripe-js`, `vitest`, `@vitest/ui`.
- Migration `0002_bookings.sql`:
  - `partners.stripe_account_id` unique.
  - `listing_boosts` with XOR constraint
    `check ((activity_id is null) <> (venue_id is null))`.
  - `customer_partner_attribution` — PK `(user_id, partner_id)`,
    immutable (no updated_at, service-role write). `first_booking_id`
    FK with `on delete set null` (preserves history).
  - `bookings.boost_id`.
  - View `venue_rankings` (has_active_boost, has_subscription, rating,
    created_at) for Phase 3.4 search ORDER BY.
  - Public SELECT on listing_boosts only for rows active-right-now.
- `src/lib/payments/commission.ts` — pure fn:
  - Constants: `BOOST_COMMISSION_TARGET_BPS = 3500`,
    `BOOST_COMMISSION_RACK_BPS = 4000`,
    `BASE_COMMISSION_DEFAULT_BPS = 2000`.
  - `computeCommission(input)` → `{ commissionBps, commissionCents,
    isBoostFirstBooking, boostCommissionBps, reason }`.
  - `Math.floor` rounding (Stripe integer minor units; rounds down in
    partner's favour; documented).
  - Reasons: `returning-customer-base|subscription`,
    `new-customer-base|base-subscription|boost`.
- `tests/commission.spec.ts` — **12 Vitest cases**, all four plan
  Done-criteria scenarios plus subscription + rounding edges. 12/12
  green. `vitest.config.ts` + `npm test` + `npm run test:watch`.
- `src/lib/payments/stripe.ts` — server singleton, `apiVersion`
  `2026-04-22.dahlia` (matches installed SDK v22.1.0).
- `src/lib/payments/stripeConnect.ts`: `createExpressAccount`,
  `createAccountLink`, `getAccountStatus`.
- `app/[locale]/partner/(shell)/payments/` page + actions. Five-state
  machine (supabase-missing / stripe-missing / none / incomplete /
  connected). "Connect Stripe" / "Resume onboarding" / "Refresh status"
  CTAs. Sidebar entry "Payments". `Partner.stripe.*` i18n.
- `src/lib/payments/bookingActions.ts`:
  - `createBooking(sessionId)`: joins session → activity → venue →
    partner, verifies stripe_account_id + spots + schedule, looks up
    attribution + active boost, calls `computeCommission`, inserts
    booking via admin client (client-side insert forbidden by spec),
    creates Stripe Checkout with `application_fee_amount` +
    `transfer_data.destination`, `locale` + `payment_method_types:
    ['card','blik','p24']`. Rollback to `status='expired'` on error.
  - `cancelBooking(bookingId)`: 48h window check, `stripe.refunds.create
    ({ refund_application_fee: true })` (mandatory flag,
    commented), spots decrement, emails.
- `app/api/webhooks/stripe/route.ts`:
  - Raw-body `constructEvent` signature verification.
  - Idempotency via `webhook_events(provider, external_id)` unique +
    `processed_at` read-back.
  - `checkout.session.completed`: atomic capacity guard (optimistic
    `.eq(spots_taken, x).lt(spots_taken, capacity)`), overbook refund
    path with `refund_application_fee: true`, attribution upsert ON
    first-confirmed-booking (not on booking creation — avoids stale
    attribution on abandoned carts).
  - `payment_intent.payment_failed` / `checkout.session.expired` →
    booking `status='expired'`.
- `app/api/cron/expire-bookings/route.ts` — Bearer `CRON_SECRET`,
  30-minute stale cutoff.
- Emails: `BookingConfirmation`, `BookingCancelled` (audience prop
  user vs. partner).

### Phase 3b — Subscriptions + Boost  *(commit `31bb374`)*

- `src/lib/payments/subscriptionTiers.ts`: `partner-plus-monthly`
  (1500 bps / 149 PLN) + `partner-pro-monthly` (1200 bps / 299 PLN).
  `stripePriceId` pulled from `env.STRIPE_PRICE_PARTNER_PLUS` +
  `STRIPE_PRICE_PARTNER_PRO` (both `.optional()`). `findTierByPriceId`
  + `findTierByKey`.
- `/partner/plans` page + `startSubscriptionCheckout` action.
  Stripe Checkout `mode='subscription'` with
  `subscription_data.metadata.{ partner_id, tier_key }`. Redirects to
  `/partner/payments` if partner has no `stripe_account_id`.
- Webhook extended:
  - `customer.subscription.{created,updated}` →
    `partners.subscription_tier = tier.key`,
    `subscription_commission_bps = tier.commissionBps`. Partner
    resolved via metadata first, `customer.email` fallback.
  - Canceled / unpaid / past_due / deleted → reset to `'none'` + null.
  - Unknown price on active sub: log + no mutate.
- `/partner/promote`:
  - Lists activities + venues + (if >1 venue) "Promote all venues".
  - Pricing: 7 days 49 PLN / 14 days 89 PLN / 30 days 169 PLN. Hardcoded
    in `pricing.ts`. Native `<details>` modal, zero-JS.
  - `promoteBoost` action: inserts pending `listing_boosts` row(s)
    (venueAll = one row per venue per XOR constraint), Stripe Checkout
    `mode='payment'` **no `transfer_data`** (Hakuna keeps 100% of boost
    revenue). Metadata boost_id or boost_ids (comma-joined, 450-char
    cap safety margin).
- Webhook boost branch: flips pending → active, sets starts_at + ends_at
  + stripe_payment_id. `status='pending'` WHERE guard protects against
  double-activation.
- Search ranking: `src/lib/db/queries/activities.ts` now sorts by
  `venue_rankings` view via two-query pattern (PostgREST can't embed
  the view without an FK). Stable in-memory sort:
  `has_active_boost desc, has_subscription desc, rating desc,
  created_at desc`. Falls back to natural order if view missing.
- Sidebar Plans + Promote. `Partner.plans.*` + `Partner.promote.*` i18n.

### Phase 4 — Partner analytics  *(commit `e90c19a`)*

- Deps: `recharts`.
- Migration `0003_analytics.sql`:
  - `view_events` — activity_id, session_id?, anonymous_id, user_id?,
    referrer?, created_at. RLS: service-role insert only, partner
    members + admin select.
  - Views: `partner_daily_revenue` (gross/commission/net_partner per
    partner per day), `activity_conversion` (views + bookings + rate),
    `session_occupancy` (spots_taken / capacity, skip capacity=0).
  - Grants to `authenticated`, underlying RLS governs rows.
- Tracker: `src/lib/analytics/tracking.ts`
  (`ANON_COOKIE_NAME = 'hakuna_anon_id'`, 2-year first-party cookie,
  `crypto.randomUUID()`). `app/components/analytics/useTrackView.ts`
  uses `navigator.sendBeacon` with fetch+keepalive fallback. UUID guard
  — mock IDs like `a5` don't fire.
- `/api/events/view` — POST, Zod body, dedicated 120 req/min/anon
  rate-limiter, admin-client insert. 204 / 400 / 429 / 503. No
  request-level PII logs.
- Partner overview rewrite: Server Component queries the three views.
  30/90/YTD revenue, last-30-day daily trend, top 5 activities by
  confirmed revenue, 7×24 occupancy heatmap over 60-day window.
  `OverviewMock.tsx` preserved as Supabase-missing fallback path.
- Components: `RevenueCards`, `BookingsTrendChart` (recharts AreaChart,
  fixed 260px height to avoid zero-height glitch), `TopActivitiesList`,
  `OccupancyHeatmap` (pure CSS grid, no recharts — half the bundle).
- `Partner.analytics.*` i18n.
- **Consent-gated** via phase-6 work: view tracker checks
  `hasAnalyticsConsent()` before firing.

### Phase 5a — POS framework + CSV  *(commit `7e082c3`)*

- Migration `0004_pos_integrations.sql`:
  - `pos_integrations` (id, partner_id, provider pos_provider enum,
    `config_encrypted bytea`, status check, last_synced_at, last_error,
    consecutive_failures, unique(partner_id, provider)).
  - RLS: partner member or admin for all CRUD. Service role governs
    writes from the sync cron.
  - Storage bucket `pos-uploads` (private, path `{partner_id}/...`).
- `src/lib/pos/crypto.ts` — aes-256-gcm. Layout `[IV 12][tag 16]
  [ciphertext]`. Reads `env.POS_CONFIG_ENCRYPTION_KEY` (optional). GCM
  auth tag detects tamper. Tolerates Buffer / Uint8Array / `\x`-hex
  strings for Supabase bytea variance.
- `src/lib/pos/adapter.ts` — `POSAdapter` interface,
  `ExternalSession` / `BookingExport` / `POSAdapterError`. `getAdapter`
  registry — only `csv` resolves today. Other providers return null
  with `// TODO phase-5b…5e` comments.
- `src/lib/pos/adapters/csv.ts` — downloads
  `pos-uploads/{partner_id}/latest.csv`, parses with inline pure-TS
  state-machine parser (handles quoted commas, doubled quotes, CRLF,
  bare CR, BOM, missing final newline). Maps `activity_name` via
  `config.activityMap`.
- `/api/cron/pos-sync` — Bearer `CRON_SECRET`, iterates active
  integrations, upserts sessions on `(activity_id, pos_external_id)`.
  Resets `consecutive_failures` on success. ≥3 failures → flips
  `status='error'` and fires `PosSyncFailure` admin email (fire-and-
  forget). 503 if crypto key missing.
- Integrations UI: `/partner/integrations` page +
  `CsvIntegrationCard.tsx` + `actions.ts`. Two-step flow:
  1. `uploadCsv`: validates MIME/ext/header, stores to
     `pos-uploads/{partner_id}/latest.csv`, diffs distinct
     `activity_name` values against partner's `title_i18n`, returns
     `needsResolution: string[]`.
  2. `confirmActivityMap`: server reverse-checks that every mapped
     activity uuid belongs to the requesting partner, encrypts config,
     upserts `pos_integrations`.
  - `disconnectCsv` via admin delete.
  - Other providers: disabled "Coming soon" pills.
- Sidebar Integrations. `Partner.integrations.*` + `Partner.nav.integrations`
  i18n.
- Tests added: `tests/csvParser.spec.ts` (10 — quoted commas, CRLF,
  BOM, multi-line quoted, tamper, etc.), `tests/posCrypto.spec.ts`
  (2 — GCM round-trip + tamper detection). Total 24/24.
- **Deferred**: adapters for ActiveNow, WodGuru, eFitness, LangLion —
  plan says escalate to operator; scraping explicitly forbidden.

### Phase 6 — Production hardening  *(commit `4fa9944`)*

- Sentry:
  - `sentry.{client,server,edge}.config.ts` + `instrumentation.ts`.
    Each config bails out when DSN missing. Read
    `VERCEL_GIT_COMMIT_SHA` for release tagging.
  - `next.config.ts` wraps with `withSentryConfig` only when
    `SENTRY_AUTH_TOKEN` is set (so local builds stay green without
    sourcemap upload).
  - `/api/debug-sentry` — throws on GET. Open in dev, header-guarded
    (`x-debug-sentry: CRON_SECRET`) in prod.
- CSP + security headers in `next.config.ts` `headers()`:
  - CSP allowlists exactly the origins we use: Supabase (http+wss),
    Stripe, Mapbox, Resend, Upstash, Cloudflare Turnstile.
  - `frame-ancestors 'none'`, `X-Frame-Options: DENY`, HSTS (prod
    only), Referrer-Policy, X-Content-Type-Options, Permissions-Policy.
- Cookie consent:
  - `app/components/CookieConsent.tsx` — Accept / Reject / Customize
    banner. Link to `/cookies`. Stores `hakuna_consent` first-party
    cookie (6 months).
  - `src/lib/consent.ts` (universal) + `consent.server.ts` (server-only
    with `cookies()`). Split because Turbopack rejects `next/headers`
    in client bundles.
  - `useTrackView` gates on `hasAnalyticsConsent()`.
  - `Consent.*` i18n.
- GDPR:
  - Migration `0005_account_deletion.sql` — adds
    `profiles.deletion_requested_at`, table
    `account_deletion_queue (user_id pk, requested_at, hard_delete_at)`.
  - `/account` page + actions: export (→ `/api/account/export` returns
    JSON attachment — Server Actions can't return `Response`, so an
    actual Route Handler), request deletion (inserts queue row at
    `now() + 30 days`).
  - `/api/cron/process-account-deletions` — Bearer `CRON_SECRET`,
    anonymizes profile, strips `user_id` from bookings (preserves
    financial record), deletes auth row.
  - `Account.*` i18n.
- `/api/health` — `{ ok, checks: { db, stripe, resend, version } }`.
  200 when all ok, 503 otherwise.
- Playwright scaffold:
  - `playwright.config.ts`, webServer on port 3333.
  - `tests/e2e/smoke.spec.ts` — green, asserts `data-testid=site-navbar`.
  - `tests/e2e/partner-apply.spec.ts` + `booking-cancel.spec.ts` —
    `.skip()` with env TODO comments (need live Supabase + Stripe).
  - Scripts `npm run test:e2e` + `test:e2e:install`. Vitest excludes
    `tests/e2e/**`.
- DPA reminders: `TODO-OPERATOR: sign DPA with <vendor>` banners at top
  of `src/lib/db/server.ts`, `ratelimit.ts`, `email/resend.ts`,
  `payments/stripe.ts`.
- `LAUNCH_CHECKLIST.md` — concrete actions for DNS, Stripe live mode,
  Supabase region / backup / PITR, Turnstile, Upstash, Sentry, first
  real booking smoke, DPAs, legal, CI gate.

---

## 3. What's blocked on you (operator)

### 3.1 Must-have before anything runs end-to-end

Everything below is already wired in code; you just supply credentials +
flip the switch.

| # | System | Action | Effect unblocks |
|---|--------|--------|-----------------|
| 1 | Supabase | Create project in `eu-central-1`. Apply migrations `0001..0005` via `supabase db reset` or paste each into Studio SQL editor in order. Run `npx tsx supabase/seed/seed.ts`. | Everything DB-backed (auth, partner CRUD, analytics, bookings, cron). |
| 2 | Supabase | Enable Google OAuth provider. Set redirect URL to `<site>/api/auth/callback`. | Google sign-in on `/login` and `/signup`. |
| 3 | Resend | Create account. Verify sending domain + configure SPF / DKIM / DMARC records (plan calls this out). | Transactional emails (applicant, admin, approval, rejection, booking confirm/cancel, POS sync alerts). |
| 4 | Stripe | Create account. Enable **Connect** with **Express** accounts (not Standard / Custom). Create webhook endpoint at `<site>/api/webhooks/stripe` subscribed to `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy signing secret. | Real payments, subscriptions, boost purchases, commission flows, webhook idempotency. |
| 5 | Stripe Billing | Create Product "Hakuna Partner Plus". Create monthly Prices for `partner-plus-monthly` (~149 PLN) and `partner-pro-monthly` (~299 PLN). Copy both Price IDs into `STRIPE_PRICE_PARTNER_PLUS` + `STRIPE_PRICE_PARTNER_PRO`. | The `/partner/plans` upgrade flow actually charges. |
| 6 | Upstash Redis | Create project close to Vercel region. Copy REST URL + token. | Rate limit on `/partners/apply` (5/h/IP) and `/api/events/view` (120/min/anon) actually enforced. No-op falls back silently otherwise — **fine pre-launch, not fine in prod**. |
| 7 | Cloudflare Turnstile | Create site key + secret. Allow `<site>`. | Bot protection on `/partners/apply`. |
| 8 | Sentry | Create project. Copy DSN. Create an auth token scoped to sourcemap upload. | Error tracking + release tagging via git SHA. |
| 9 | Vercel | Set all env vars from `.env.example`. Configure Cron Jobs pointing at: `/api/cron/expire-bookings` every 10 min, `/api/cron/pos-sync` every 15 min, `/api/cron/process-account-deletions` daily. Each carries header `Authorization: Bearer ${CRON_SECRET}`. | Booking expiry, POS CSV sync, GDPR deletion queue process. |

### 3.2 Generate cryptographic secrets

```
# Cron secret — any long random string
CRON_SECRET=$(openssl rand -base64 48)

# POS config encryption key — must be base64-encoded 32 bytes exactly
POS_CONFIG_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

Store both in `.env.local` (dev) and Vercel (prod). Rotate the POS key is
a manual one-off job — see the header of `src/lib/pos/crypto.ts`.

### 3.3 Post-credentials verification

After env filled in:

```bash
# Migrations applied + seed ran
npm run dev                # marketing renders live data
npm test                   # 24/24 still green
npx playwright install --with-deps chromium
npm run test:e2e           # smoke test green
```

Supabase Studio checks (paste-into-SQL-editor, run as anon):

```sql
select count(*) from bookings;                         -- 0 (RLS blocks)
select * from venues where is_published = false;       -- 0 rows
select * from listing_boosts where status='expired';   -- 0 rows for anon
```

Stripe checks: create a test partner, hit Connect onboarding end-to-end,
book a test session with card `4242 4242 4242 4242`. Partner's Stripe
dashboard should show transfer minus application_fee. Cancel ≥48h out →
refund processes and application_fee also refunds.

---

## 4. How to finish Phase 1b + Phase 2 CRUD

### 4.1 Page-swap (last piece of Phase 1b)

After seed runs:

1. Convert client components that use `useActivitiesByIds`,
   `useClosestActivities`, `useSearchResults`, `useFilteredActivities`,
   `useReviews` into Server Components (or move the DB fetch into a
   parent RSC and pass props down).
2. Point imports at `@/src/lib/db/queries` instead of
   `@/app/lib/i18nData`.
3. Delete `activities.*` and `reviews.*` keys from `messages/pl.json`
   + `messages/en.json`.
4. Delete `app/lib/i18nData.ts` + the mock constants in
   `app/lib/mockData.ts` that are now DB-sourced (keep type re-exports
   or retire via `src/lib/db/types.ts`).

Pages to audit: home (`page.tsx`), `search/page.tsx`,
`activity/[id]/page.tsx`, `school/[id]/page.tsx`, plus any component
that imports from `i18nData`.

### 4.2 Partner dashboard CRUD (last piece of Phase 2)

Currently `app/[locale]/partner/(shell)/` renders from
`app/lib/partnerMockData.ts` — a design reference. The production
dashboard per plan lives at `app/[locale]/(dashboard)/partner/` with
real auth + real DB.

Work when DB is live:

- `(dashboard)/partner/layout.tsx` — same partner_members guard as the
  existing (shell) layout.
- `venues/page.tsx` + `venues/[id]/edit/page.tsx` — list + form. PL+EN
  tabs on title/description. Map picker reuses mapbox-gl. Hero +
  gallery uploads to `venues` bucket at path
  `{partner_id}/{venue_id}/...`.
- `activities/page.tsx` + `[id]/edit/page.tsx` — similar split. Price
  + duration + level + category. Publish toggle.
- `schedule/page.tsx` — session list + bulk create (pick activity,
  repeat rule, capacity). Shows `pos_provider` badge per session.
- Server Actions for each CRUD operation; Zod validation; revalidatePath
  on mutate.

Migration may be needed if the schema drifted — always add a new
migration, never edit past ones.

---

## 5. Phase 5b–5e: POS adapters (blocked on operator)

Plan explicitly says escalate to operator if API access not secured.
Scraping is forbidden. For each provider you must:

1. Contact their developer relations.
2. Secure sandbox credentials + documented API.
3. Fill out a card like the ActiveNow card in `plan_akcji/PHASE_TASKS.md`.

Then implementation is mechanical: follow the pattern in
`src/lib/pos/adapters/csv.ts`, add a row to `getAdapter()` in
`src/lib/pos/adapter.ts`, add a connect form card to
`/partner/integrations` alongside the CSV card.

---

## 6. Risk map

| Risk | Where | Mitigation in place |
|------|-------|---------------------|
| Commission math drift | `src/lib/payments/commission.ts` | Pure fn, 12 Vitest tests cover all four plan Done-criteria scenarios. Rounding documented. Constants from plan's "single source of truth". |
| Double-charge on boost | `createBooking` + webhook | `computeCommission` only applies Boost rate when `customer.attribution === null`. Attribution written on `checkout.session.completed` (not earlier) so abandoned carts don't falsely mark a user as returning. |
| Over-booking race | Webhook | Atomic optimistic-concurrency UPDATE + overbook refund path with `refund_application_fee: true`. `webhook_events (provider, external_id)` uniqueness + `processed_at` read-back prevents double-delivery. |
| Refund retains commission | `cancelBooking` | Explicit `refund_application_fee: true` with inline comment citing plan. |
| RLS drift | Every migration | RLS enabled in the **same migration** that creates each table, policies in same file. `bookings` + `webhook_events` have no write policies — service role only. |
| Env leaks to client | `src/env.ts` + clients | Server/client Zod schemas split. Admin client has `typeof window !== 'undefined'` runtime guard. CSP + `frame-ancestors 'none'`. |
| CSP breaks an integration | `next.config.ts` | Allowlist enumerates every vendor we use. Open DevTools console on `/pl`, `/pl/search`, `/pl/partners/apply`, `/pl/partner` — zero violations expected. |
| Webhook replay | `/api/webhooks/stripe` | `webhook_events` unique `(provider, external_id)` + `processed_at` timestamp. Replaying Stripe event is a no-op. |
| POS config leak | `pos_integrations.config_encrypted` | aes-256-gcm. Key rotation procedure documented. GCM auth tag catches tamper. |
| GDPR export/delete correctness | `/account` | Export is JSON attachment Route Handler (session-scoped). Delete is soft → 30-day hard via cron. Bookings preserved with `user_id` nulled. |
| First-load analytics fires without consent | `useTrackView` | Gated by `hasAnalyticsConsent()` — banner on first visit, cookie respected thereafter. |

---

## 7. Build + test matrix

At the tip of `phase/6-hardening`:

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | 71/71 routes green |
| Unit tests | `npm test` | 24/24 green (commission 12 + csvParser 10 + posCrypto 2) |
| Lint | `npm run lint` | 5 pre-existing errors in `search/HeroSearchBar.tsx`, `search/MobileSearch.tsx`, `MobileActivityCarousel.tsx`. Untouched per CLAUDE.md "Don't fix errors in files you didn't edit." |
| E2E smoke | `npm run test:e2e` | 1 passing (smoke). 2 `.skip()`-ed pending live env. |

---

## 8. Go-live sequence

Phase-by-phase merge + enable. At any point, environment without credentials
degrades to "marketing site + mock demo" — safe.

1. **PR phase/0 → main.** Ship route group + env + README. No user
   impact.
2. **PR phase/1a → main.** Provision Supabase, apply 0001, set env keys.
   Auth routes go live. Migrating messages still in place as mocks —
   site behaviour unchanged.
3. **PR phase/1b → main.** Run seed. Verify anon SELECTs. Then do the
   page-swap work from §4.1 as a follow-up PR once you've manually
   smoke-tested DB reads.
4. **PR phase/2 → main.** Provision Resend + Upstash + Turnstile.
   `/partners/apply` and `/admin` live. Approve one real partner.
5. **PR phase/3a → main.** Provision Stripe Connect. Register webhook.
   First test booking. Verify commission math in DB.
6. **PR phase/3b → main.** Provision Stripe Billing prices. First test
   subscription. First test boost purchase.
7. **PR phase/4 → main.** Apply 0003. Partner sees live analytics.
   Consent banner active.
8. **PR phase/5a → main.** Apply 0004. Generate
   `POS_CONFIG_ENCRYPTION_KEY`. Upload a real CSV, resolve mappings,
   verify cron sync.
9. **PR phase/6 → main.** Apply 0005. Sentry live. CSP verified on every
   route. Playwright in CI gate. Walk `LAUNCH_CHECKLIST.md`.
10. **Flip live mode on Stripe.** Real PLN test booking. Partner payout
    arrives. You're shipping.

---

## 9. Conventions worth preserving

- Every new table → its RLS in the same migration. No exceptions.
- Migrations are append-only. Never edit `0001..0005`. Add `0006_*.sql`.
- Commission changes must update both `commission.ts` + plan's
  "Commission spec — single source of truth" block. Tests catch drift.
- Server Actions for user-originated mutations. Route Handlers for
  webhooks and external cron. Don't mix.
- Admin client only from webhook / cron / trusted server paths. Never
  reach for it just because RLS is inconvenient — fix the policy.
- Marketing copy in `messages/{pl,en}.json`. Domain data in `*_i18n
  jsonb` DB columns. Never mix.
- Types re-export through `src/lib/db/types.ts` (UI-contract shape).
  UI components stay stable across the mock → DB swap.
- i18n: Polish is authoritative. Always both locales, no half-translated
  features.

---

## 10. Quick cheat-sheet

```
# Dev
npm install
cp .env.example .env.local     # fill keys per §3.1
npm run dev                    # http://localhost:3000/pl

# Verify
npm run build                  # 71/71
npm test                       # 24/24
npm run test:e2e               # smoke green

# DB
supabase db reset              # or paste migrations into Studio
npx tsx supabase/seed/seed.ts

# Crypto
openssl rand -base64 32        # POS_CONFIG_ENCRYPTION_KEY
openssl rand -base64 48        # CRON_SECRET

# Branches
git log --oneline main..phase/6-hardening    # every phase commit
```
