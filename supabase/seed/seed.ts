/**
 * Hakuna dev seed — populates a Supabase project with the current mock
 * catalog so the marketing site keeps rendering identically once the
 * Phase 1b page-swap lands.
 *
 * Idempotent: every insert goes through a natural-key `upsert`, so the
 * script can be re-run after schema changes or data tweaks without
 * producing duplicates.
 *
 * Usage (operator):
 *   npx tsx supabase/seed/seed.ts
 *
 * Requires the service role key — never runs in the browser or in
 * request-handler code paths. It bypasses RLS, so treat any edit like
 * a migration.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { ACTIVITIES_DATA, REVIEWS_DATA } from "../../app/lib/mockData";

// ----------------------------------------------------------------------------
// env
// ----------------------------------------------------------------------------

function loadEnv(): { url: string; serviceRoleKey: string } {
  // Hard refusal: do not seed against a production project unless the
  // operator explicitly opts in. Seeding pollutes the partners table
  // with demo rows + creates real auth users for fake reviewers, which
  // is harmless in dev but a real cleanup nightmare on a live project.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SEED_FORCE !== "1"
  ) {
    console.error(
      [
        "Seed aborted: NODE_ENV=production.",
        "Refusing to seed against a production project.",
        "Set SEED_FORCE=1 to override (only do this for a fresh staging environment).",
      ].join("\n"),
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error(
      [
        "Seed aborted: missing Supabase env vars.",
        "Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        "Add them to .env.local at the project root, then re-run:",
        "  npx tsx supabase/seed/seed.ts",
      ].join("\n"),
    );
    process.exit(1);
  }
  return { url, serviceRoleKey };
}

// If the operator has `.env.local` but hasn't exported the vars into the
// shell, give tsx a nudge by loading the file ourselves. This is a minimal
// reader — no third-party dotenv dep needed.
async function preloadDotEnvLocal(): Promise<void> {
  const path = resolve(process.cwd(), ".env.local");
  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch {
    return; // file missing — rely on the ambient env.
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// ----------------------------------------------------------------------------
// locale message loading
// ----------------------------------------------------------------------------

type ActivityCopy = Partial<{
  title: string;
  description: string;
  location: string;
  neighborhood: string;
  duration: string;
  level: string;
  instructor: string;
  school: string;
}>;

type ReviewCopy = Partial<{
  name: string;
  text: string;
  activity: string;
}>;

type MessageBag = {
  activities?: Record<string, ActivityCopy>;
  reviews?: Record<string, ReviewCopy>;
};

async function loadLocaleMessages(): Promise<{ pl: MessageBag; en: MessageBag }> {
  const [plRaw, enRaw] = await Promise.all([
    readFile(resolve(process.cwd(), "messages/pl.json"), "utf8"),
    readFile(resolve(process.cwd(), "messages/en.json"), "utf8"),
  ]);
  return {
    pl: JSON.parse(plRaw) as MessageBag,
    en: JSON.parse(enRaw) as MessageBag,
  };
}

// ----------------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------------

/**
 * Turn the mock price strings (e.g. `"€12.00"`, `"Free"`, `"$120/Term"`,
 * `"$18/Drop-in"`, `"$45/Session"`) into `{ cents, currency }` for the DB.
 * Rules:
 *  - `Free` → 0 cents, keep preceding currency hint if any (else PLN).
 *  - Leading `€` → EUR; `$` → USD; `zł` suffix → PLN; anything else → PLN.
 *  - Integer part × 100 + minor digits (cents) parsed if present.
 */
function parsePrice(input: string): { cents: number; currency: string } {
  const s = (input ?? "").trim();
  let currency = "PLN";
  if (s.includes("€")) currency = "EUR";
  else if (s.includes("$")) currency = "USD";
  else if (/zł/i.test(s)) currency = "PLN";

  if (/free|darmo|bezpłat/i.test(s)) {
    return { cents: 0, currency };
  }

  const match = s.match(/(\d+)(?:[.,](\d{1,2}))?/);
  if (!match) return { cents: 0, currency };
  const major = Number.parseInt(match[1], 10);
  const minorRaw = match[2] ?? "0";
  const minor = Number.parseInt(minorRaw.padEnd(2, "0").slice(0, 2), 10);
  return { cents: major * 100 + minor, currency };
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .replace(/^school-/, "")
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function uuidFromNamespacedString(namespace: string, id: string): string {
  // Stable pseudo-UUID (v4-shaped) for seed idempotency. Not cryptographic —
  // we only need a deterministic 128-bit id per mock record so the upsert
  // on `id` stays stable across runs. The DB default (`gen_random_uuid()`)
  // is bypassed when we explicitly supply `id`.
  const src = `${namespace}::${id}`;
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < src.length; i++) {
    const c = src.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  // Layout: 8-4-4-4-12, version nibble 4, variant bits 10xx.
  const a = hex(h1);
  const b = hex(h2).slice(0, 4);
  const c = `4${hex(h1 ^ h2).slice(1, 4)}`;
  const d = `${((h2 & 0x3fff) | 0x8000).toString(16).padStart(4, "0")}`;
  const e = `${hex(h1 + h2)}${hex(h1 * 3 + 7).slice(0, 4)}`;
  return `${a}-${b}-${c}-${d}-${e.slice(0, 12)}`;
}

function pickCopy<T>(
  pl: Record<string, T> | undefined,
  en: Record<string, T> | undefined,
  id: string,
): { pl: T | null; en: T | null } {
  return { pl: pl?.[id] ?? null, en: en?.[id] ?? null };
}

function nonEmpty(s: string | null | undefined, fallback: string): string {
  return s && s.length > 0 ? s : fallback;
}

// ----------------------------------------------------------------------------
// seeders
// ----------------------------------------------------------------------------

const DEMO_PARTNER_SLUG = "hakuna-demo";

async function seedPartner(sb: SupabaseClient): Promise<string> {
  const payload = {
    name: "Hakuna Demo Partner",
    slug: DEMO_PARTNER_SLUG,
    status: "approved" as const,
    contact_email: "partners@hakuna.dev",
    city: "Warszawa",
    commission_rate_bps: 2000,
    subscription_tier: "none",
  };
  const { data, error } = await sb
    .from("partners")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(`Failed to upsert demo partner: ${error?.message ?? "no row"}`);
  }
  return data.id as string;
}

