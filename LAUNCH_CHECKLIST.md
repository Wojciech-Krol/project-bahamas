# Hakuna — Launch Checklist

Operator checklist for flipping Hakuna from staging to production. Every item is a concrete action — no principles. Tick them off before the first real PLN touches the system.

## DNS + email

- [ ] Point apex A / AAAA records (and `www` CNAME) at the Vercel project.
- [ ] Add SPF record to the sending domain: `v=spf1 include:amazonses.com include:_spf.resend.com -all` (exact include depends on the Resend account — copy from the Resend dashboard).
- [ ] Add DKIM CNAMEs shown in the Resend "Domains" page (3 CNAME records).
- [ ] Add DMARC record: `_dmarc` TXT `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@hakuna.app`.
- [ ] Verify sending domain in Resend dashboard (status = Verified).
- [ ] Send a test email to a Gmail and a Outlook account; confirm no spam-folder hit + DKIM pass in the headers.

## Stripe

- [ ] Flip the Stripe dashboard from Test → Live.
- [ ] Confirm business details + bank account completed.
- [ ] Complete Stripe Connect platform review; ensure Express onboarding is enabled for Poland.
- [ ] Register webhook endpoint: `https://hakuna.app/api/webhooks/stripe` for events `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel env (Production).
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
- [ ] Configure Google OAuth provider in Supabase Auth with callback `https://hakuna.app/api/auth/callback`.
- [ ] Create the first admin user: sign up through the site, then run `update profiles set role='admin' where id='<user-uuid>';` in the SQL editor.

## Turnstile

- [ ] Create a Turnstile site in the Cloudflare dashboard for `hakuna.app`.
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
