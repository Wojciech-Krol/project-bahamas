/**
 * Demo user seed — creates a known-credentials test account with
 * bookings + favorites so the /account dashboard, /account/bookings,
 * /account/favorites views render with content.
 *
 * Idempotent: re-runnable. Reads the demo user by email; updates if
 * present, creates otherwise. Bookings/favorites use upsert by natural
 * keys so re-runs don't pile up duplicates.
 *
 * Pre-reqs:
 *   1. Combined migration 0013–0017 already applied (favorites table).
 *   2. Main seed has run (`npx tsx supabase/seed/seed.ts`) so the demo
 *      partner + activities + sessions exist.
 *
 * Usage (operator):
 *   npx tsx supabase/seed/demo_user.ts
 *
 * Demo credentials:
 *   email:    demo@hakuna.dev
 *   password: HakunaDemo2026!
 *
 * Bypass production guard same as the main seed (SEED_FORCE=1).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// tsx doesn't auto-load .env.local. Mirror the minimal reader from
// seed.ts so this script Just Works for an operator who only has the
// vars in their dotfile.
async function preloadDotEnvLocal(): Promise<void> {
  const path = resolve(process.cwd(), ".env.local");
  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch {
    return;
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

const DEMO_EMAIL = "demo@hakuna.dev";
const DEMO_PASSWORD = "HakunaDemo2026!";
const DEMO_NAME = "Demo Tester";
const DEMO_LOCALE = "pl";

const FAVORITE_LIMIT = 4;
const BOOKING_LIMIT = 3;

function loadEnv(): { url: string; serviceRoleKey: string } {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SEED_FORCE !== "1"
  ) {
    console.error(
      "Seed aborted: NODE_ENV=production. Set SEED_FORCE=1 to override.",
    );
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.",
    );
    process.exit(1);
  }
  return { url, serviceRoleKey };
}

async function ensureDemoUser(sb: SupabaseClient): Promise<string> {
  const { data: existing, error: listErr } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);
  const found = existing?.users?.find((u) => u.email === DEMO_EMAIL);

  if (found) {
    // Reset password to the documented value so the credentials are
    // always valid for the operator running the seed.
    await sb.auth.admin.updateUserById(found.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME, locale: DEMO_LOCALE, demo: true },
    });
    await sb
      .from("profiles")
      .update({ full_name: DEMO_NAME, locale: DEMO_LOCALE })
      .eq("id", found.id);
    return found.id;
  }

  const { data, error } = await sb.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME, locale: DEMO_LOCALE, demo: true },
  });
  if (error || !data?.user) {
    throw new Error(`createUser failed: ${error?.message ?? "no user"}`);
  }
  await sb
    .from("profiles")
    .update({ full_name: DEMO_NAME, locale: DEMO_LOCALE })
    .eq("id", data.user.id);
  return data.user.id;
}

type SessionRow = {
  id: string;
  starts_at: string;
  capacity: number;
  spots_taken: number;
  activity: { id: string; price_cents: number; currency: string } | null;
};

async function seedDemoBookings(
  sb: SupabaseClient,
  userId: string,
): Promise<number> {
  // Pick the soonest upcoming `scheduled` sessions from the existing
  // catalog. Two upcoming + one past is the most useful mix for testing
  // the dashboard's upcoming/past split.
  const nowIso = new Date().toISOString();

  const { data: upcomingRaw } = await sb
    .from("sessions")
    .select(
      "id, starts_at, capacity, spots_taken, activity:activities!inner(id, price_cents, currency)",
    )
    .gt("starts_at", nowIso)
    .eq("status", "scheduled")
    .order("starts_at", { ascending: true })
    .limit(BOOKING_LIMIT - 1);

  const { data: pastRaw } = await sb
    .from("sessions")
    .select(
      "id, starts_at, capacity, spots_taken, activity:activities!inner(id, price_cents, currency)",
    )
    .lt("starts_at", nowIso)
    .order("starts_at", { ascending: false })
    .limit(1);

  const sessions = ([...(upcomingRaw ?? []), ...(pastRaw ?? [])] as unknown[])
    .map((s) => s as SessionRow)
    .filter((s) => s.activity !== null);

  if (sessions.length === 0) {
    console.warn(
      "  no sessions found — run the main seed first (npx tsx supabase/seed/seed.ts)",
    );
    return 0;
  }

  let count = 0;
  for (const s of sessions) {
    const activity = s.activity!;
    const isPast = new Date(s.starts_at).getTime() < Date.now();
    const row = {
      session_id: s.id,
      user_id: userId,
      amount_cents: activity.price_cents,
      currency: activity.currency,
      commission_bps: 2000,
      commission_cents: Math.round((activity.price_cents * 2000) / 10000),
      status: "confirmed" as const,
      confirmed_at: new Date(
        Date.now() - (isPast ? 86_400_000 * 14 : 86_400_000 * 2),
      ).toISOString(),
    };

    // Upsert by (user_id, session_id) shape. There's no natural unique
    // constraint, so do a manual select-then-insert.
    const { data: existing } = await sb
      .from("bookings")
      .select("id")
      .eq("user_id", userId)
      .eq("session_id", s.id)
      .maybeSingle();

    if (existing?.id) {
      await sb
        .from("bookings")
        .update({ status: row.status, confirmed_at: row.confirmed_at })
        .eq("id", existing.id);
    } else {
      const { error } = await sb.from("bookings").insert(row);
      if (error) {
        console.warn(
          `  booking insert failed for session ${s.id}: ${error.message}`,
        );
        continue;
      }
    }
    count += 1;
  }
  return count;
}

async function seedDemoFavorites(
  sb: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: activities } = await sb
    .from("activities")
    .select("id")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(FAVORITE_LIMIT);

  const ids = (activities ?? []).map((a) => a.id as string);
  if (ids.length === 0) return 0;

  const rows = ids.map((id) => ({
    user_id: userId,
    activity_id: id,
  }));

  const { error } = await sb
    .from("favorites")
    .upsert(rows, { onConflict: "user_id,activity_id", ignoreDuplicates: true });

  if (error) {
    console.warn(`  favorites upsert failed: ${error.message}`);
    return 0;
  }
  return ids.length;
}

async function main() {
  await preloadDotEnvLocal();
  const { url, serviceRoleKey } = loadEnv();
  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`→ Ensuring demo user (${DEMO_EMAIL}) …`);
  const userId = await ensureDemoUser(sb);

  console.log("→ Seeding demo bookings …");
  const bookingCount = await seedDemoBookings(sb, userId);

  console.log("→ Seeding demo favorites …");
  const favCount = await seedDemoFavorites(sb, userId);

  console.log("\nDemo user ready.");
  console.log(`  email:     ${DEMO_EMAIL}`);
  console.log(`  password:  ${DEMO_PASSWORD}`);
  console.log(`  bookings:  ${bookingCount}`);
  console.log(`  favorites: ${favCount}`);
  console.log("\nLog in at /pl/login or /en/login.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
