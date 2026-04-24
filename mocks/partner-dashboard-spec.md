# Hakuna Partner Dashboard — Specification

Companion document to `partner-dashboard-mockups.html`. This covers the parts a mockup can't show: routes, data model, permissions, and rollout.

---

## 1. What problem this solves

The current site has a "For venues" CTA and a business beta signup form. That's it. Partners have no way to self-serve — which means every change to a class, teacher, price, or photo goes through an email to the Hakuna team. That doesn't scale past ~30 studios.

The partner dashboard is the backstage for the public `/school/[id]` page and everything flowing from it. It should feel like the rest of Hakuna (warm, editorial, confident) — not like a generic SaaS admin panel in a different skin.

---

## 2. Information architecture

All partner routes live under `/partner` and share a persistent left sidebar.

```
/partner/login                 Sign in
/partner                       Overview (default landing)
/partner/classes               List
/partner/classes/new           Create (drawer)
/partner/classes/[id]          Edit (drawer)
/partner/instructors           Roster
/partner/instructors/[id]      Instructor detail
/partner/bookings              All participants across classes
/partner/bookings/[classId]    Participants for one class
/partner/reviews               Inbox of reviews (with reply)
/partner/insights              Revenue, trends, cohort views
/partner/venue                 Public profile editor
/partner/payouts               Financial summary + upcoming payouts
/partner/settings              Account, team, billing, integrations
```

Six screens are mocked up; the rest follow the same layout grammar (sidebar + warm white main column + editorial cards).

---

## 3. Data model

These entities extend what already exists in `mockData.ts`. The public types stay what students see; partner-only fields are marked `// admin`.

### Venue (extends `SchoolBase`)

```ts
type Venue = {
  id: string;
  slug: string;                    // used for /school/[slug]
  name: string;
  tagline: string;
  about: string;                   // 500 char max
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    neighborhoodIds: string[];     // foreign keys
    lat: number;
    lng: number;
  };
  heroImage: string;               // URL
  gallery: string[];               // URLs, max 12
  logo?: string;
  rating: number;                  // derived
  reviewCount: number;             // derived

  stats: Array<{ value: string; label: string }>;  // editable 3-strip

  // admin
  status: "draft" | "published" | "archived";
  contactEmail: string;
  phone?: string;
  taxId?: string;
  payoutMethod?: "stripe" | "bank";
};
```

### Class (extends `ClassBase`)

```ts
type Class = {
  id: string;
  venueId: string;
  title: string;
  description: string;
  imageUrl: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
  ageGroup: "kids" | "teens" | "adults" | "all";
  durationMinutes: number;
  capacity: number;
  room: string;                    // e.g. "Studio 1"

  // scheduling
  scheduleType: "recurring" | "one_off" | "term";
  recurringDays?: Array<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun">;
  startTime?: string;              // "18:00"
  oneOffDates?: string[];          // ISO datetimes

  // pricing
  price: number;
  currency: "EUR" | "GBP" | "PLN";
  pricingModel: "per_class" | "per_session" | "per_term" | "drop_in";

  // assignment
  primaryInstructorId: string;
  backupInstructorIds: string[];

  // admin
  status: "draft" | "published" | "archived";
  tag?: "popular" | "new" | "featured";  // set by admin or auto
  createdAt: string;
  updatedAt: string;
};
```

### Instructor

```ts
type Instructor = {
  id: string;
  venueId: string;
  userId?: string;                 // nullable — instructor may not have a login
  name: string;
  bio: string;
  avatar: string;
  role: string;                    // "Lead instructor"
  specialties: string[];           // ["contemporary", "urban"]
  credentials: Array<{
    icon: string;                  // material symbol name
    label: string;                 // "Best Choreographer 2023"
  }>;
  verified: boolean;               // set by Hakuna team after review

  // admin
  status: "invited" | "active" | "inactive";
  inviteEmail?: string;
  inviteSentAt?: string;
};
```

### Booking

