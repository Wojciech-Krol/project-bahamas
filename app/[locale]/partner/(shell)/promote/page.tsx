/**
 * Partner → Promote (Boost marketplace).
 *
 * Spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section 3.4 "Boost (Booksy-style)".
 *
 * Server Component. Lists the partner's activities + venues and lets the
 * partner purchase a Boost (7 / 14 / 30 days) targeted at:
 *   - a single activity
 *   - a single venue (venue-wide)
 *   - all of the partner's venues at once ("venueAll")
 *
 * Each card shows the current Boost state — "Active boost ends {date}" or
 * "Not boosted" — read directly from `listing_boosts`.
 *
 * Modal is a zero-JS `<details>` + `<summary>` — keeps the flow working even
 * if hydration never fires. Every duration option is a separate submit
 * button inside one form per target, so each click carries the right
 * `duration_days` to the server action.
 */

import { getTranslations } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { env } from "@/src/env";

import { promoteBoost } from "./actions";
import { DURATION_PRICES_CENTS } from "./pricing";

export const dynamic = "force-dynamic";

type ServerEnv = typeof env & {
  STRIPE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const DURATIONS = [7, 14, 30] as const;
type Duration = (typeof DURATIONS)[number];

type PartnerRow = {
  id: string;
  name: string;
};

type VenueRow = {
  id: string;
  name: string;
};

type ActivityRow = {
  id: string;
  title_i18n: Record<string, string> | null;
  venue_id: string;
};

type BoostRow = {
  id: string;
  activity_id: string | null;
  venue_id: string | null;
  ends_at: string;
};

type PageState =
  | { kind: "supabase-missing" }
  | { kind: "stripe-missing" }
  | { kind: "not-member" }
  | {
      kind: "ok";
      partner: PartnerRow;
      venues: VenueRow[];
      activities: ActivityRow[];
      activeBoosts: BoostRow[];
    };

async function resolveState(): Promise<PageState> {
  const serverEnv = env as ServerEnv;
  if (
    !serverEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { kind: "supabase-missing" };
  }
  if (!serverEnv.STRIPE_SECRET_KEY) {
    return { kind: "stripe-missing" };
  }

  const current = await getCurrentUser();
  if (!current) return { kind: "not-member" };

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) return { kind: "not-member" };

  const { data: partner } = await supabase
    .from("partners")
    .select("id, name")
    .eq("id", membership.partner_id)
    .maybeSingle();
  if (!partner) return { kind: "not-member" };

  const { data: venues } = await supabase
    .from("venues")
    .select("id, name")
    .eq("partner_id", partner.id)
    .order("name");

  const venueIds = (venues ?? []).map((v) => v.id);
  let activities: ActivityRow[] = [];
  if (venueIds.length > 0) {
    const { data: actRows } = await supabase
      .from("activities")
      .select("id, title_i18n, venue_id")
      .in("venue_id", venueIds)
      .order("created_at", { ascending: false });
    activities = (actRows ?? []) as ActivityRow[];
  }

  // Only rows that are active AND currently within starts_at/ends_at.
  const nowIso = new Date().toISOString();
  const { data: boosts } = await supabase
    .from("listing_boosts")
    .select("id, activity_id, venue_id, ends_at")
    .eq("status", "active")
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  return {
    kind: "ok",
    partner: partner as PartnerRow,
    venues: (venues ?? []) as VenueRow[],
    activities,
    activeBoosts: (boosts ?? []) as BoostRow[],
  };
}

function PlaceholderCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6">
        <Icon name={icon} className="text-[32px]" />
      </div>
      <h2 className="font-headline font-bold text-2xl mb-2">{title}</h2>
      <p className="text-on-surface/60 max-w-md">{body}</p>
    </div>
  );
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function priceLabel(duration: Duration): string {
  // 4900 cents → "49"; 16900 → "169"
  const cents = DURATION_PRICES_CENTS[duration];
  return String(Math.round(cents / 100));
}

type CardProps = {
  targetType: "activity" | "venue" | "venueAll";
  targetId: string;
  title: string;
  subtitle?: string;
  activeBoostEndsAt: string | null;
  locale: string;
  icon: string;
  highlight?: boolean;
};

