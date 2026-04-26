# Hakuna — Code Review Findings

Walked phases 0 → 6 + the auth-fix branch (`fix/auth-confirm-flow`) commit by
commit. Tip is `phase/6-hardening` + `fix/auth-confirm-flow`. Build green
(71/71), Vitest green (24/24).

Findings sorted by severity. **HIGH** = ship-blockers or security risks.
**MEDIUM** = real bugs that surface under specific conditions. **LOW** =
hygiene / future cleanup.

Smoke test against running dev server (Supabase env empty), captured during
review:

```
GET /                              307   (intl redirect → /pl)
GET /pl                            200   ✓
GET /pl/login                      200   ✓
GET /pl/signup                     200   ✓
GET /pl/admin                      500   ✗ HIGH (issue #1)
GET /pl/account                    307   (redirect → /pl/login)
GET /pl/partner                    200   ✓
GET /pl/partner/payments           200   ✓
GET /pl/partners/apply             200   ✓
GET /api/health                    503   (by design — no Supabase)
GET /api/cron/expire-bookings      503   ✓ (env guard)
POST /api/webhooks/stripe          503   ✓ (env guard)
```

---

## HIGH — fix before flipping any switch

### 1. `/pl/admin` 500 crash without Supabase configured

`app/[locale]/(dashboard)/layout.tsx:31` calls `getCurrentUser()` without
try/catch. When `NEXT_PUBLIC_SUPABASE_URL` is unset, `createClient()`
throws and Next surfaces 500. Marketing routes degrade gracefully via
explicit env checks; this layout doesn't.

**Fix:** wrap in try/catch; on throw, `notFound()`. Same pattern already
used by `app/[locale]/account/page.tsx:23-27`.

```ts
let current;
try {
  current = await getCurrentUser();
} catch {
  notFound();
}
const role = current?.profile?.role as string | undefined;
if (!current || role !== "admin") notFound();
```

### 2. OAuth callback open-redirect

`app/api/auth/callback/route.ts:17` reads `?next=...` and redirects to it
unconditionally. `https://hakuna.app/api/auth/callback?next=https://evil.com/x`
hands the just-authenticated user to `evil.com`. Same vector exists in
`fix/auth-confirm-flow`'s `signupAction` because it builds the
`emailRedirectTo` from `${origin}/api/auth/callback?next=/${locale}` —
the operator-controlled `?next` is fine, but a phishing campaign could
craft email-confirmation links.

**Fix:** validate `next` is a relative path starting with `/{locale}` and
not `//` (protocol-relative). Reject anything that parses as an absolute
URL.

```ts
function safeNext(raw: string | null, locale: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return `/${locale}`;
  }
  // Reject absolute URLs disguised as paths.
  try {
    new URL(raw, "http://localhost");
  } catch {
    return `/${locale}`;
  }
  return raw;
}
```

### 3. Reviews can't show author name / avatar to anyone but the author

Migration 0001's `profiles_select_own` policy:

```sql
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
```

`src/lib/db/queries/reviews.ts` joins `profiles` to compose
`Review.{name, avatar}`. Under the request-scoped client (anon or
authenticated user), the JOIN succeeds but every row's `profiles`
embed comes back null because RLS filters out non-self rows. Reviews
will display blank "anonymous" everywhere.

**Fix options:**

- **A** (simplest): create a second policy `profiles_select_public`
  granting SELECT on the row when `true`. This leaks `role` + `locale`
  too, which isn't great.
- **B** (recommended): create a `public_profiles` VIEW exposing only
  `(id, full_name, avatar_url)` with `WITH (security_invoker = false)`
  and grant SELECT to `anon, authenticated`. Update
  `getReviews`'s embedded select to `author:public_profiles`.
- **C**: denormalize `reviewer_name` + `reviewer_avatar_url` onto
  `reviews` at insert time, drop the join. Preserves privacy of role.

### 4. Phase 4 analytics views inherit RLS from view OWNER, not caller

Postgres views default to running as their owner. `partner_daily_revenue`,
`activity_conversion`, `session_occupancy` are created without
`security_invoker`. Result: **every authenticated user can read every
partner's revenue, conversion and occupancy via the views**, regardless
of the table-level RLS policies the migration carefully wrote.

The migration's own comment is wrong:

> "all three views intentionally inherit rls from their underlying tables.
>  a partner member sees only their own bookings / view_events because the
>  row-level policies on bookings + view_events + venues filter before the
>  view's aggregation runs."

That's only true with `security_invoker=true`, which is missing.

**Fix (Postgres 15+):**