async function seedVenues(
  sb: SupabaseClient,
  partnerId: string,
): Promise<Map<string, string>> {
  const schoolIds = new Set<string>();
  for (const a of Object.values(ACTIVITIES_DATA)) {
    if (a.schoolId) schoolIds.add(a.schoolId);
  }

  const rows = Array.from(schoolIds).map((slug) => {
    const name = titleCaseFromSlug(slug);
    return {
      id: uuidFromNamespacedString("venue", slug),
      partner_id: partnerId,
      name,
      slug,
      description_i18n: {
        pl: `${name} — placeholder opisu siedziby. Wypełni treścią Phase 2 w panelu partnera.`,
        en: `${name} — placeholder venue description. Phase 2 partner dashboard will fill this in.`,
      },
      address: null,
      city: "Warszawa",
      hero_image: null,
      gallery: [],
      is_published: true,
    };
  });

  if (rows.length === 0) return new Map();

  const { data, error } = await sb
    .from("venues")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");
  if (error) {
    throw new Error(`Failed to upsert venues: ${error.message}`);
  }

  const bySlug = new Map<string, string>();
  for (const r of data ?? []) {
    bySlug.set(r.slug as string, r.id as string);
  }
  return bySlug;
}

async function seedActivities(
  sb: SupabaseClient,
  venueIdBySlug: Map<string, string>,
  messages: { pl: MessageBag; en: MessageBag },
): Promise<{ id: string; durationMin: number; currency: string }[]> {
  const activities = Object.values(ACTIVITIES_DATA);

  const rows = activities.flatMap((a) => {
    if (!a.schoolId) return [];
    const venueId = venueIdBySlug.get(a.schoolId);
    if (!venueId) return [];

    const plCopy = messages.pl.activities?.[a.id] ?? {};
    const enCopy = messages.en.activities?.[a.id] ?? {};
    const title_i18n = {
      pl: nonEmpty(plCopy.title, a.id),
      en: nonEmpty(enCopy.title, plCopy.title ?? a.id),
    };
    const description_i18n = {
      pl: nonEmpty(plCopy.description, ""),
      en: nonEmpty(enCopy.description, plCopy.description ?? ""),
    };

    const { cents, currency } = parsePrice(a.price);
    // Duration mock strings can be like "60 min" or "1 h 30 min"; if missing
    // on the copy bag, fall back to 60. We parse the PL copy since PL is the
    // project default.
    const durationStr = plCopy.duration ?? enCopy.duration ?? "";
    const durationMin = parseDurationMin(durationStr) ?? 60;

    return [
      {
        id: uuidFromNamespacedString("activity", a.id),
        venue_id: venueId,
        title_i18n,
        description_i18n,
        price_cents: cents,
        currency,
        duration_min: durationMin,
        level: plCopy.level ?? null,
        category: null, // TODO(phase-2): map mock category keys onto activities.category.
        age_group: null,
        hero_image: a.imageUrl,
        is_published: true,
      },
    ];
  });

  if (rows.length === 0) return [];

  const { data, error } = await sb
    .from("activities")
    .upsert(rows, { onConflict: "id" })
    .select("id, duration_min, currency");
  if (error) {
    throw new Error(`Failed to upsert activities: ${error.message}`);
  }

  return (data ?? []).map((r) => ({
    id: r.id as string,
    durationMin: r.duration_min as number,
    currency: r.currency as string,
  }));
}

function parseDurationMin(s: string): number | null {
  if (!s) return null;
  const h = s.match(/(\d+)\s*h/i);
  const m = s.match(/(\d+)\s*min/i);
  if (!h && !m) {
    const n = s.match(/(\d+)/);
    return n ? Number.parseInt(n[1], 10) : null;
  }
  return (h ? Number.parseInt(h[1], 10) * 60 : 0) + (m ? Number.parseInt(m[1], 10) : 0);
}

