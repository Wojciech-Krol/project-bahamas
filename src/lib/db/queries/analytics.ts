/**
 * Partner analytics queries — Phase 4.
 *
 * All functions are best-effort: if Supabase isn't configured (the
 * marketing site pre-launch), or the request-scoped client fails to
 * construct, they return empty aggregates so the overview page can
 * still render its chart shells without crashing.
 *
 * Row-level security: every query runs through the request-scoped
 * client (not the service-role admin client). The partner member
 * is already authenticated by the `(shell)/layout.tsx` guard, so
 * RLS naturally filters the aggregate views down to their partner's
 * rows without any extra `eq("partner_id", …)` — but we filter
 * explicitly anyway because `partner_daily_revenue` has no RLS
 * (views inherit underlying tables) and a safe-by-default query
 * is one less thing to audit later.
 */

import { createClient } from "@/src/lib/db/server";

export type RevenueTotals = {
  last30dCents: number;
  last90dCents: number;
  ytdCents: number;
  net30dCents: number;
  net90dCents: number;
  netYtdCents: number;
};

export type BookingsTrendPoint = {
  day: string; // yyyy-mm-dd
  count: number;
};

export type TopActivityRow = {
  activityId: string;
  bookingCount: number;
  grossCents: number;
};

export type OccupancyCell = {
  weekday: number; // 0..6, 0 = Sunday (JS getDay())
  hour: number; // 0..23
  occupancy: number; // avg 0..1
  sessions: number; // bucket count
};

export type PartnerAnalytics = {
  revenue: RevenueTotals;
  trend: BookingsTrendPoint[]; // 30 days, oldest → newest
  topActivities: TopActivityRow[];
  heatmap: OccupancyCell[]; // length 7*24
};

const EMPTY: PartnerAnalytics = {
  revenue: {
    last30dCents: 0,
    last90dCents: 0,
    ytdCents: 0,
    net30dCents: 0,
    net90dCents: 0,
    netYtdCents: 0,
  },
  trend: [],
  topActivities: [],
  heatmap: [],
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type PartnerNetSummary = {
  last30dCents: number;
  last90dCents: number;
  ytdCents: number;
  lifetimeCents: number;
};

const ZERO_NET: PartnerNetSummary = {
  last30dCents: 0,
  last90dCents: 0,
  ytdCents: 0,
  lifetimeCents: 0,
};

/** Sum net_partner_cents from partner_daily_revenue across four time windows. */
export async function getPartnerNetSummary(
  partnerId: string,
): Promise<PartnerNetSummary> {
  if (!partnerId) return ZERO_NET;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return ZERO_NET;
  }

  const { data, error } = await supabase
    .from("partner_daily_revenue")
    .select("day, net_partner_cents")
    .eq("partner_id", partnerId);

  if (error || !data) {
    if (error) console.error("[getPartnerNetSummary]", error);
    return ZERO_NET;
  }

  const now = Date.now();
  const ms = (days: number) => days * 24 * 60 * 60 * 1000;
  const cutoff30 = now - ms(30);
  const cutoff90 = now - ms(90);
  const ytdStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).getTime();

  let last30 = 0;
  let last90 = 0;
  let ytd = 0;
  let lifetime = 0;

  for (const row of data as Array<{ day: string; net_partner_cents: number | null }>) {
    const cents = row.net_partner_cents ?? 0;
    const t = new Date(row.day).getTime();
    if (Number.isNaN(t)) continue;
    lifetime += cents;
    if (t >= ytdStart) ytd += cents;
    if (t >= cutoff90) last90 += cents;
    if (t >= cutoff30) last30 += cents;
  }

  return {
    last30dCents: last30,
    last90dCents: last90,
    ytdCents: ytd,
    lifetimeCents: lifetime,
  };
}

/** Resolve the partner_id for the signed-in user, or null. */
export async function getPartnerIdForCurrentUser(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partner_members")
      .select("partner_id")
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return (data[0] as { partner_id: string }).partner_id;
  } catch {
    return null;
  }
}

/**
 * Pull every analytics slice the overview renders, in parallel.
 * Returns empty aggregates on any failure — the UI degrades
 * gracefully rather than surfacing partial error states.
 */