```ts
type Booking = {
  id: string;
  classId: string;
  sessionDate: string;             // ISO — one specific occurrence
  userId: string;
  guestName?: string;              // for walk-ins
  guestEmail?: string;
  status: "confirmed" | "waitlist" | "cancelled" | "attended" | "no_show";
  paidAmount: number;
  createdAt: string;
};
```

### Review (extends existing reviews)

```ts
type Review = {
  id: string;
  venueId: string;
  classId?: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;

  // admin
  partnerReply?: {
    text: string;
    repliedAt: string;
    repliedBy: string;             // partner user id
  };
};
```

### Partner user (auth)

```ts
type PartnerUser = {
  id: string;
  email: string;
  name: string;
  venueIds: string[];              // users can belong to multiple venues
  role: "owner" | "manager" | "instructor" | "viewer";
  createdAt: string;
  lastLoginAt: string;
};
```

---

## 4. Permissions

Four roles map to the capabilities partners need:

| Capability                    | Owner | Manager | Instructor | Viewer |
|-------------------------------|:-----:|:-------:|:----------:|:------:|
| View overview & insights      | ✓     | ✓       | ✓          | ✓      |
| Create / edit / delete classes| ✓     | ✓       | —          | —      |
| Edit own instructor profile   | ✓     | ✓       | ✓ (self)   | —      |
| Invite/remove instructors     | ✓     | ✓       | —          | —      |
| Reply to reviews              | ✓     | ✓       | ✓ (own)    | —      |
| Edit venue profile            | ✓     | ✓       | —          | —      |
| Access payouts & billing      | ✓     | —       | —          | —      |
| Invite other partner users    | ✓     | —       | —          | —      |
| Delete venue                  | ✓     | —       | —          | —      |

An instructor who only teaches (no admin role) uses the dashboard to see their own schedule, reply to reviews about their classes, and update their bio — nothing else.

---

## 5. API surface

Next.js Route Handlers under `/api/partner/*`. Every route requires an authenticated session and checks `venueId` ownership plus role.

```
POST   /api/partner/auth/login         → session cookie
POST   /api/partner/auth/logout

GET    /api/partner/venue              → current venue
PATCH  /api/partner/venue              → update venue fields
POST   /api/partner/venue/media        → signed upload URL for hero/gallery

GET    /api/partner/classes            → list (with filters)
POST   /api/partner/classes            → create
GET    /api/partner/classes/:id
PATCH  /api/partner/classes/:id
DELETE /api/partner/classes/:id
POST   /api/partner/classes/:id/duplicate

GET    /api/partner/instructors
POST   /api/partner/instructors/invite
PATCH  /api/partner/instructors/:id
DELETE /api/partner/instructors/:id
POST   /api/partner/instructors/:id/resend-invite

GET    /api/partner/bookings?classId=&from=&to=
PATCH  /api/partner/bookings/:id       → change status (attended, no-show)

GET    /api/partner/reviews?status=needs_reply
POST   /api/partner/reviews/:id/reply

GET    /api/partner/insights?range=7d|30d|90d
GET    /api/partner/payouts
```

All mutations should respond with the full updated entity so the client can reconcile without a re-fetch.

---

## 6. Tech recommendations

