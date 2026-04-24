# Hakuna — Claude Code task cards (per phase)

Each section below is a self-contained prompt you can paste to Claude Code
as a single task. The full spec lives in `HAKUNA_BUILD_PLAN.md` — that file
must also be in the repo so Claude Code can reference it.

---

## Card: Phase 0

> Read `HAKUNA_BUILD_PLAN.md` first. Execute **Phase 0 — Groundwork** in
> full. Do not proceed past Phase 0's Done criteria in this session. When
> all Done criteria pass, append a dated one-line entry per task to the
> Progress log at the bottom of `HAKUNA_BUILD_PLAN.md`, commit with message
> `chore: phase 0 groundwork`, and stop.

---

## Card: Phase 1 — part A (schema + auth)

> Read `HAKUNA_BUILD_PLAN.md` first. Execute **Phase 1** sections **1.1,
> 1.2, 1.3, 1.6** — Supabase project wiring, initial migration with all
> tables and RLS policies, auth pages, and storage buckets. Do **not** do
> the mock swap (1.4) or seed (1.5) yet. Confirm:
>
> - `supabase db reset` applies migration `0001_initial.sql` cleanly.
> - RLS verification: as anon, `select * from bookings` returns zero rows
>   without error; `select * from venues where is_published=false` returns
>   zero rows.
> - Signup flow works end to end; new `profiles` row appears.
>
> Commit as `feat: phase 1a supabase + auth + rls`. Append progress-log
> entries. Stop.

---

## Card: Phase 1 — part B (swap mocks, seed)

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 1** sections **1.4 and
> 1.5**. Replace mock-data reads in pages with DB queries via
> `src/lib/db/queries/`. Preserve the existing `Activity`, `Review`,
> `School` UI-contract types — pages render identically. Remove
> `activities.*` and `reviews.*` bags from `messages/{pl,en}.json` after
> migrating that content into `*_i18n` JSONB columns via the seed. Seed
> must be idempotent.
>
> Verify: fresh clone → install → `.env.local` → `supabase db reset` →
> `npx tsx supabase/seed/seed.ts` → `npm run dev` → all existing URLs
> render identically to before, but data is now from DB (edit a row in
> Supabase Studio, see it live).
>
> Commit as `feat: phase 1b mocks replaced with db`. Append progress log.
> Stop.

---

## Card: Phase 2

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 2 — Partner dashboard MVP**
> end to end. Install Upstash, Resend, React Email, Turnstile deps as the
> plan specifies. Build the apply form, admin panel, partner dashboard
> with venue / activity / schedule CRUD + Supabase Storage uploads. All
> four Resend templates must exist and render correctly in the React
> Email preview.
>
> **Do not implement payments or commission logic yet** — Phase 3 handles
> that. A partner approved in Phase 2 should see their sessions on the
> public marketplace with a "Book" button that currently does nothing (or
> a "coming soon" stub) — that is acceptable at end of Phase 2.
>
> Verify the Phase 2 Done criteria. Commit as `feat: phase 2 partner
> dashboard`. Append progress log. Stop.

---

## Card: Phase 3 — part A (Stripe Connect + basic booking)

> Read `HAKUNA_BUILD_PLAN.md`. Focus: **Phase 3, sections 3.1 and 3.2**.
> Wire Stripe Connect Express, the Connect-onboarding flow in the partner
> dashboard, migration `0002_bookings.sql` with
> `customer_partner_attribution` and `listing_boosts` tables, and
> `createBooking` Server Action **implementing the full commission spec
> from the bottom of the plan file**.
>
> Implement the webhook handler with:
> - Signature verification
> - Idempotency via `webhook_events`
> - Atomic `spots_taken` increment
> - `customer_partner_attribution` upsert
> - Overbook refund path
>
> Implement the cancellation Server Action with `refund_application_fee:
> true`.
>
> **Do not do subscriptions or Boost UI yet** — just the booking +
> commission core. Commission spec must still be honored: a new-customer
> booking on an activity that has a `listing_boosts` row inserted manually
> (via SQL) must apply the Boost rate.
>
> Write the commission verification tests listed in Phase 3 Done criteria
> under `tests/commission.spec.ts` and make them pass.
>
> Commit as `feat: phase 3a bookings + connect + commission core`. Append
> progress log. Stop.