async function BoostCard({
  targetType,
  targetId,
  title,
  subtitle,
  activeBoostEndsAt,
  locale,
  icon,
  highlight,
}: CardProps) {
  const t = await getTranslations({ locale, namespace: "Partner.promote" });
  const detailsName = `boost-${targetType}-${targetId}`;

  return (
    <div
      className={`rounded-2xl border editorial-shadow p-6 flex flex-col gap-4 ${
        highlight
          ? "bg-primary-fixed/50 border-primary/30"
          : "bg-surface-container-lowest border-[#FAEEDA]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            highlight
              ? "bg-primary text-on-primary"
              : "bg-primary-fixed text-primary"
          }`}
        >
          <Icon name={icon} className="text-[24px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline font-bold text-lg leading-tight truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-on-surface/60 text-sm mt-0.5 truncate">
              {subtitle}
            </div>
          )}
          <div className="mt-2">
            {activeBoostEndsAt ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest bg-primary-fixed text-primary">
                <Icon name="bolt" className="text-[14px]" />
                {t("activeUntil", {
                  date: formatDate(activeBoostEndsAt, locale),
                })}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest bg-surface-container-high text-on-surface/70">
                <Icon name="circle" className="text-[14px]" />
                {t("notBoosted")}
              </span>
            )}
          </div>
        </div>
      </div>

      <details className="group" name={detailsName}>
        <summary className="list-none cursor-pointer inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors self-start">
          <Icon name="rocket_launch" className="text-[18px]" />
          {t("activateCta")}
        </summary>
        <div className="mt-4 border-t border-on-surface/5 pt-4">
          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-3">
            {t("chooseDuration")}
          </div>
          <div className="flex flex-wrap gap-3">
            {DURATIONS.map((d) => (
              <form
                key={d}
                action={promoteBoost}
                className="flex flex-col items-stretch"
              >
                <input type="hidden" name="target_type" value={targetType} />
                <input type="hidden" name="target_id" value={targetId} />
                <input type="hidden" name="duration_days" value={String(d)} />
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="bg-surface-container-highest hover:bg-primary-fixed text-on-surface px-4 py-3 rounded-xl text-left transition-colors border border-on-surface/5 min-w-[140px]"
                >
                  <div className="font-headline font-bold text-sm">
                    {t(`durationOptions.${d}` as const)}
                  </div>
                  <div className="text-primary font-bold text-lg mt-0.5">
                    {t("priceLabel", { price: priceLabel(d) })}
                  </div>
                </button>
              </form>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

function Banner({ kind, message }: { kind: "success" | "error"; message: string }) {
  const palette =
    kind === "success"
      ? "bg-primary-fixed text-primary border-primary/20"
      : "bg-error-container text-on-error-container border-error/20";
  return (
    <div
      className={`rounded-2xl border px-5 py-3 text-sm font-semibold ${palette}`}
    >
      {message}
    </div>
  );
}

export default async function PartnerPromotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ boost?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Partner.promote" });

  const state = await resolveState();

  if (state.kind === "supabase-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
          {t("title")}
        </h1>
        <PlaceholderCard
          icon="cloud_off"
          title={t("title")}
          body={t("placeholder.supabaseMissing")}
        />
      </div>
    );
  }

  if (state.kind === "stripe-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
          {t("title")}
        </h1>
        <PlaceholderCard
          icon="rocket_launch"
          title={t("title")}
          body={t("placeholder.stripeMissing")}
        />
      </div>
    );
  }

  if (state.kind === "not-member") {
    // Shell layout will already have redirected unauthenticated users or 404'd
    // non-members. This is a fallback for race conditions.
    return null;
  }

  const { partner, venues, activities, activeBoosts } = state;

  // Map: venue_id → active boost row (venue-wide). activity_id → boost row.
  const venueBoost = new Map<string, BoostRow>();
  const activityBoost = new Map<string, BoostRow>();
  for (const b of activeBoosts) {
    if (b.venue_id) venueBoost.set(b.venue_id, b);
    if (b.activity_id) activityBoost.set(b.activity_id, b);
  }

  // "All venues" is considered active when EVERY venue has an active
  // venue-wide boost (same partner-wide coverage the purchase flow grants).
  const allVenuesBoosted =
    venues.length > 0 &&
    venues.every((v) => venueBoost.has(v.id));
  const allVenuesBoostEndsAt = allVenuesBoosted
    ? venues
        .map((v) => venueBoost.get(v.id)!.ends_at)
        // earliest end — the effective coverage ends when ANY venue expires.
        .sort()[0]
    : null;

  const boostState = sp.boost;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-2">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 max-w-2xl">{t("subtitle")}</p>
      </div>

      {boostState === "success" && (
        <div className="mb-6">
          <Banner kind="success" message={t("successBanner")} />
        </div>
      )}
      {boostState === "cancelled" && (
        <div className="mb-6">
          <Banner kind="error" message={t("cancelledBanner")} />
        </div>
      )}
      {boostState === "error" && (
        <div className="mb-6">
          <Banner kind="error" message={t("errors.generic")} />
        </div>
      )}

      {venues.length > 1 && (
        <section className="mb-10">
          <BoostCard
            targetType="venueAll"
            targetId={partner.id}
            title={t("sectionAll")}
            subtitle={t("sectionAllDescription")}
            activeBoostEndsAt={allVenuesBoostEndsAt}
            locale={locale}
            icon="rocket_launch"
            highlight
          />
        </section>
      )}

      {venues.length > 0 && (
        <section className="mb-10">
          <h2 className="font-headline font-bold text-xl mb-4">
            {t("sectionVenues")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((v) => {
              const b = venueBoost.get(v.id);
              return (
                <BoostCard
                  key={v.id}
                  targetType="venue"
                  targetId={v.id}
                  title={v.name}
                  activeBoostEndsAt={b?.ends_at ?? null}
                  locale={locale}
                  icon="storefront"
                />
              );
            })}
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section>
          <h2 className="font-headline font-bold text-xl mb-4">
            {t("sectionActivities")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activities.map((a) => {
              const b = activityBoost.get(a.id);
              const title =
                a.title_i18n?.[locale] ??
                a.title_i18n?.pl ??
                a.title_i18n?.en ??
                a.id;
              return (
                <BoostCard
                  key={a.id}
                  targetType="activity"
                  targetId={a.id}
                  title={title}
                  activeBoostEndsAt={b?.ends_at ?? null}
                  locale={locale}
                  icon="event_note"
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