The codebase is already:
- Next.js (App Router, per `AGENTS.md` it's a newer internal version)
- `next-intl` for i18n (`en` and `pl`)
- Tailwind v4 with the `@theme` block in `globals.css`
- Mapbox for maps
- Mock data in `app/lib/mockData.ts`, component library in `app/components/`

Keep going in the same direction:

**Auth** — Use a session-cookie approach (Auth.js / NextAuth, or Lucia if something lighter is preferred). Skip email/password-only login and add a magic-link option from day one — partners forget passwords constantly and studios often share a laptop at the front desk.

**Database** — Postgres with Prisma or Drizzle. The entities above map cleanly to relational tables. Keep images in object storage (R2, S3) and store only URLs.

**Server Actions vs API routes** — For form submissions (profile edits, class saves), use Server Actions. They pair with the optimistic UI the mockups imply ("Saved just now" right after a blur event). Reserve API routes for things that need to be consumed from outside the dashboard (webhooks, mobile apps later).

**Component reuse** — The mockups lean heavily on this: the editor's "live preview" panel should literally import and render the same `ClassCard` and school hero components the public site uses. Set up a `components/public/` folder that both the marketing pages and partner previews read from. Never ship two versions of the same card — they will drift.

**i18n** — Add a `Partner` namespace to `messages/en.json` and `messages/pl.json` from day one. Polish partners in Wrocław shouldn't get an English-only dashboard; the brand promises local-first.

**Rendering** — Every partner route can be a client component since it's behind auth and heavily interactive. Don't over-engineer RSC boundaries here.

---

## 7. Design tokens already in the system

The mockups use these existing tokens from `app/globals.css` — no new ones needed:

- Surfaces: `--color-surface` (cream), `--color-surface-container-lowest` (white), `--color-surface-container-low` (warm off-white), `--color-surface-container-high` (slightly deeper)
- Brand: `--color-primary` (#b40f55), `--color-primary-fixed` (soft pink), `--color-secondary` (amber), `--color-secondary-container`
- Typography: `--font-headline` (Plus Jakarta Sans), `--font-body` (Be Vietnam Pro)
- Radii: 1rem default, 2rem (lg), 3rem (xl)
- Shadow: the `.editorial-shadow` utility
- Border color for cards: `#FAEEDA` — already used on `ActivityRowCard`

New things the dashboard needs that are worth adding as shared utilities:

```css
.partner-sidebar-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl
         text-on-surface/80 font-medium text-sm
         hover:bg-primary-fixed/30 hover:text-primary
         transition-colors;
}

.partner-sidebar-link[aria-current="page"] {
  @apply bg-primary text-on-primary font-semibold hover:bg-primary hover:text-on-primary;
}

.metric-card {
  @apply bg-surface-container-lowest rounded-2xl p-5 border border-[#FAEEDA] editorial-shadow;
}

.form-input {
  @apply w-full px-4 py-3 bg-surface-container-low
         border border-outline-variant/50 rounded-xl
         focus:outline-none focus:border-primary
         font-medium transition-colors;
}
```

---

## 8. Rollout plan

A sensible order to ship in — each phase delivers something usable:

**Phase 1 — Self-serve profile (2 weeks)**
Sign-in, venue profile editor, read-only class list, read-only instructor list. Partners can log in and keep their public page accurate without emailing the Hakuna team.

**Phase 2 — Class CRUD (2 weeks)**
Full class editor (create / edit / duplicate / archive), instructor invite flow, assignment. This removes the biggest operational bottleneck.

**Phase 3 — Operations (2 weeks)**
Overview page with real metrics, booking list, review reply. Partners can now run their week from the dashboard.

**Phase 4 — Money & insights (3 weeks)**
Payouts, insights page, Stripe Connect, team roles. Turns it from a utility into a business tool.

Mobile responsive work happens in parallel — every screen needs to collapse the sidebar into a bottom drawer and stack the editor layouts. The public site already has strong mobile patterns (see `MobileActivityCarousel`, the mobile search pill) to borrow from.

---

## 9. Open questions worth answering before building

- **Instructor-as-user vs instructor-as-record.** Should every instructor get a login, or can a studio owner manage teachers as records without inviting them? Recommendation: support both — invite is optional.
- **Multi-venue partners.** The sidebar shows a venue switcher. Does the data model need a "franchise" concept, or is the `venueIds[]` array on `PartnerUser` enough? Recommendation: start with the array, add franchise grouping only when a real chain asks.
- **Pricing models.** The public site currently shows `€22/class`, `$45/Session`, `$120/Term`, `$18/Drop-in`. How many of these are real vs. mock copy? That determines whether the class editor needs a simple price field or a proper pricing-model picker.
- **Cancellation policy & no-show handling.** Referenced on the public page (`freeCancel: "Free cancellation up to 48 hours before class."`). Should this be editable per-class or venue-wide?
- **Reviews moderation.** Can partners flag reviews for removal, or only reply? Recommendation: reply-only for now; flag-to-Hakuna as a later feature.

Answer these and the spec locks. Until then, phase 1 can ship without them.
