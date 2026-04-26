/**
 * Booking queries — read-side for the post-checkout receipt page and the
 * partner bookings dashboard.
 *
 * Auth model: `bookings` RLS lets a user see their own rows + lets partner
 * members see rows tied to sessions in their venues. We rely on those
 * policies — no `eq("user_id", uid)` filter is added here. Queries that
 * bypass RLS (admin client) belong in dedicated files, not this one.
 */

import { createClient } from "@/src/lib/db/server";
import type { Locale } from "@/src/lib/db/types";
import { pick } from "./_i18n";

type I18nBag = Record<string, string | null | undefined> | null;

type BookingDetailRow = {
  id: string;
  user_id: string;
  status: string;
  amount_cents: number;
  currency: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  session:
    | {
        id: string;
        starts_at: string;
        ends_at: string;
        activity:
          | {
              id: string;
              title_i18n: I18nBag;
              hero_image: string | null;
              venue:
                | {
                    id: string;
                    name: string;
                    address: string | null;
                    city: string | null;
                  }
                | null;
            }
          | null;
      }
    | null;
};

const BOOKING_DETAIL_SELECT = `
  id,
  user_id,
  status,
  amount_cents,
  currency,
  confirmed_at,
  cancelled_at,
  created_at,
  session:sessions!inner (
    id,
    starts_at,
    ends_at,
    activity:activities!inner (
      id,
      title_i18n,
      hero_image,
      venue:venues!inner (
        id,
        name,
        address,
        city
      )
    )
  )
`;

export type BookingDetail = {
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  amountCents: number;
  currency: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
  };
  activity: {
    id: string;
    title: string;
    heroImage: string | null;
  };
  venue: {
    id: string;
    name: string;
    location: string;
  };
};

function compose(row: BookingDetailRow, locale: Locale): BookingDetail | null {
  const session = row.session;
  const activity = session?.activity;
  const venue = activity?.venue;
  if (!session || !activity || !venue) return null;
  return {
    id: row.id,
    userId: row.user_id,
    status: (row.status as BookingDetail["status"]) ?? "pending",
    amountCents: row.amount_cents,
    currency: row.currency,
    confirmedAt: row.confirmed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    session: {
      id: session.id,
      startsAt: session.starts_at,
      endsAt: session.ends_at,
    },
    activity: {
      id: activity.id,
      title: pick(activity.title_i18n, locale) || activity.id,
      heroImage: activity.hero_image,
    },
    venue: {
      id: venue.id,
      name: venue.name,
      location: venue.address ?? venue.city ?? "",
    },
  };
}

type PartnerBookingRow = {
  id: string;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  user_id: string | null;
  session:
    | {
        id: string;
        starts_at: string;
        activity:
          | {
              id: string;
              title_i18n: I18nBag;
              venue:
                | {
                    id: string;
                    name: string;
                    partner_id: string;
                  }
                | null;
            }
          | null;
      }
    | null;
};

export type PartnerBookingRow_UI = {
  id: string;
  status: BookingDetail["status"];
  amountCents: number;
  currency: string;
  createdAt: string;
  startsAt: string;
  activityId: string;
  activityTitle: string;
  venueName: string;
};

/** Bookings for the partner — RLS scopes to bookings whose session belongs
 * to a venue the partner owns. */
export async function getBookingsByPartner(
  partnerId: string,
  locale: Locale,
  limit = 100,
): Promise<PartnerBookingRow_UI[]> {
  if (!partnerId) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      amount_cents,
      currency,
      created_at,
      user_id,
      session:sessions!inner (
        id,
        starts_at,
        activity:activities!inner (
          id,
          title_i18n,
          venue:venues!inner (
            id,
            name,
            partner_id
          )
        )
      )
    `,
    )
    .eq("session.activity.venue.partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<PartnerBookingRow[]>();

  if (error) {
    console.error("[db/queries/bookings.getBookingsByPartner]", error);
    return [];
  }

  return (data ?? [])
    .map((row): PartnerBookingRow_UI | null => {
      const session = row.session;
      const activity = session?.activity;
      const venue = activity?.venue;
      if (!session || !activity || !venue) return null;
      return {
        id: row.id,
        status: (row.status as BookingDetail["status"]) ?? "pending",
        amountCents: row.amount_cents,
        currency: row.currency,
        createdAt: row.created_at,
        startsAt: session.starts_at,
        activityId: activity.id,
        activityTitle: pick(activity.title_i18n, locale) || activity.id,
        venueName: venue.name,
      };
    })
    .filter((r): r is PartnerBookingRow_UI => r !== null);
}

/**
 * Load a booking by id. Returns `null` when missing or when RLS hides it
 * from the caller.
 */
export async function getBookingById(
  id: string,
  locale: Locale,
): Promise<BookingDetail | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle<BookingDetailRow>();

  if (error) {
    console.error("[db/queries/bookings.getBookingById]", error);
    return null;
  }
  if (!data) return null;
  return compose(data, locale);
}
