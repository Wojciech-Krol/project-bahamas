# Hakuna — Build Plan for Claude Code

You are implementing the transformation of Hakuna from a static Next.js
marketing site into a booking marketplace (Booking.com-style). Read this entire
document before starting. Work phase by phase. **Never skip to a later phase
before the current phase's Done criteria pass.**

## Project context

**Current state (as of this plan):**
- Next.js 16.2.1 App Router, React 19, TypeScript, Tailwind 4, next-intl
  (pl/en), mapbox-gl. Deps in `package.json` are frontend-only.
- Routes live under `app/[locale]/` with pages for home, `/search`,
  `/activity/[id]`, `/school/[id]`, `/about`, and legal.
- Data is mocked in `app/lib/mockData.ts` with a "DB seam" comment marking
  exactly where to swap for DB queries. Locale strings are in
  `messages/{pl,en}.json` including `activities.*` and `reviews.*` bags.
- `app/lib/i18nData.ts` composes base data + locale copy into `Activity` /
  `Review` shapes via `useActivitiesByIds`, `useSearchResults`, `useReviews`.
- Middleware is in `proxy.ts` (rename to `middleware.ts` in Phase 0). Matcher
  already excludes `/api`, `_next`, `_vercel`, and static files — good.
- No backend. No auth. No DB. No payments. The business-signup form
  (`BetaSignup variant="business"`) is a fake — it sets local success state
  and never POSTs anywhere.

**Target:**
Marketplace where users discover and book classes at partner venues (dance
studios, language schools, yoga, padel, etc.). Hakuna takes a commission.
Partners have a dashboard with analytics. Partners can optionally pay for
listing boosts (Booksy-style) and subscriptions. Hakuna integrates with Polish
POS systems (ActiveNow, WodGuru, eFitness, LangLion) so partners don't have
to double-enter their schedules.

**Commission model (spec from founder, implement exactly):**
- Default commission: **15% target, 20% rack rate** on every booking. Store
  `commission_rate_bps` on the partner row (so `1500` = 15%, `2000` = 20%)
  with a system default of `2000` that can be overridden per partner during
  onboarding.
- Subscription tier: partners on a monthly subscription pay a reduced
  commission. Specific reduced rate is configured per subscription tier (not
  hardcoded).
- **Boost (Booksy-style, separate from base commission):**
  - Boost is an **opt-in, toggleable** promotion service per activity or
    venue.
  - When a booking comes from a **new customer attributed to Boost**, Hakuna
    takes a **one-time Boost commission** of **35% target / 40% rack rate**
    on that first booking price. The normal 15% commission does **not** also
    apply to that first booking — Boost replaces it.
  - **Subsequent bookings by the same customer** at the same partner are
    **free of Boost commission** — they revert to the base commission model.
  - Attribution rule: a customer is "Boost-attributed" if their *first ever
    booking at that partner* happened on a session/activity that had Boost
    active at the time of booking. Attribution is per (customer, partner)
    pair and is permanent once set.
  - Store `is_boost_first_booking` and `boost_commission_bps` on the booking
    row for audit and reporting.

**Stack decisions (locked in — do not deviate without asking):**
- DB + auth + storage: **Supabase** (Postgres, RLS from day one).
- Transactional email: **Resend** with React Email templates.
- Payments: **Stripe Connect (Express)** + Stripe Billing for subscriptions
  and boost charges.
- Rate limiting: **Upstash Redis** + `@upstash/ratelimit`.
- Error tracking: **Sentry** (add in Phase 6, but install SDK early with
  minimal config).
- Bot protection: **Cloudflare Turnstile** on public forms.
- Validation: **Zod** everywhere inputs cross a trust boundary.
- Charts (partner analytics): **recharts**.
- Hosting: Vercel (assumed; do not hardcode anything that would break on
  other hosts).

## Working agreement

1. **Read this whole document first, then re-read the phase you are on before
   every session.**
2. Work **one phase at a time**. At the end of each phase, run the phase's
   "Done criteria" checklist and write a short progress note at the bottom of
   this file under `## Progress log`.
3. **Migrations are permanent.** Every schema change goes through
   `supabase/migrations/<timestamp>_<name>.sql`. Never edit a past migration;
   add a new one.
4. **RLS is non-negotiable.** Every new table gets RLS enabled *in the same
   migration that creates it*, with explicit policies. No table ships with
   RLS off.
5. **Secrets never hit the repo.** `.env.local` for local dev, `.env.example`
   (committed, empty values) documents what's needed. Supabase service role
   key is *server only* — never imported into a client component.
6. **Server Actions for mutations, Route Handlers for webhooks and
   external-system endpoints.** Don't mix.
7. **Keep the seam.** The existing `Activity`, `Review`, `School` types in
   `app/lib/mockData.ts` are the UI contract. When swapping to DB, return the
   same shape. Refactor the type location later if needed, but don't break
   the UI during the swap.
8. **Commit at every green step.** Small PRs, clear messages. If in auto
   mode, commit after each "Done criteria" passes.
9. **When a decision isn't specified here, ask — do not invent.** Things like
   "what should the approved-partner email say" or "what's the rate limit
   window" need sign-off, not guessing.