async function seedSessions(
  sb: SupabaseClient,
  activities: { id: string; durationMin: number }[],
): Promise<number> {
  const now = new Date();
  const offsets: { days: number; hour: number }[] = [
    { days: 1, hour: 7 },
    { days: 3, hour: 18 },
    { days: 7, hour: 10 },
  ];

  const rows = activities.flatMap((a) =>
    offsets.map((off) => {
      const starts = new Date(now);
      starts.setUTCDate(starts.getUTCDate() + off.days);
      starts.setUTCHours(off.hour, 0, 0, 0);
      const ends = new Date(starts.getTime() + a.durationMin * 60 * 1000);
      return {
        activity_id: a.id,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        capacity: 20,
        spots_taken: Math.floor(Math.random() * 16),
        status: "scheduled" as const,
        pos_provider: "manual" as const,
        pos_external_id: starts.toISOString(),
      };
    }),
  );

  if (rows.length === 0) return 0;

  const { error, count } = await sb
    .from("sessions")
    .upsert(rows, {
      onConflict: "activity_id,pos_external_id",
      count: "exact",
    });
  if (error) {
    throw new Error(`Failed to upsert sessions: ${error.message}`);
  }
  return count ?? rows.length;
}

async function ensureReviewer(
  sb: SupabaseClient,
  reviewId: string,
  fullName: string,
): Promise<string> {
  const email = `seed-reviewer+${reviewId}@hakuna.dev`;

  // `listUsers` is paginated; we check the first page for the email. With
  // only 6 seed reviewers this is fine; bump the page size if needed.
  const { data: existing, error: listErr } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    throw new Error(`Failed to list auth users: ${listErr.message}`);
  }
  const found = existing?.users?.find((u) => u.email === email);
  if (found) {
    // Make sure the profile row reflects the seed name (trigger may have set
    // full_name to null if metadata was empty on a previous run).
    await sb
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", found.id);
    return found.id;
  }

  const { data, error } = await sb.auth.admin.createUser({
    email,
    email_confirm: true,
    password: `seed-${reviewId}-${Math.random().toString(36).slice(2, 10)}`,
    user_metadata: { full_name: fullName, seed: true },
  });
  if (error || !data?.user) {
    throw new Error(`Failed to create seed reviewer ${email}: ${error?.message ?? "no user"}`);
  }
  // Profile row is created by the `handle_new_user` trigger. Backfill
  // `full_name` in case metadata wasn't picked up (the trigger reads
  // `raw_user_meta_data ->> 'full_name'`).
  await sb
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", data.user.id);
  return data.user.id;
}

async function seedReviews(
  sb: SupabaseClient,
  anchorActivityId: string,
  anchorVenueId: string,
  messages: { pl: MessageBag; en: MessageBag },
): Promise<number> {
  const rows: {
    id: string;
    venue_id: string;
    activity_id: string;
    author_id: string;
    rating: number;
    text: string;
  }[] = [];

  for (const [id, base] of Object.entries(REVIEWS_DATA)) {
    const copy = pickCopy(messages.pl.reviews, messages.en.reviews, id);
    const name = copy.pl?.name ?? copy.en?.name ?? `Reviewer ${id}`;
    const text = copy.pl?.text ?? copy.en?.text ?? "";
    const authorId = await ensureReviewer(sb, id, name);
    rows.push({
      id: uuidFromNamespacedString("review", id),
      venue_id: anchorVenueId,
      activity_id: anchorActivityId,
      author_id: authorId,
      rating: base.rating,
      text,
    });
  }

  if (rows.length === 0) return 0;

  const { error } = await sb.from("reviews").upsert(rows, { onConflict: "id" });
  if (error) {
    throw new Error(`Failed to upsert reviews: ${error.message}`);
  }
  return rows.length;
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main(): Promise<void> {
  await preloadDotEnvLocal();
  const { url, serviceRoleKey } = loadEnv();

  const sb = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const messages = await loadLocaleMessages();

  console.log("→ Seeding demo partner …");
  const partnerId = await seedPartner(sb);

  console.log("→ Seeding venues …");
  const venueIdBySlug = await seedVenues(sb, partnerId);

  console.log("→ Seeding activities …");
  const activities = await seedActivities(sb, venueIdBySlug, messages);

  console.log("→ Seeding sessions (3 per activity) …");
  const sessionCount = await seedSessions(sb, activities);

  console.log("→ Seeding reviews …");
  const anchor = activities[0];
  const anchorVenueId = Array.from(venueIdBySlug.values())[0];
  let reviewCount = 0;
  if (anchor && anchorVenueId) {
    reviewCount = await seedReviews(sb, anchor.id, anchorVenueId, messages);
  } else {
    console.warn("  Skipped reviews — no anchor activity/venue available.");
  }

  console.log("\nSeed complete:");
  console.log(`  partners:   1`);
  console.log(`  venues:     ${venueIdBySlug.size}`);
  console.log(`  activities: ${activities.length}`);
  console.log(`  sessions:   ${sessionCount}`);
  console.log(`  reviews:    ${reviewCount}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
