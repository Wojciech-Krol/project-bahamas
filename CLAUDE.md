@AGENTS.md

# Project: HAKUNA

Polish-first activity discovery & booking app (Poland-focused). Pre-launch, static/mock-data mode. Scalable — code assumes real backend/DB swap-in later.

## Stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16.2.1** (App Router, Server Components, React 19.2.4) |
| Language | TypeScript, `strict: true`, target ES2017 |
| Styling | **Tailwind CSS v4** via `@tailwindcss/postcss` — config lives in `app/globals.css` `@theme` block (no `tailwind.config.*`) |
| i18n | **next-intl 4.9.1** |
| Maps | mapbox-gl 3 (`NEXT_PUBLIC_MAPBOX_TOKEN` required at runtime) |
| Dates | date-fns 4, react-day-picker 9 |
| Lint | ESLint 9 flat config, `eslint-config-next` core-web-vitals + TS |
| Tests | **None yet** — no test runner configured |

Scripts: `next dev` / `next build` / `next start` / `eslint`.

## Next.js 16 gotchas (this is NOT the Next you know)

- **Middleware file is `proxy.ts`** at project root, not `middleware.ts`. Exports default + `config.matcher`.
- **`params` is a `Promise`** in layouts/pages: `{ params }: { params: Promise<{ locale: string }> }` → `const { locale } = await params;`.
- `async` generateMetadata, setRequestLocale in locale layout.
- If unsure about any API, read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Directory layout

```
app/                     # App Router lives at ROOT, not src/app
  [locale]/              # every route nested under locale segment
    layout.tsx           # HTML shell, fonts, NextIntlClientProvider, setRequestLocale
    page.tsx             # /
    about/ activity/[id]/ blog/[slug]/ cookies/ privacy/ school/[id]/ search/ terms/
  components/            # shared UI (SiteNavbar, BrandLogo, MapboxMap, search/, blog/, …)
  lib/                   # data + helpers (mockData, i18nData, blogData, blogContent, searchQuery)
  globals.css            # Tailwind v4 @theme tokens + component CSS
  sitemap.ts robots.ts   # SEO at app/ root (NOT under [locale])
  favicon.ico
src/i18n/                # next-intl config (routing, request, navigation)
messages/{pl,en}.json    # translation bags — also hold mock CONTENT (activities, reviews copy)
public/                  # static assets (logo.svg, mapbox/hakuna-style.json)
proxy.ts                 # next-intl middleware (Next 16 rename)
next.config.ts           # wraps config with createNextIntlPlugin('./src/i18n/request.ts')
tsconfig.json            # path alias "@/*": ["./*"] — relative to project root
mocks/                   # out-of-band design specs (partner dashboard) — not imported
stitch_Designs/          # design references — not imported
```

## i18n — load-bearing

- Locales: `["pl", "en"]`, **default `pl`**, `localePrefix: "always"` → every path is `/{locale}/…`, no bare `/`.
- Config: `src/i18n/routing.ts` (source of truth), `src/i18n/request.ts` (message loader; comment flags it as the DB-swap seam), `src/i18n/navigation.ts` (locale-aware nav wrappers).
- **Always import `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` from `src/i18n/navigation.ts`** — never from `next/link` / `next/navigation` for internal routes (locale prefix would be lost).
- Server components: `getTranslations({ locale, namespace })`, `setRequestLocale(locale)` at top of locale layout.
- Client components: `useTranslations(namespace?)`, `useLocale()`, `useMessages()` (raw bag — used to pull mock copy).
- Locale layout must call `generateStaticParams` returning `routing.locales.map(l => ({ locale: l }))`.
- Adding a locale = update `routing.ts` + add `messages/{code}.json` + `LOCALE_LABELS`/`LOCALE_SHORT` in `LanguageSwitcher.tsx`.

## Data model (current = mock, future = DB)

Split by translatability:
- `app/lib/mockData.ts` — IDs + non-translatable fields (imageUrl, price, rating, avatars, coords).
- `messages/{locale}.json` `activities`/`reviews` keys — translatable copy (title, description, location, etc.).
- `app/lib/i18nData.ts` hooks compose them (`useActivitiesByIds`, `useClosestActivities`, `useSearchResults`, `useFilteredActivities`, `useReviews`).

When replacing with DB: swap the JSON import in `src/i18n/request.ts` + replace composer hooks. Preserve the ID + bag shape so components don't change.

## Search

- URL-driven state. Params: `activities` (csv of ActivityKey), `neighborhood`, `when`, `kids`, `teens`, `adults` (default 1, others 0).
- `app/lib/searchQuery.ts` — `buildSearchQuery` / `parseSearchQuery` / `DEFAULT_SEARCH_PARAMS`. Parser accepts URLSearchParams, `{get()}`, or plain record.
- Panels in `app/components/search/panels.tsx`; desktop hero/nav expanded bar + mobile overlay. Segment keys: `"activities" | "neighborhood" | "when" | "age" | null`.
- Components consuming `useSearchParams` must be wrapped in `<Suspense>` (see commit `3bd5b3f`).

## SEO

