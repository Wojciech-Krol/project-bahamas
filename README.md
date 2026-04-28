# Hakuna

Polish-first activity discovery & booking marketplace. Users find classes
(dance, language, yoga, padel, etc.) at partner venues; partners list and
manage their schedule; Hakuna takes a commission per booking.

Pre-launch. The marketing site (home, search, activity/venue pages, blog,
legal) is live with mock data. The marketplace backend, partner dashboard,
payments, and POS integrations are being built phase-by-phase per
[`plan_akcji/HAKUNA_BUILD_PLAN.md`](./plan_akcji/HAKUNA_BUILD_PLAN.md).

## Stack

- **Framework**: Next.js 16.2.1 (App Router, React 19.2.4, Server Components)
- **Language**: TypeScript strict
- **Styling**: Tailwind CSS v4 (tokens in `app/globals.css` `@theme` block)
- **i18n**: next-intl 4 — locales `pl` (default) + `en`, `localePrefix: "always"`
- **Maps**: mapbox-gl 3
- **Validation**: zod
- **DB / Auth / Storage** *(Phase 1+)*: Supabase
- **Email** *(Phase 2+)*: Resend + React Email
- **Payments** *(Phase 3+)*: Stripe Connect Express + Stripe Billing
- **Hosting**: Vercel

See [`CLAUDE.md`](./CLAUDE.md) for project conventions and Next.js 16 gotchas
(notably: middleware file is `proxy.ts`, route params are `Promise`).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run dev                  # http://localhost:3000
```

URLs are locale-prefixed: `http://localhost:3000/pl`, `http://localhost:3000/en`.
Bare `/` redirects via `proxy.ts` (next-intl middleware).

### Scripts

| Script | Use |
|--------|-----|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | run production build |
| `npm run lint` | ESLint (flat config) |

## Environment variables

Copy `.env.example` → `.env.local`. The full list is documented inline there
and validated at runtime by `src/env.ts`. Each phase adds its own keys.
Restart `next dev` after editing `.env.local` (Next does not hot-reload env).

Service-role / secret keys are **server-only** — never reference them from a
`"use client"` component.

## Project structure

```
app/
  [locale]/
    (marketing)/        # public site — home, about, search, activity, school, blog, legal
    (auth)/             # Phase 1+: login / signup / oauth callback
    (dashboard)/        # Phase 2+: partner + admin dashboards
    partner/            # current pre-launch partner dashboard stub (mock data)
    layout.tsx          # locale shell, fonts, NextIntlClientProvider
  api/                  # Phase 2+: webhooks, cron, server endpoints
  components/           # shared UI
  lib/                  # current mock data + composers
  globals.css           # Tailwind v4 @theme tokens
src/
  env.ts                # zod-validated env
  i18n/                 # next-intl routing/request/navigation
  lib/{db,email,payments,pos}/   # Phase 1+ backend modules
messages/{pl,en}.json   # translation bags
supabase/{migrations,seed}/      # Phase 1+ schema + seed
proxy.ts                # next-intl middleware (Next 16 file convention)
```

## Build plan

Roadmap, commission spec, and per-phase task cards live in
[`plan_akcji/HAKUNA_BUILD_PLAN.md`](./plan_akcji/HAKUNA_BUILD_PLAN.md) and
[`plan_akcji/PHASE_TASKS.md`](./plan_akcji/PHASE_TASKS.md). Append progress
entries to the bottom of the build plan as phases complete.