## Phase 0 — Groundwork (no backend yet)

**Goal:** clean the repo so backend work doesn't pile on top of small
inconsistencies.

### Tasks

1. **Rename middleware.** Move `proxy.ts` to `middleware.ts` at the repo
   root. Verify dev server still serves locale routing.
2. **Install foundational deps** (no backend yet, just what Phase 1+ will
   need everywhere):
   ```
   npm i zod
   npm i -D @types/node
   ```
3. **Create `src/env.ts`** — runtime env validation with Zod. Export typed
   `env` object. Throw on missing required vars. Start with an empty schema;
   phases will add keys.
4. **Create `.env.example`** at repo root listing all future keys as empty
   strings with inline comments. Phases will append here.
5. **Add `app/(marketing)` route group** and move existing pages
   (`page.tsx`, `about`, `activity`, `school`, `search`, legal) into it.
   This frees `app/(dashboard)`, `app/(auth)`, and `app/api` for later
   phases without touching marketing URLs. Verify all existing routes still
   resolve (URLs unchanged — route groups don't appear in the path).
6. **Create empty folders** `app/(auth)`, `app/(dashboard)`, `app/api`,
   `src/lib/db`, `src/lib/email`, `src/lib/payments`, `src/lib/pos`,
   `supabase/migrations`, `supabase/seed`. Drop a `.gitkeep` in each.
7. **Update README.md** — replace the default Next.js boilerplate with a
   short Hakuna-specific section: stack, local dev steps, env setup,
   pointer to this plan file.

### Done criteria

- `npm run dev` serves all existing pages at unchanged URLs in both locales.
- `npm run build` passes with zero errors.
- `npm run lint` passes.
- `middleware.ts` is at repo root; `proxy.ts` no longer exists.
- `.env.example` is committed; `.env.local` is in `.gitignore` (already is via
  `.env*`).

---

## Phase 1 — Supabase as source of truth

**Goal:** DB, auth, RLS, storage. UI looks identical to today, but data is
fetched from Postgres and users can sign up / log in.

### 1.1 Supabase project setup

1. Create a Supabase project in **eu-central-1** region (close to PL/DE
   users).
2. Install: `npm i @supabase/ssr @supabase/supabase-js`
3. Add env keys to `.env.example` and `src/env.ts`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — mark in env.ts with a
     server-only zod schema)
4. Create `src/lib/db/server.ts` (uses cookies, for RSC / Server Actions /
   Route Handlers) and `src/lib/db/client.ts` (browser singleton). Follow
   Supabase's Next.js App Router SSR pattern exactly — do not improvise
   cookie handling.

### 1.2 Initial schema (one migration)

Create `supabase/migrations/0001_initial.sql` with:

**Enums:**
- `user_role`: `'user'`, `'partner'`, `'admin'`
- `partner_status`: `'pending'`, `'approved'`, `'suspended'`, `'rejected'`
- `session_status`: `'scheduled'`, `'cancelled'`, `'completed'`
- `pos_provider`: `'manual'`, `'csv'`, `'activenow'`, `'wodguru'`,
  `'efitness'`, `'langlion'` (extend later)

**Tables** (all with `id uuid default gen_random_uuid() primary key`,
`created_at timestamptz default now()`, `updated_at timestamptz default now()`
unless noted; add `updated_at` trigger for each mutable table):

- `profiles` — PK = `auth.users.id` (not a new uuid). Columns:
  `full_name text`, `role user_role default 'user'`, `locale text default
  'pl'`, `avatar_url text`. Trigger on `auth.users` insert creates the
  profile row.
- `partners` — `name text not null`, `slug text unique not null`,
  `status partner_status default 'pending'`, `contact_email text not null`,
  `city text`, `commission_rate_bps int default 2000 not null`
  (20% rack rate — **per the commission spec above, stored as basis points**),
  `subscription_tier text default 'none'`, `subscription_commission_bps int`
  (nullable — falls back to `commission_rate_bps` when no active sub).
- `partner_members` — `partner_id uuid references partners(id)`,
  `user_id uuid references auth.users(id)`, `role text default 'owner'`,
  primary key `(partner_id, user_id)`.
- `venues` — `partner_id uuid references partners(id) on delete cascade`,
  `name text not null`, `slug text unique not null`, `description_i18n jsonb
  not null default '{}'`, `address text`, `lat double precision`,
  `lng double precision`, `hero_image text`, `gallery jsonb default '[]'`,
  `rating numeric(2,1)`, `review_count int default 0`,
  `is_published boolean default false`.
- `activities` — `venue_id uuid references venues(id) on delete cascade`,
  `title_i18n jsonb not null default '{}'`, `description_i18n jsonb not null
  default '{}'`, `price_cents int not null`, `currency text default 'PLN'`,
  `duration_min int not null`, `level text`, `category text`,
  `age_group text`, `hero_image text`, `is_published boolean default false`.
- `sessions` — `activity_id uuid references activities(id) on delete
  cascade`, `starts_at timestamptz not null`, `ends_at timestamptz not
  null`, `capacity int not null`, `spots_taken int default 0 not null
  check (spots_taken <= capacity)`, `status session_status default
  'scheduled'`, `pos_provider pos_provider default 'manual'`,
  `pos_external_id text`. Unique index on `(activity_id, pos_external_id)`
  where `pos_external_id is not null`.