- `app/sitemap.ts` emits per-locale URLs + hreflang `alternates.languages` for every static path and every blog slug (`getAllSlugs()` from `blogContent.ts`).
- `app/robots.ts` — allow all, points to sitemap.
- Metadata per locale via `generateMetadata` + `getTranslations({ namespace: "Metadata" })`. `canonical: "/{locale}"`, alternates for both locales.
- Env: `NEXT_PUBLIC_SITE_URL` (fallback `https://hakuna.example` — must be overridden in prod).

## Styling system

- Tailwind v4, tokens in `app/globals.css` under `@theme`. Use semantic color classes, not raw hex — e.g. `bg-surface`, `text-on-surface`, `bg-primary`, `bg-surface-container-lowest`, `text-on-primary-container`.
- Material Design 3 tonal palette: `*`, `on-*`, `*-container`, `on-*-container`, `*-fixed`, `*-fixed-dim`, `on-*-fixed`, `on-*-fixed-variant`, `inverse-*`.
- Palette name: "Sun-Drenched Editorial" — primary pink `#b40f55`, secondary amber `#7d570e`, surface cream `#fdf9f0`.
- Fonts via `next/font/google` in `[locale]/layout.tsx`: Plus Jakarta Sans (`--font-headline`), Be Vietnam Pro (`--font-body`, also `--font-sans`, `--font-label`). Use `font-headline`/`font-body` utilities.
- Material Symbols Outlined loaded via Google Fonts `<link>` in layout `<head>`; render via `<Icon name="…" />` (`app/components/Icon.tsx`).
- Utilities worth knowing: `max-w-site` (1760px), `editorial-shadow`, `search-glass`, `search-border`, `no-scrollbar`, `.calendar-wrapper` (react-day-picker skin).
- Site chrome: `<SiteNavbar>` is fixed; pages need top padding (`pt-16 md:pt-[72px]`) to clear it.

## Environment variables

| Var | Use |
|-----|-----|
| `NEXT_PUBLIC_SITE_URL` | canonical origin for sitemap/robots/OG |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | required for MapboxMap to init |
| `NEXT_PUBLIC_MAPBOX_STYLE_URL` | optional; defaults to `mapbox://styles/mapbox/light-v11`. Custom style JSON at `public/mapbox/hakuna-style.json` |

All `NEXT_PUBLIC_*` → restart `next dev` after edits to `.env.local`.

## Partner dashboard

Studio/venue-facing admin. Pre-launch stub — mock data only, no real auth/DB.

- Routes live under `app/[locale]/partner/`:
  - `login/page.tsx` — standalone, no sidebar.
  - `(shell)/` route group wraps sidebar-layout pages: `page.tsx` (overview), `classes/`, `classes/[id]/` (editor drawer), `instructors/`, `venue/`, stub `bookings|reviews|insights|payouts|settings/`.
- `(shell)/layout.tsx` renders `<PartnerSidebar>` + `<main>`. Sidebar is `"use client"` — uses `usePathname()` from `src/i18n/navigation` for active-link state. Import nav links from there, never `next/link`.
- Every partner page is a client component — spec says "behind auth, heavily interactive, don't over-engineer RSC boundaries here".
- Data split (same convention as public site):
  - `app/lib/partnerMockData.ts` — IDs, gradients, prices, ratings, status flags, array order.
  - `messages/{locale}.json` `Partner.mock.*` — translatable copy (names, descriptions, schedule text, labels). Composer pattern: components read a `copyKey` off the mock record and call `useTranslations("Partner.mock.classes")(`${copyKey}.title`)`.
- Class editor (`classes/[id]`) renders a dimmed list skeleton + right-side drawer. Close navigates to `/partner/classes`. No intercepting route trickery — a plain route that looks like an overlay.
- Excluded from sitemap; disallowed for all bots in `app/robots.ts` (`/pl/partner`, `/en/partner`).
- `Partner.*` message namespace covers: `nav`, `roles`, `common`, `status`, `login`, `overview`, `classes`, `classEditor`, `instructors`, `venue`, `mock`. Polish plural forms used for `overview.subtitle`, `actions.reviewsReply`.
- Shared components in `app/components/partner/`: `PartnerSidebar`, `VenueSwitcher`, `MetricCard`, `ScheduleRow`, `ActionQueueItem`, `ClassRowCard`, `InstructorCard` (+ `InstructorInviteCard`, `InstructorInviteEmpty`), `PlaceholderPage`.

When backend lands: replace mock data loader + add real auth-guard to `(shell)/layout.tsx` (redirect unauthenticated to `/partner/login`). Keep the `copyKey`/message-namespace shape so UI components don't change.

## Conventions

- Server component by default; add `"use client"` only when hooks/state/browser APIs needed.
- Path alias `@/*` = project root (`tsconfig.json`).
- Prefer editing existing components; search/ blog/ folders already componentised — extend rather than fork.
- Mobile-first: most layouts have `md:` desktop variants; mobile overlays for search.
- Don't hardcode user-facing strings — add to both `messages/pl.json` and `messages/en.json` under correct namespace. Polish is the default locale, keep Polish copy authoritative.
- Don't add translatable content to `mockData.ts`; put it in `messages/*.json` and compose via `i18nData.ts` hooks.
- No test suite → when changing behaviour, run `next build` + manually exercise the route. Don't claim UI success without browser verification.
- Don't fix errors in files you didn't edit