export async function getPartnerAnalytics(
  partnerId: string,
): Promise<PartnerAnalytics> {
  if (!partnerId) return EMPTY;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return EMPTY;
  }

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const ytd = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  // Run everything in parallel — independent read queries, all
  // filtered by partner_id, all touching different views.
  const [revenueResult, trendResult, topResult, occResult] = await Promise.all([
    supabase
      .from("partner_daily_revenue")
      .select("day, gross_cents, net_partner_cents")
      .eq("partner_id", partnerId)
      .gte("day", isoDate(ytd)),
    supabase
      .from("partner_daily_revenue")
      .select("day, confirmed_count")
      .eq("partner_id", partnerId)
      .gte("day", isoDate(d30))
      .order("day", { ascending: true }),
    supabase
      .from("activity_conversion")
      .select("activity_id, booking_count")
      .eq("partner_id", partnerId)
      .gt("booking_count", 0)
      .order("booking_count", { ascending: false })
      .limit(5),
    supabase
      .from("session_occupancy")
      .select("starts_at, occupancy_rate")
      .eq("partner_id", partnerId)
      .gte("starts_at", d60.toISOString()),
  ]);

  // ----- revenue totals -----
  const revenue: RevenueTotals = {
    last30dCents: 0,
    last90dCents: 0,
    ytdCents: 0,
    net30dCents: 0,
    net90dCents: 0,
    netYtdCents: 0,
  };
  if (!revenueResult.error && revenueResult.data) {
    const d30Iso = isoDate(d30);
    const d90Iso = isoDate(d90);
    for (const row of revenueResult.data as Array<{
      day: string;
      gross_cents: number | null;
      net_partner_cents: number | null;
    }>) {
      const gross = row.gross_cents ?? 0;
      const net = row.net_partner_cents ?? 0;
      revenue.ytdCents += gross;
      revenue.netYtdCents += net;
      if (row.day >= d90Iso) {
        revenue.last90dCents += gross;
        revenue.net90dCents += net;
      }
      if (row.day >= d30Iso) {
        revenue.last30dCents += gross;
        revenue.net30dCents += net;
      }
    }
  }

  // ----- bookings trend (30 days, contiguous series) -----
  const trendByDay = new Map<string, number>();
  if (!trendResult.error && trendResult.data) {
    for (const row of trendResult.data as Array<{
      day: string;
      confirmed_count: number | null;
    }>) {
      trendByDay.set(row.day, row.confirmed_count ?? 0);
    }
  }
  // fill every day in the 30d window so the chart x-axis is continuous
  // (empty days show as 0 instead of being absent from the series).
  const trend: BookingsTrendPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = isoDate(d);
    trend.push({ day: key, count: trendByDay.get(key) ?? 0 });
  }

  // ----- top activities by gross revenue -----
  // activity_conversion gives us per-activity booking counts (already
  // sorted). For gross, we pull this partner's confirmed bookings with
  // the joined session.activity_id and sum per activity in JS. Partner
  // RLS naturally scopes the result, and for a typical partner this is
  // a bounded dataset (< a few thousand rows/year); if it grows we can
  // promote this to a `activity_revenue_totals` SQL view later.
  let topActivities: TopActivityRow[] = [];
  if (!topResult.error && topResult.data && topResult.data.length > 0) {
    const rows = topResult.data as Array<{
      activity_id: string;
      booking_count: number | null;
    }>;
    const topIds = new Set(rows.map((r) => r.activity_id));
    const grossByActivity = new Map<string, number>();

    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("amount_cents, sessions!inner(activity_id)")
      .eq("status", "confirmed");
    if (bookingRows) {
      for (const b of bookingRows as Array<{
        amount_cents: number | null;
        sessions:
          | { activity_id: string }
          | Array<{ activity_id: string }>
          | null;
      }>) {
        // PostgREST can return the embedded row as either an object
        // (one-to-one) or an array (one-to-many) depending on schema
        // hints; normalise.
        const embedded = Array.isArray(b.sessions) ? b.sessions[0] : b.sessions;
        const aid = embedded?.activity_id;
        if (!aid || !topIds.has(aid)) continue;
        grossByActivity.set(
          aid,
          (grossByActivity.get(aid) ?? 0) + (b.amount_cents ?? 0),
        );
      }
    }

    topActivities = rows
      .map((r) => ({
        activityId: r.activity_id,
        bookingCount: r.booking_count ?? 0,
        grossCents: grossByActivity.get(r.activity_id) ?? 0,
      }))
      // re-sort by gross (primary) then booking count (tie break) so
      // the list is actually "top by revenue" rather than "top by
      // bookings with revenue attached".
      .sort(
        (a, b) => b.grossCents - a.grossCents || b.bookingCount - a.bookingCount,
      );
  }

  // ----- occupancy heatmap (7x24, avg over last 60 days) -----
  // Aggregate in JS: we iterate the raw session rows once and build
  // 168 buckets. Using JS weekday/hour (in the server's local TZ,
  // which on Vercel is UTC — matches our `day` columns). Partners in
  // non-UTC timezones get a TZ-shifted view; Phase 4 ships UTC,
  // future work can add a TZ override.
  type Bucket = { sum: number; count: number };
  const buckets = new Array<Bucket>(7 * 24)
    .fill(null as unknown as Bucket)
    .map(() => ({ sum: 0, count: 0 }));
  if (!occResult.error && occResult.data) {
    for (const row of occResult.data as Array<{
      starts_at: string;
      occupancy_rate: number | string | null;
    }>) {
      const d = new Date(row.starts_at);
      if (Number.isNaN(d.getTime())) continue;
      const wd = d.getUTCDay();
      const hr = d.getUTCHours();
      const rate =
        typeof row.occupancy_rate === "string"
          ? parseFloat(row.occupancy_rate)
          : (row.occupancy_rate ?? 0);
      if (!Number.isFinite(rate)) continue;
      const idx = wd * 24 + hr;
      buckets[idx].sum += rate;
      buckets[idx].count += 1;
    }
  }
  const heatmap: OccupancyCell[] = [];
  for (let wd = 0; wd < 7; wd++) {
    for (let hr = 0; hr < 24; hr++) {
      const b = buckets[wd * 24 + hr];
      heatmap.push({
        weekday: wd,
        hour: hr,
        // guard against division by zero — buckets with no sessions
        // in the 60-day window should render as empty cells, not 0%.
        occupancy: b.count === 0 ? 0 : b.sum / b.count,
        sessions: b.count,
      });
    }
  }

  return { revenue, trend, topActivities, heatmap };
}