- `reviews` — `venue_id uuid references venues(id)`, `activity_id uuid
  references activities(id)` (nullable), `author_id uuid references
  auth.users(id)`, `rating int check (rating between 1 and 5) not null`,
  `text text`.
- `bookings` — placeholder (columns that Phase 3 will use, but with
  `status text default 'pending'`): `session_id uuid references
  sessions(id)`, `user_id uuid references auth.users(id)`,
  `amount_cents int not null`, `currency text default 'PLN'`,
  `commission_bps int not null`, `commission_cents int not null`,
  `is_boost_first_booking boolean default false`,
  `boost_commission_bps int`, `stripe_checkout_id text`,
  `stripe_payment_intent_id text`, `status text not null default 'pending'`,
  `confirmed_at timestamptz`, `cancelled_at timestamptz`.
- `webhook_events` — `provider text not null`, `external_id text not null`,
  `payload jsonb not null`, `processed_at timestamptz`. Unique on
  `(provider, external_id)` — this is the idempotency guard for Stripe
  webhooks (Phase 3) and POS webhooks (Phase 5).

**RLS policies** (in the same migration — enable RLS then add policies):

- `profiles`: SELECT own; UPDATE own; INSERT via trigger only.
- `partners`: SELECT where `status='approved'`; full access for members via
  `partner_members`; full access for admins.
- `partner_members`: SELECT where `user_id = auth.uid()` or admin;
  INSERT/DELETE by partner owners + admins.
- `venues`, `activities`: SELECT where `is_published=true` (for
  `activities`, also require parent venue published); full access for
  partner members of the owning partner; admin all.
- `sessions`: SELECT where parent activity published and `status =
  'scheduled'` and `starts_at > now()`; full access for partner members;
  admin all.
- `reviews`: SELECT all; INSERT only `author_id = auth.uid()` AND has a
  `confirmed` booking for that `venue_id`/`activity_id`; UPDATE/DELETE own
  within 24h of insert.
- `bookings`: SELECT where `user_id = auth.uid()` OR user is partner member
  of the partner owning the session's activity's venue; INSERT via Server
  Action using service role (RLS bypass) — **the client never inserts
  bookings directly**; UPDATE only via service role from webhooks.
- `webhook_events`: no public access. Service role only.

**Indexes:**
- `sessions (starts_at)` for time-based queries.
- `sessions (activity_id, starts_at)` for listing.
- `activities (venue_id)`.
- `venues (is_published, rating desc)`.
- GiST index on `(lat, lng)` via `earthdistance` extension if/when needed
  (skip for now unless "closest to you" becomes slow).

### 1.3 Auth pages

- `app/(auth)/login/page.tsx` — email + OAuth Google. Use Supabase Auth
  hosted UI components or roll a small form — prefer the latter for brand
  consistency.
- `app/(auth)/signup/page.tsx` — same.
- `app/(auth)/callback/route.ts` — OAuth callback handler that exchanges
  code for session.
- `app/(auth)/logout/route.ts` — POST only, clears session, redirects home.
- Wire the existing "Log in" / "Create account" buttons in `SiteNavbar`
  to these routes.
- Add a session-aware server helper `getCurrentUser()` in
  `src/lib/db/server.ts` that returns `{ user, profile } | null`.

### 1.4 Swap mocks for DB queries

This is the "seam" work. **Preserve the UI contract types** (`Activity`,
`Review`, `School` from `app/lib/mockData.ts`).

- Create `src/lib/db/queries/` with files: `activities.ts`, `venues.ts`,
  `reviews.ts`.
- Implement `getClosestActivities(locale, limit)`,
  `getSearchResults(locale, filters)`, `getActivityById(id, locale)`,
  `getVenueById(id, locale)`, `getReviews(ids, locale)` — each returns the
  same shape the UI expects today.
- Convert the pages that use `useActivitiesByIds` / `useSearchResults` /
  `useReviews` (currently client hooks reading from `useMessages()`) to
  **Server Components** that call the new DB queries. Where a page needs
  to stay a client component for interactivity (e.g. the search page), do
  the data fetch in the parent server component and pass the data down.
- Keep `messages/{pl,en}.json` for all UI strings (nav, buttons, form
  labels, etc.). **Remove** the `activities.*` and `reviews.*` bags from
  the locale files — that content now lives in the DB as `*_i18n jsonb`.

### 1.5 Seed script

- `supabase/seed/seed.ts` — TypeScript script using the service role key
  that inserts the current mock data (a1–a10, s1–s4, r1–r6, school-1, plus
  a demo partner + 3 demo sessions per activity with realistic `starts_at`
  values centered around now) into Supabase.
- Make it **idempotent**: upsert on slug / unique keys so it can be re-run
  safely.
- Run it locally after migrations.

### 1.6 Storage

- Create Supabase Storage bucket `venues` (public read, authenticated
  write, RLS policy restricts upload path to `{partner_id}/...`).
- Create bucket `avatars` (public read, authenticated write under
  `{user_id}/...`).

### Done criteria