---

## Card: Phase 3 — part B (subscriptions + Boost UI)

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 3 sections 3.3 and 3.4** —
> Stripe Billing for partner subscriptions with tier-specific
> `subscription_commission_bps`, and the Boost purchase flow with ranking
> effect on `/search`.
>
> Reuse the webhook infrastructure from 3a; add subscription event types
> and boost checkout completion to the handler (same idempotency).
>
> Verify all four commission-spec scenarios in Phase 3 Done criteria end
> to end (not just unit tests). Commit as `feat: phase 3b subscriptions
> + boost`. Append progress log. Stop.

---

## Card: Phase 4

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 4 — Partner analytics** in
> full. `view_events` table, tracking hook, DB views, partner overview UI
> with recharts. No external analytics vendor. No PII in `view_events`.
>
> Commit as `feat: phase 4 analytics`. Append progress log. Stop.

---

## Card: Phase 5 — framework + CSV adapter

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 5 sections 5.1 and 5.2 item
> 1** — POS adapter framework, migration `0004_pos_integrations.sql` with
> pgcrypto-encrypted config, cron-driven sync orchestration, partner
> `/integrations` UI, and the **CSV adapter only**.
>
> Verify: a partner uploads a CSV, sessions appear in the schedule with
> `pos_provider='csv'` and are bookable via the normal Phase 3 flow.
>
> Commit as `feat: phase 5a pos framework + csv`. Append progress log.
> Stop.

---

## Card: Phase 5 — ActiveNow adapter

> Before starting, confirm API access is secured from ActiveNow. If the
> answer is "no API, scrape the dashboard", **stop and escalate** — do
> not implement scraping.
>
> Read `HAKUNA_BUILD_PLAN.md`. Implement **Phase 5 section 5.2 item 2** —
> ActiveNow adapter against their documented API. Connect form collects
> the credentials they require (ask the operator for the exact field
> list). Test with a real sandbox account.
>
> Commit as `feat: phase 5b activenow adapter`. Append progress log. Stop.

---

## Card: Phase 5 — other adapters

> (Repeat the ActiveNow card pattern for WodGuru, eFitness, LangLion, one
> at a time, each as its own session and commit.)

---

## Card: Phase 6

> Read `HAKUNA_BUILD_PLAN.md`. Execute **Phase 6 — Production hardening**
> end to end. Sentry, CSP, cookie-consent UI, GDPR export/delete,
> Playwright suite for the listed critical flows, `/api/health` route.
>
> **Do not launch** — this card ends at "green CI, documented
> preflight". Write a `LAUNCH_CHECKLIST.md` at repo root covering the
> human tasks (DNS for Resend, Stripe live-mode switch, DPAs signed,
> first payout tested) that must happen before the first real
> transaction.
>
> Commit as `feat: phase 6 hardening + launch checklist`. Append progress
> log. Stop.

---

## If something goes off-script

These prompts assume happy path. If Claude Code hits any of the following,
it should **stop and report back** instead of improvising:

- A spec in `HAKUNA_BUILD_PLAN.md` contradicts something it's being asked
  to do.
- A third-party API (Stripe, Supabase, Resend, a POS) returns
  behavior/fields that don't match what the plan assumes.
- A Done criterion genuinely cannot be verified (e.g. no Stripe test
  cards configured, no admin user exists).
- A migration needs to be edited after the fact — always **add a new
  migration**, never edit a past one. If you think you need to edit, stop
  and ask.
- Commission math produces a result you can't reconcile with the
  "Commission spec" section.

In any of those cases: leave the working tree clean (stash if needed),
write a note at the bottom of the Progress log explaining what you hit,
and stop.
