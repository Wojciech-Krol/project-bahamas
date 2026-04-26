# Hakuna seed script

Populates a Supabase project with the current mock catalog so the marketing
site keeps rendering identically once the Phase 1b page-swap lands.

## Prerequisites

1. Migrations applied: `supabase db reset` (or `supabase db push`) against the
   target project.
2. `.env.local` at the project root with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — bypasses RLS)
3. Dev dep installed: `tsx` (already in `package.json` devDependencies).

## Run

```bash
npx tsx supabase/seed/seed.ts
```

The script is idempotent — safe to re-run. Every insert uses a natural-key
`upsert`. On success it prints a summary:

```
Seed complete:
  partners:   1
  venues:     N
  activities: M
  sessions:   M*3
  reviews:    R
```

## What it does

- Upserts a demo partner (`slug='hakuna-demo'`, `status='approved'`).
- Upserts one venue per `schoolId` referenced in `ACTIVITIES_DATA`, with PL/EN
  placeholder descriptions and `is_published=true`.
- Upserts all mock activities, composing PL/EN `title_i18n` /
  `description_i18n` from `messages/{pl,en}.json` `activities.{id}`.
- Creates 3 future sessions per activity (T+1d @ 07:00, T+3d @ 18:00,
  T+7d @ 10:00).
- Creates (or reuses) seed reviewer auth users (`seed-reviewer+{id}@hakuna.dev`)
  and upserts the mock reviews against the first seeded activity.