```sql
create or replace view public.partner_daily_revenue
  with (security_invoker = true) as ...

create or replace view public.activity_conversion
  with (security_invoker = true) as ...

create or replace view public.session_occupancy
  with (security_invoker = true) as ...
```

Add as migration `0006_views_security_invoker.sql`. Also do this for
`venue_rankings` in 0002 (less sensitive — boolean flags only — but
still leaks "which venues have active boosts" globally).

### 5. GDPR deletion cron will fail on first real user

`migrations/0001_initial.sql:154`:

```sql
user_id uuid not null references auth.users(id) on delete restrict
```

`process-account-deletions/route.ts:83` does:

```ts
await admin.from("bookings").update({ user_id: null }).eq("user_id", userId);
```

This violates `NOT NULL`. Then step 4 calls `auth.admin.deleteUser` which
fails because of the `ON DELETE RESTRICT` constraint (bookings still
reference the user).

**Fix:** add migration `0006` (or whatever number is free):

```sql
alter table public.bookings
  alter column user_id drop not null;

alter table public.bookings
  drop constraint bookings_user_id_fkey,
  add constraint bookings_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete set null;
```

After this, the cron can either NULL user_id manually or rely on the
`ON DELETE SET NULL` to do it during user deletion (preferred —
simplifies the cron). Same review needed for `reviews.author_id` (also
`NOT NULL` + `ON DELETE CASCADE`, which means user delete cascades and
wipes reviews — that's fine if the cron's explicit "delete reviews"
step is removed).

### 6. POS encrypted config insert may corrupt the bytea column

`integrations/actions.ts:250` calls:

```ts
.upsert({ ..., config_encrypted: encrypted, ... })
```

where `encrypted` is a `Buffer` returned by `encryptConfig`. Supabase JS
ships requests as JSON. A `Buffer` becomes `{"type":"Buffer","data":[...]}`
when serialized — Postgres will not accept this as a `bytea` value. The
upsert either errors out (best case) or stores the JSON-stringified array
literal as text (worst case — silent corruption that fails on first
decrypt with a confusing error).

**Verify:** run a real upsert against a Supabase project, then query
`select octet_length(config_encrypted) from pos_integrations` — if the
length doesn't match `iv(12) + tag(16) + ciphertext(N)`, this is the bug.

**Fix:** encode at the boundary. PostgREST accepts `bytea` as the
literal `\x`-prefixed hex string in JSON:

```ts
const encryptedHex = "\\x" + encrypted.toString("hex");
.upsert({ ..., config_encrypted: encryptedHex, ... })
```

Tests `tests/posCrypto.spec.ts` only round-trip Buffers in memory — they
can't catch this transport-layer issue. Add an integration test that
inserts and reads back through Supabase JS once a project is configured.

---

## MEDIUM — degrade or break under load / partial failure

### 7. `proxy.ts` swallows no errors on Supabase auth refresh

```ts
await supabase.auth.getUser();
```

If the Supabase auth API is unreachable (regional outage, DNS hiccup,
`getUser()` thrown for any reason), every page request throws and the
whole site goes down — not just auth-dependent paths.

**Fix:** wrap in try/catch and log; cookies stay stale for one
request-cycle, but the site continues serving.

### 8. Webhook idempotency race

`app/api/webhooks/stripe/route.ts:99-128`:

```ts
await admin.from("webhook_events").insert({...});
// ignore 23505
const { data: existing } = await admin
  .from("webhook_events")
  .select("processed_at")
  .eq("provider", "stripe").eq("external_id", event.id)
  .maybeSingle();
if (existing?.processed_at) return ok;
// proceed
```

Two concurrent deliveries (Stripe rarely retries that fast, but
`@stripe/cli forward` during tests does):

- Thread A: insert succeeds. Reads `processed_at = null`. Proceeds.
- Thread B: insert fails 23505. Reads `processed_at = null`. Proceeds.

Both run handlers; both attempt the spots increment. Optimistic
concurrency on `spots_taken` saves the day for booking confirmation,
but the email-send + attribution-upsert run twice in the worst case.

**Fix:** insert with returning, only proceed if you actually inserted
the row. Or use a Postgres advisory lock keyed on `event.id` for the
duration of the handler.

```ts
const { data: claim, error } = await admin
  .from("webhook_events")
  .insert({...})
  .select("id")
  .maybeSingle();
if (!claim) {
  // someone else owns this event — they'll process it
  return ok;
}
// proceed exclusively
```

### 9. `startSubscriptionCheckout` crashes when Stripe not configured

`app/[locale]/partner/(shell)/plans/actions.ts:148`:

```ts
const stripe = getStripe();   // throws if STRIPE_SECRET_KEY unset
```

No try/catch. User clicking Upgrade with Stripe unconfigured gets a
generic Next error overlay (dev) or a 500 (prod).

**Fix:** wrap, redirect to `?error=stripe_not_configured`. Same pattern
as `promoteBoost` already does.

### 10. `cancelBooking` spots_taken decrement race

`bookingActions.ts:536-553` reads then writes — two concurrent cancels
race. Both read `spots_taken = 7`, both write `6`. Counter ends at 6
when it should be 5.

**Fix:** Postgres expression via RPC. Add a function:

```sql
create or replace function public.decrement_spots(s_id uuid)
returns int language sql security definer as $$
  update public.sessions
     set spots_taken = greatest(0, spots_taken - 1)
   where id = s_id
   returning spots_taken;
$$;
```

Then `admin.rpc('decrement_spots', { s_id })`.

Same fix could simplify the webhook's `+1` path (replace the
read-then-write CAS with `increment_spots`). The current CAS is correct
(rejects writes when full), but consolidating keeps the logic in one place.

### 11. Turnstile no-op silently ships to prod

`src/lib/turnstile.ts:52-60`: if `TURNSTILE_SECRET_KEY` is missing,
`verifyTurnstile` returns `{ success: true }` and logs once. In prod,
that means **no bot protection on `/partners/apply`** if the operator
forgot the key.

**Fix:** in production, fail closed. Either:

- `if (process.env.NODE_ENV === "production" && !key) throw`, OR
- gate the no-op behind `NEXT_PUBLIC_TURNSTILE_DEV_BYPASS=1` so the
  fallback is opt-in.

### 12. `RESEND_FROM_EMAIL` validator too strict

`src/env.ts:54`:

```ts
RESEND_FROM_EMAIL: z.string().email().optional(),
```

Resend accepts `Hakuna <noreply@hakuna.app>` for branded From — that's
NOT a valid `email`. If the operator follows Resend's own docs, env
validation throws at startup.

**Fix:** loosen to `z.string().min(1).optional()` or write a small
RFC-5322-ish refine that accepts both shapes.

---

## LOW — hygiene, polish, and future-you

### 13. `requestAccountDeletion` redirect drops locale

`app/[locale]/account/actions.ts:32`:

```ts
redirect("/login");   // not /${locale}/login
```

Proxy then redirects to `/pl/login`. Works but adds a hop. Pass locale
from formData.

### 14. Cookie consent cookie missing `Secure` flag in prod

`CookieConsent.tsx:30`:

```ts
document.cookie = `${CONSENT_COOKIE_NAME}=${...}; Max-Age=...; Path=/; SameSite=Lax`;
```

Add `; Secure` when `window.location.protocol === "https:"`.

### 15. `stripe_payment_id` overloaded between checkout-session-id and payment-intent-id

`promote/actions.ts:354` writes `checkoutSession.id` to `stripe_payment_id`.
Webhook later overwrites with `payment_intent.id`. Different identifiers,
same column. Cosmetic — rename to `stripe_reference_id` and document, or
add a separate `stripe_checkout_session_id` column.

### 16. `handle_new_user` trigger ignores `locale` metadata

Patched `signupAction` passes `locale` in user metadata, but the trigger
in 0001 only reads `full_name` + `avatar_url`. Profile defaults to `'pl'`
even for English signups.

