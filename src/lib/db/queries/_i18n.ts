/**
 * Helpers for reading locale-bagged JSONB columns (e.g. `title_i18n`,
 * `description_i18n`) and for formatting price / duration fields into the
 * string shapes the existing UI components expect.
 *
 * The DB stores `{ pl: string, en: string, ... }` under `*_i18n` columns;
 * the UI contract has a single flat string. Pick the requested locale,
 * fall back to Polish (project default), then to the first non-empty
 * entry, and finally to an empty string.
 */

import type { Locale } from "../types";

type I18nBag = Record<string, string | null | undefined> | null | undefined;

export function pick(bag: I18nBag, locale: Locale): string {
  if (!bag || typeof bag !== "object") return "";
  const v = bag[locale];
  if (typeof v === "string" && v.length > 0) return v;
  const pl = bag["pl"];
  if (typeof pl === "string" && pl.length > 0) return pl;
  for (const key of Object.keys(bag)) {
    const candidate = bag[key];
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return "";
}

/**
 * Format an integer `price_cents` + ISO currency code into the user-facing
 * string the `Activity.price` field carries today (e.g. `"€12.00"`, `"0 zł"`).
 * Zero cents renders as a localized "Free" sentinel so empty bookings look
 * tidy in lists.
 */
export function formatPrice(
  priceCents: number | null | undefined,
  currency: string | null | undefined,
  locale: Locale,
): string {
  if (priceCents == null) return "";
  const amount = priceCents / 100;
  const cur = (currency ?? "PLN").toUpperCase();
  if (priceCents === 0) {
    return locale === "pl" ? "Bezpłatnie" : "Free";
  }
  try {
    return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Intl rejected an unknown currency; fall back to a plain render.
    return `${amount.toFixed(2)} ${cur}`;
  }
}

/**
 * Duration minutes → the short free-text label the UI uses (e.g. `"60 min"`,
 * `"1 h 30 min"`). Null / zero → empty string (caller decides what to show).
 */
export function formatDuration(
  durationMin: number | null | undefined,
  locale: Locale,
): string {
  if (!durationMin || durationMin <= 0) return "";
  const minLabel = locale === "pl" ? "min" : "min";
  if (durationMin < 60) return `${durationMin} ${minLabel}`;
  const h = Math.floor(durationMin / 60);
  const m = durationMin % 60;
  const hourLabel = locale === "pl" ? "h" : "h";
  return m === 0 ? `${h} ${hourLabel}` : `${h} ${hourLabel} ${m} ${minLabel}`;
}

/**
 * ISO timestamp → short weekday + time label for activity rails
 * (e.g. "Sob 10:00", "Sat 10:00"). Returns "" on null/invalid input.
 *
 * Locale picks weekday spelling — Polish uses 3-letter abbreviated forms
 * via Intl with `weekday: "short"`. Time uses 24h format both locales.
 *
 * If the timestamp is today, returns "Dziś 10:00" / "Today 10:00" so
 * cards feel current.
 */
export function formatNextSessionTime(
  iso: string | null | undefined,
  locale: Locale,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";
  const time = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `${locale === "pl" ? "Dziś" : "Today"} ${time}`;
  }

  const weekday = new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
  }).format(d);
  // Capitalise Polish day abbreviations ("pon" → "Pon") for display parity
  // with English's already-capitalised "Mon".
  const wd = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${wd} ${time}`;
}