- Fresh clone + `npm install` + `.env.local` + `supabase db reset` +
  `npm run dev` loads the site identically to before.
- All existing URLs render data from Postgres (verify by editing a row in
  Supabase Studio and seeing the change live).
- A new user can sign up with email or Google, lands on home page logged
  in, `profiles` row exists with `role='user'`.
- RLS: opening the Supabase SQL editor as the anon role and running
  `select * from bookings` returns zero rows (not an error, but no data
  leak). `select * from venues where is_published = false` returns zero
  rows for anon.
- `npm run build` passes.

---

## Phase 2 — Partner dashboard MVP

**Goal:** Partners can apply, get approved by an admin, create venues /
activities / sessions, and see them live on the public marketplace. **No
payments yet.**

### Tasks

1. **Partner application form** — replace the fake `BetaSignup
   variant="business"` with a real page at `/partners/apply`:
   - Fields: `name`, `contact_email`, `city`, `website` (optional),
     `expected_monthly_bookings` (optional, select).
   - Zod schema validates. Server Action inserts into `partners` with
     `status='pending'`.
   - Rate-limited (Upstash, 5/hour/IP) — install Upstash here:
     `npm i @upstash/redis @upstash/ratelimit`. Add env keys.
   - Turnstile widget. Install `npm i react-turnstile`. Add env keys.
     Server verifies token before accepting submission.
   - On success: Resend email to `contact_email` ("we got your
     application") + Resend email to admin distribution list.
2. **Resend setup** — install `npm i resend react-email @react-email/components`.
   - `src/lib/email/resend.ts` — singleton client.
   - `src/lib/email/templates/` — React Email templates:
     `partner-application-received.tsx`,
     `partner-approved.tsx`,
     `partner-rejected.tsx`,
     `admin-new-application.tsx`.
   - Add env keys: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
     `ADMIN_NOTIFICATION_EMAIL`.
   - **DNS note for the operator (not Claude Code):** SPF/DKIM/DMARC on
     the sending domain must be configured before production. Put a
     TODO-OPERATOR comment in the Resend client file.
3. **Admin panel** — `app/(dashboard)/admin/page.tsx`, guarded by
   `role='admin'`. If not admin, 404 (don't reveal existence).
   - List pending partners. Approve / reject buttons → Server Actions that
     update `status`, send the appropriate Resend email, and on approve,
     create a `partner_members` row linking the applicant's user (if they
     already have an account — otherwise include a magic-link in the
     approval email to finish setup).
4. **Partner dashboard** — `app/(dashboard)/partner/` layout guarded by
   `partner_members` membership. Pages:
   - `page.tsx` — overview (placeholder for analytics, Phase 4 fills it).
   - `venues/page.tsx` — list own venues + "Create venue" button.
   - `venues/[id]/edit/page.tsx` — form for name, slug, description (PL +
     EN tabs), address, coords (map picker using mapbox-gl that's already
     in the stack), hero image + gallery upload to Supabase Storage.
   - `activities/page.tsx` — list activities per venue + create.
   - `activities/[id]/edit/page.tsx` — form with all fields; title and
     description are `_i18n` with PL/EN tabs.
   - `schedule/page.tsx` — session list + bulk create (pick activity,
     repeat rule, capacity). Show `pos_provider` source badge on each
     session (everything is `manual` until Phase 5).
5. **Navigation in SiteNavbar** — add "Dashboard" link when logged in as
   partner member or admin.

### Done criteria

- A logged-out user can apply via `/partners/apply`. Form has rate limit
  and Turnstile. Two emails fire (to applicant and admin).
- An admin can log in, see the application, approve it. Applicant gets
  approval email.
- The approved partner can log in, create a venue, create activities,
  schedule sessions, upload images. All appear on `/search`,
  `/school/[slug]`, `/activity/[id]` for the public.
- Non-partner users get 404 when hitting `/partner/*`. Non-admin users get
  404 on `/admin/*`.

---

## Phase 3 — Bookings + payments + commission

**Goal:** Users can actually book and pay. Partners get paid (minus
commission). Subscriptions and Boost work per spec.

### 3.1 Stripe Connect setup

- `npm i stripe` (server SDK) and `npm i @stripe/stripe-js` (client).
- Enable Stripe Connect in the dashboard with **Express** account type for
  partners. **Do not** use Standard or Custom.
- Env keys: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET` (separate
  endpoint for Connect events).
- `src/lib/payments/stripe.ts` — server client singleton.
- Partner dashboard: "Connect Stripe" button → creates Express account,
  generates onboarding link, stores `stripe_account_id` on `partners`.
- Gate booking creation: only allow sessions to be booked if the owning
  partner has `charges_enabled` on their Stripe account.

### 3.2 Booking flow

**Schema addition** — migration `0002_bookings.sql`:
- On `partners`: `stripe_account_id text unique`.
- On `bookings`: add `boost_id uuid references listing_boosts(id)` (created
  below).
- New table `customer_partner_attribution` — `user_id`, `partner_id`,
  `first_booking_id`, `was_boost_attributed boolean`,
  `created_at`. Primary key `(user_id, partner_id)`. This is the table
  that answers "is this user a returning customer of this partner?" and
  "were they Boost-attributed?" — critical for the commission logic.
- New table `listing_boosts` — `partner_id`, `activity_id` (nullable —
  null means "venue-wide"), `venue_id` (nullable), `starts_at`, `ends_at`,
  `status text`, `stripe_payment_id text`. Exactly one of activity_id /
  venue_id must be set (check constraint).

**Server Action: `createBooking(sessionId)`** (in
`src/lib/payments/actions.ts`):

1. Auth check — user must be logged in.
2. Load session + activity + venue + partner. Verify partner is connected
   to Stripe and charges are enabled. Verify `spots_taken < capacity`.
3. **Determine commission** per spec:
   - Look up `customer_partner_attribution` for `(user_id, partner_id)`.
     If row exists, this is a returning customer — use base commission
     (`partners.commission_rate_bps`, or
     `partners.subscription_commission_bps` if the partner has an active
     subscription).
   - If no row exists, this is a new customer. Check if the session's
     activity (or its parent venue) has an **active `listing_boosts` row**
     at `now()`. If yes → commission = Boost rate
     (hardcoded default: **3500 bps target / 4000 bps rack**; store the
     applied rate on the booking for audit). Set `is_boost_first_booking
     = true` on the booking and `boost_id` reference.
   - If new customer but no active Boost → base commission, attribution
     row will still be created on confirmation but `was_boost_attributed
     = false`.
4. Create `bookings` row with `status='pending'`, the computed
   `commission_bps` and `commission_cents`, and (if Boost)
   `boost_commission_bps`.
5. Create Stripe Checkout Session with:
   - `mode: 'payment'`,
   - `payment_intent_data.application_fee_amount =
     commission_cents`,
   - `payment_intent_data.transfer_data.destination =
     partner.stripe_account_id`,
   - `metadata: { booking_id }`,
   - `payment_method_types: ['card', 'blik', 'p24']`,
   - `locale: user.locale`,
   - `success_url` and `cancel_url` to dedicated pages.
6. Store `stripe_checkout_id` on booking, return checkout URL, client
   redirects.

**Webhook handler** — `app/api/webhooks/stripe/route.ts`:

1. Verify signature with `STRIPE_WEBHOOK_SECRET`.
2. Idempotency: attempt insert into `webhook_events` with `(provider,
   external_id) = ('stripe', event.id)`. If conflict (already processed),
   return 200 immediately.
3. On `checkout.session.completed`:
   - Load booking by `metadata.booking_id`.
   - Atomic update:
     ```sql
     UPDATE sessions
        SET spots_taken = spots_taken + 1
      WHERE id = $1 AND spots_taken < capacity
     ```
     If zero rows affected → overbook race. Refund the payment via Stripe
     API, mark booking `status='refunded_overbook'`, send apology email.
   - Otherwise mark booking `status='confirmed'`, set `confirmed_at`.
   - Upsert `customer_partner_attribution` — if row didn't exist, insert
     with `first_booking_id = booking.id` and `was_boost_attributed =
     booking.is_boost_first_booking`.
   - Send confirmation Resend email to user + notification to partner.
4. On `payment_intent.payment_failed` / `checkout.session.expired`: mark
   booking `status='expired'`, leave `spots_taken` untouched (it was never
   incremented).
5. Mark `webhook_events.processed_at = now()` on success.

**Expiry cron** — Vercel Cron at `/api/cron/expire-bookings` that runs
every 10 min and sets stale `pending` bookings (older than 30 min) to
`expired`. Protect the endpoint with `CRON_SECRET` header.

**Cancellation** — Server Action `cancelBooking(bookingId)`:
- Only by booking owner, only if session is ≥48h away (per ToS).
- Stripe `refunds.create({ payment_intent, refund_application_fee: true
  })` — **the `refund_application_fee: true` flag is mandatory**,
  otherwise Hakuna keeps the commission on a refunded booking.
- Decrement `spots_taken`. Set `status='cancelled'`, `cancelled_at`.
- Email both sides.

### 3.3 Subscriptions (partner tier)

- Use Stripe Billing with a single Product "Hakuna Partner Plus" and one or
  more Prices (monthly).
- Partner dashboard has a "Plans" page: current tier, upgrade button →
  Stripe Checkout in `mode: 'subscription'`.
- Webhook handles `customer.subscription.created/updated/deleted`: updates
  `partners.subscription_tier` and `partners.subscription_commission_bps`
  based on the Price ID. Keep a mapping table in code
  (`src/lib/payments/subscription-tiers.ts`) rather than hardcoding
  scattered.
- When `subscription_commission_bps` is set and non-null, `createBooking`
  uses it as the base commission for returning customers.

### 3.4 Boost (Booksy-style)

- Partner dashboard → "Promote" page. Can activate Boost on a specific
  activity or venue-wide for N days (7 / 14 / 30 options).
- Boost purchase flow: one-time Stripe Checkout, `metadata: { boost_spec:
  ... }`. On webhook `checkout.session.completed`, insert `listing_boosts`
  row with computed `starts_at = now()`, `ends_at = now() + N days`,
  `status='active'`, `stripe_payment_id`.
- Ranking effect — update the `/search` query to sort by:
  ```
  ORDER BY
    (has_active_boost DESC,   -- boosted first
     has_subscription DESC,   -- then subscribed partners
     rating DESC,
     created_at DESC)
  ```
  Compute `has_active_boost` / `has_subscription` via a DB view.
- **Commission logic is handled in `createBooking`, not in the Boost
  definition** — Boost just marks eligibility for the elevated commission
  on new-customer first bookings.

### Done criteria

- End-to-end: a user browses, books a session with a test card, payment
  succeeds, both sides get emails, spot is decremented, partner can see
  the booking in their dashboard, partner's Stripe Connect account shows
  the transfer (minus `application_fee`).
- Cancel flow: user cancels ≥48h out, refund processes, spot frees up,
  application fee is refunded too.
- Commission spec verification (write a dedicated E2E or integration
  test):
  - **Returning customer at non-Boost partner:** commission = base rate.
  - **New customer at partner with no active Boost:** commission = base
    rate; `customer_partner_attribution` row created with
    `was_boost_attributed=false`.
  - **New customer books a Boost-active session:** commission = Boost rate
    (default 3500 bps); `is_boost_first_booking=true`;
    `was_boost_attributed=true` on attribution row.
  - **Same customer's second booking at same partner (with or without
    active Boost):** commission = base rate, `is_boost_first_booking =
    false`. Boost does **not** double-charge.
- Subscription partner's commission on a returning-customer booking =
  `subscription_commission_bps`, not default `commission_rate_bps`.
- Webhook idempotency: replaying the same Stripe event twice does not
  double-increment `spots_taken`.

---

## Phase 4 — Partner analytics

**Goal:** The partner overview page shows useful numbers.

### Tasks

1. Add a `view_events` table (migration `0003_analytics.sql`):
   `activity_id`, `session_id nullable`, `anonymous_id text`,
   `user_id nullable`, `referrer text`, `created_at`.
   RLS: service role insert only; SELECT by partner members of owning
   venue.
2. Add a lightweight client hook `useTrackView()` that POSTs to
   `/api/events/view` (rate-limited, no PII, just `anonymous_id` in a
   first-party cookie). Fire it on `activity/[id]` and `school/[id]` page
   loads.
3. Create DB views:
   - `partner_daily_revenue` — per partner, per day: sum of confirmed
     booking amount, commission, net partner share.
   - `activity_conversion` — per activity: views, booking conversions,
     rate.
   - `session_occupancy` — per session: `spots_taken / capacity`.
4. Partner overview page:
   - Revenue card (30d / 90d / YTD)
   - Bookings count + trend line
   - Top 5 activities by revenue
   - Occupancy heatmap (simple — day of week × hour)
5. Install `npm i recharts`. Keep charts minimal, single color palette from
   existing Tailwind theme.

### Done criteria

- Partner with test bookings from Phase 3 sees non-zero numbers.
- Views get tracked without blocking page render.
- No PII in `view_events` (verify in a spot check).

---

## Phase 5 — POS integrations

**Goal:** Partners who already use ActiveNow / WodGuru / eFitness / LangLion
can connect those systems and sync their schedule into Hakuna without
re-entering data.

### 5.1 Integration framework

1. Create `src/lib/pos/adapter.ts` — the `POSAdapter` interface:
   ```ts
   interface POSAdapter {
     provider: PosProvider;
     fetchSchedule(config: PosConfig): Promise<ExternalSession[]>;
     pushBooking?(config: PosConfig, booking: BookingExport): Promise<void>;
     testConnection(config: PosConfig): Promise<{ ok: boolean; message: string }>;
   }
   ```
2. Migration `0004_pos_integrations.sql`:
   - Table `pos_integrations`: `partner_id`, `provider pos_provider`,
     `config_encrypted bytea` (encrypt with pgcrypto using an app-level
     key in env: `POS_CONFIG_ENCRYPTION_KEY` — 32 random bytes base64),
     `status text`, `last_synced_at`, `last_error`. Unique on
     `(partner_id, provider)`.
   - Encrypt/decrypt via a server-only `src/lib/pos/crypto.ts` helper.
3. Sync orchestration: Vercel Cron `/api/cron/pos-sync` every 15 min.
   Iterates over active `pos_integrations`, calls `fetchSchedule`,
   upserts into `sessions` using `(activity_id, pos_external_id)` as
   the natural key.
4. Partner dashboard page `/partner/integrations` — list available
   providers, connect form per provider (provider-specific fields — API
   key, studio ID, etc.), test-connection button, disconnect button.

### 5.2 Adapters (in priority order)

**Do these one at a time, each as its own sub-phase. Ship and test one
before starting the next.**

1. **`src/lib/pos/adapters/csv.ts`** — CSV import fallback. Partner uploads
   a CSV with columns `activity_name, starts_at, ends_at, capacity`. Map
   `activity_name` to Hakuna `activities` by name (prompt user to
   resolve ambiguities). 80% of partners will use this while real
   integrations are pending.
2. **`src/lib/pos/adapters/activenow.ts`** — highest priority (largest
   user base in PL). Contact ActiveNow for API access before coding. If
   no API, escalate back to human — do not scrape.
3. **`src/lib/pos/adapters/wodguru.ts`**.
4. **`src/lib/pos/adapters/efitness.ts`**.
5. **`src/lib/pos/adapters/langlion.ts`** — lower priority (different
   segment: language schools).

### 5.3 Reverse sync (optional, per provider)

If the provider supports it, implement `pushBooking` so Hakuna bookings
appear in the partner's POS as attendees. Not required for v1 — a manual
export in the partner dashboard is acceptable initially.

### Done criteria

- A partner can connect at least the CSV adapter and see sessions
  imported, visible on `/search` and bookable end-to-end.
- Failed syncs don't crash the cron; errors are logged to `last_error`
  and the admin gets an email after 3 consecutive failures.
- Encrypted config: `select config_encrypted from pos_integrations` in
  the SQL editor shows binary, not the API key.

---

## Phase 6 — Production hardening

**Goal:** Ready for real traffic and real money.

### Tasks

1. **Sentry** — `npm i @sentry/nextjs`, wire up with the wizard. Set
   release tagging via git SHA. Env: `SENTRY_DSN`,
   `SENTRY_AUTH_TOKEN`.
2. **CSP + security headers** — `next.config.ts`. Tight CSP (allow
   mapbox, Supabase, Stripe, Resend). HSTS, Referrer-Policy,
   Permissions-Policy.
3. **Cookie consent** — implement the UI for the existing cookie policy.
   Store consent in a first-party cookie. Gate analytics tracking on
   consent.
4. **Account export / delete** (GDPR) — partner dashboard and user
   account pages:
   - Export: Server Action returns JSON of all user's data.
   - Delete: soft-delete, schedules hard delete after 30 days via cron.
5. **Playwright E2E** — critical flows only:
   - Sign up → browse → book (test mode) → confirmation.
   - Partner apply → admin approve → partner login → create activity.
   - Cancel booking ≥48h out.
   - Cancel booking <48h out (must fail).
6. **Load + smoke checks** — Lighthouse on home and `/search`, a basic
   k6 script hitting `/search` and the checkout server action (both
   guarded so it doesn't actually charge in CI).
7. **DPA checks** — TODO-OPERATOR comments in `src/lib/db/server.ts`,
   `src/lib/email/resend.ts`, `src/lib/payments/stripe.ts` reminding the
   operator to sign DPAs with Supabase, Resend, Stripe before launch.

### Done criteria

- Sentry catches a deliberate thrown error from a test route.
- Playwright suite green locally and in CI.
- CSP doesn't break any existing page (verify: open DevTools console on
  every major route, zero violations).
- `/api/health` endpoint returns 200 with DB + Stripe + Resend
  connectivity checks.

---

## Environment variables — running list

Each phase adds its keys to `.env.example` and `src/env.ts`. Final state:

```
# Phase 1 — Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Phase 2 — Email, rate limit, Turnstile
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Phase 3 — Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_WEBHOOK_SECRET=
CRON_SECRET=

# Phase 5 — POS integrations
POS_CONFIG_ENCRYPTION_KEY=

# Phase 6 — Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Existing — Mapbox (already used in code)
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Commission spec — single source of truth

Implementations of commission logic in multiple places must all agree with
this block. If you change something here, update the code. If you change
the code, update here.

- **Base commission**: stored on `partners.commission_rate_bps`. System
  default `2000` (20% rack rate). Target post-negotiation `1500` (15%).
- **Subscription commission**: stored on
  `partners.subscription_commission_bps` (nullable). When non-null and the
  partner has an active subscription, this rate *replaces* the base rate
  for returning-customer bookings.
- **Boost commission**: default `3500` (35% target) / `4000` (40% rack),
  constants in `src/lib/payments/commission.ts`. Applied to the **first
  booking** of a **new-to-this-partner customer** **on a Boost-active
  session**. Does not apply to:
  - That customer's subsequent bookings at the same partner.
  - Any booking by a customer who was already attributed to that partner
    (`customer_partner_attribution` row exists).
- **Attribution**: per `(user_id, partner_id)`. Created on first confirmed
  booking. Permanent.
- **Precedence** on the first booking of a new customer:
  - If Boost is active on the session at booking creation → Boost rate
    applies, base rate does not.
  - If Boost is not active → base rate (or subscription rate) applies;
    attribution is still recorded, flagged `was_boost_attributed=false`.

## Progress log

_Claude Code: append dated entries here as you complete each phase or
sub-task. Keep them short — one line per meaningful step._

- 2026-04-24 — Phase 0 groundwork branch `phase/0-groundwork`.
- 2026-04-24 — Skipped step 1 (proxy.ts → middleware.ts rename): Next 16
  renamed `middleware` → `proxy`; current `proxy.ts` is already correct per
  `node_modules/next/dist/docs/.../03-file-conventions/proxy.md`. Keeping it.
- 2026-04-24 — Installed `zod` (4.3.6); `@types/node` already present.
- 2026-04-24 — Added `src/env.ts` with Zod-validated env (server/client split,
  empty schema for now — phases append).
- 2026-04-24 — Added `.env.example` listing every key from the plan's running
  list, grouped by phase.
- 2026-04-24 — Created `app/[locale]/(marketing)/` route group; moved
  `page.tsx`, `about/`, `activity/`, `blog/`, `cookies/`, `privacy/`,
  `school/`, `search/`, `terms/` into it. URLs unchanged. Adapted plan from
  `app/(marketing)/` → `app/[locale]/(marketing)/` because routes live under
  the locale segment. Same adaptation will apply to `(auth)/` and
  `(dashboard)/` in later phases.
- 2026-04-24 — Converted relative imports in moved files to `@/*` alias to
  avoid breakage from future moves.
- 2026-04-24 — Scaffolded `app/[locale]/(auth)/`, `app/[locale]/(dashboard)/`,
  `app/api/`, `src/lib/{db,email,payments,pos}/`,
  `supabase/{migrations,seed}/` with `.gitkeep`.
- 2026-04-24 — Rewrote `README.md` with Hakuna-specific stack, dev steps, env
  setup, project structure, and pointer to this plan.
- 2026-04-24 — `npm run build` green (51/51 static pages). Pre-existing lint
  errors in `search/HeroSearchBar.tsx`, `search/MobileSearch.tsx`,
  `MobileActivityCarousel.tsx` left untouched per CLAUDE.md ("Don't fix
  errors in files you didn't edit").
- 2026-04-24 — Phase 1a started on branch `phase/1a-supabase`.
- 2026-04-24 — Installed `@supabase/ssr` 0.10.2 + `@supabase/supabase-js`
  2.104.1. Extended `src/env.ts` with Supabase URL / anon / service role
  keys. Marked them `.optional()` so the marketing site keeps building
  pre-config; clients in `src/lib/db/*` throw a clear error when invoked
  without configuration.
- 2026-04-24 — Wrote migration `supabase/migrations/0001_initial.sql` (775
  lines): pgcrypto extension, all enums, all tables per spec (profiles,
  partners, partner_members, venues, activities, sessions, reviews,
  bookings, webhook_events), shared `set_updated_at` trigger, `auth.users
  → profiles` bridge (`handle_new_user`, security definer), authorization
  helpers (`is_admin`, `is_partner_member`, security definer), full RLS
  policies on every table, all indexes from spec, storage buckets
  (`venues`, `avatars`) with path-prefixed object policies, and
  commented-out anon sanity-check SELECTs.
- 2026-04-24 — Wrote Supabase clients: `src/lib/db/server.ts` (request-
  scoped, async, official `getAll`/`setAll` cookie pattern with RSC
  swallow comment + `getCurrentUser` helper using `auth.getUser()` not
  `getSession()`), `src/lib/db/client.ts` (browser singleton),
  `src/lib/db/admin.ts` (service-role, runtime-guarded against window).
- 2026-04-24 — Updated `proxy.ts` to chain Supabase session refresh after
  the next-intl middleware (intl owns the response; Supabase writes auth
  cookies onto it). No-ops when Supabase env not configured.
- 2026-04-24 — Auth pages: `app/[locale]/(auth)/` group with `layout.tsx`,
  `login/page.tsx` + `LoginForm`, `signup/page.tsx` + `SignupForm`, shared
  `actions.ts` (Server Actions: email/password login + signup, Google
  OAuth via `signInWithOAuth`). OAuth callback at
  `app/api/auth/callback/route.ts` (outside `[locale]` so the Supabase
  redirect-URL allowlist is stable). Logout at
  `app/api/auth/logout/route.ts` (POST only).
- 2026-04-24 — Wired `SiteNavbar` Log in / Create account buttons to
  `/login` and `/signup` via the locale-aware `Link`. Added `Auth.*` and
  `Nav.logout` namespaces in `messages/{pl,en}.json`.
- 2026-04-24 — Build green (57/57 static pages including new auth routes).
  Operator action required to complete Phase 1a Done criteria: create the
  Supabase project (eu-central-1), populate `.env.local` with the URL +
  anon + service role keys, run `supabase db reset` against the migration,
  enable Google OAuth in the Supabase dashboard with the callback URL
  `<site>/api/auth/callback`, then verify signup end-to-end and the RLS
  anon SELECT checks at the bottom of `0001_initial.sql`.
- 2026-04-24 — Phase 1b PARTIAL on branch `phase/1b-queries`. Wrote the
  full DB query layer at `src/lib/db/queries/{activities,venues,reviews,
  _i18n,index}.ts` plus contract types at `src/lib/db/types.ts`.
  Functions: `getClosestActivities`, `getActivityById`, `getSearchResults`,
  `getFilteredActivities`, `getVenueById`, `getReviews`. Each handles
  "Supabase not configured" by returning `[]`/`null` with a `console.warn`
  so the marketing site keeps rendering pre-seed.
- 2026-04-24 — Wrote `supabase/seed/seed.ts` (idempotent, uses service
  role). Upserts demo partner, venues for every `schoolId` in mock data,
  all activities with locale JSONB pulled from `messages/{pl,en}.json`,
  3 future sessions per activity, reviews with auto-created seed reviewer
  auth users. Runnable via `npx tsx supabase/seed/seed.ts`. Added `tsx`
  devDep.
- 2026-04-24 — DELIBERATELY DEFERRED: page swap + removal of
  `activities.*` / `reviews.*` from message bags. Reason: without a live
  seeded DB, that swap would blank the marketing site. Will complete when
  operator seeds Supabase.