**Fix:** update trigger in a new migration:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, locale)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'locale', ''), 'pl')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
```

### 17. `bookingActions.createBooking` instantiates three Supabase clients per call

`getCurrentUser` → request-scoped #1.
`createClient()` for session lookup → request-scoped #2.
`createAdminClient()` for attribution + insert → admin #3.

Functionally fine, mildly wasteful. Reuse the request-scoped client
returned indirectly by `getCurrentUser` (refactor it to return `{ user,
profile, supabase }`).

### 18. `account_deletion_queue` PRIMARY KEY (user_id) — can't re-request after cancel

If we ever add an "undo deletion" flow (`processed_at IS NOT NULL` so the
queue row stays around), a fresh request from the same user will
conflict on PK. The current `requestAccountDeletion` upserts with
`ignoreDuplicates: true`, which preserves the original `requested_at`
even on re-request — meaning a user can never extend or reset their
deletion window. Document or add a "re-request resets the timer" path.

### 19. `/api/health` always 503 pre-launch

By design (Supabase required). Means the endpoint can't be wired into
monitoring during the pre-launch period. Document; or special-case
`NODE_ENV !== "production"` to return 200 with `db: "not_configured"`.

### 20. CSP `script-src 'unsafe-inline'`

Documented in `next.config.ts`. Required for Next's RSC bootstrap inline
scripts. Tighten to nonce-based CSP later — non-trivial.

### 21. Search neighborhood filter is a no-op

`src/lib/db/queries/activities.ts:284`:

```ts
query = query.ilike("venues.city", `%${filters.neighborhood.trim()}%`);
```

Without `!inner` on the venue join, PostgREST applies the filter to the
embedded resource only — activities still return, but with `venue: null`
when the city doesn't match. Activities don't get filtered, which is
the opposite of the intent.

**Fix:**

```ts
.select(`..., venue:venues!inner (...)`)
```

(in addition to the filter). This is the same `!inner` pattern already
used in `bookingActions.ts`.

### 22. POS `disconnectCsv` doesn't clean up storage object

Removes `pos_integrations` row but leaves `pos-uploads/{partner_id}/latest.csv`
behind. Cosmetic — re-upload overwrites — but stale data lingers. Add
`admin.storage.from('pos-uploads').remove([${partnerId}/latest.csv])`.

### 23. `is_partner_member` / `is_admin` execute privilege

Both helpers are `SECURITY DEFINER` but no explicit
`revoke execute from public; grant execute to authenticated, service_role;`.
With the public schema's default privileges this is fine on Supabase
(PostgREST exposes `authenticated` only), but worth tightening if any
other role gets shipped later.

### 24. `proxy.ts` `intl(request) as NextResponse`

`createIntlMiddleware` can return `Response` (not `NextResponse`). The
cast is technically lossy. In practice next-intl always returns a
`NextResponse`, but a future version could break us. Use the raw `Response`
and only call `.cookies.set(...)` if it's a `NextResponse` (instanceof
guard), or import `NextResponse.next()` as a fallback.

### 25. Reviewer accounts created by seed are real auth users

`supabase/seed/seed.ts` calls `auth.admin.createUser` for each mock
reviewer. Those users get email `seed-reviewer+{id}@hakuna.dev`. They're
real users with real passwords (whatever the seed sets). After running
seed in prod by mistake you'd have orphan accounts. Add a guard at the
top of seed:

```ts
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed against production. Set SEED_FORCE=1 to override.");
  if (!process.env.SEED_FORCE) process.exit(1);
}
```

### 26. `/api/health` open without auth

Information leak (which services are down). Low risk, but health probes
are usually behind a Vercel-internal auth header (`x-vercel-source`). Or
gate behind `Authorization: Bearer ${HEALTH_PROBE_SECRET}`.

---

## Cross-cutting observations

**Build resilience:** every code path that can throw on missing env was
checked. The only crash path I found is `/pl/admin` (#1). Everything
else returns 503/redirects/renders empty.

**Type safety:** the Supabase generated `Database` type is not yet
wired. Most queries use ad-hoc `type Row = {...}` and casts. Once 0001
is applied, run `supabase gen types typescript --local > src/lib/db/database.types.ts`
and replace the casts with `client<Database>`. Will surface several
silent mistakes (e.g. wrong JSONB path strings).

**Tests cover the pure stuff (commission, CSV parse, GCM round-trip)
but nothing that crosses the Supabase or Stripe wire.** Once a real
project exists, add at least one integration test per:

- `pos_integrations.config_encrypted` round-trip (covers #6)
- end-to-end booking with overbook race (covers #8 + the spots CAS)
- GDPR delete cron against a seeded user (covers #5)

**RLS soundness:** the policies are well-scoped *for tables*, but the
**view layer is unprotected** (#4). That's the single biggest data-leak
risk in the current shape.

---

## Recommended fix order (suggested branch: `fix/review-findings`)

1. #1 admin layout guard (5 LOC)
2. #2 OAuth open-redirect validator (10 LOC, single helper)
3. #4 + #3 single migration `0006_secure_views_and_profiles.sql` —
   `with (security_invoker = true)` on all four views, plus
   `public_profiles` view + grant for review author display.
4. #5 migration `0007_bookings_user_nullable.sql` — drop NOT NULL +
   change FK to SET NULL.
5. #6 hex-encode bytea before upsert in `integrations/actions.ts`.
6. #7 try/catch in `proxy.ts`.
7. #8 webhook claim-or-skip pattern.
8. #9 + #11 + #12 small env / fallback hardening.
9. Everything LOW as a follow-up cleanup PR.

Total work: ~2 focused half-days, plus integration tests once Supabase
is online.
