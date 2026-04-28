"use client";

/**
 * Cookie consent banner.
 *
 * Renders a sticky bottom bar on first visit. Three buttons:
 *   - Accept all   → writes cookie = "all"
 *   - Reject       → writes cookie = "essential"
 *   - Customize    → expands per-category toggles
 *
 * The banner is rendered from the locale layout so it sits on top of
 * every page. Once a choice is stored in `hakuna_consent` (6-month
 * Max-Age), the component unmounts for the rest of the session.
 *
 * The format written here is the one `src/lib/consent.ts` parses —
 * keep the two in sync.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/src/i18n/navigation";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
} from "@/src/lib/consent";

function writeConsentCookie(value: string) {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}` +
    `; Max-Age=${CONSENT_MAX_AGE_SECONDS}` +
    `; Path=/` +
    `; SameSite=Lax` +
    (isSecure ? `; Secure` : "");
}

export default function CookieConsent() {
  const t = useTranslations("Consent");
  const [dismissed, setDismissed] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  if (dismissed) return null;

  function close() {
    setDismissed(true);
  }

  function acceptAll() {
    writeConsentCookie("all");
    close();
  }

  function rejectAll() {
    writeConsentCookie("essential");
    close();
  }

  function saveCustom() {
    writeConsentCookie(JSON.stringify({ analytics }));
    close();
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 md:pb-6"
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      data-testid="cookie-consent"
    >
      <div className="mx-auto max-w-3xl rounded-2xl bg-surface-container-lowest text-on-surface shadow-[0px_20px_60px_rgba(45,10,23,0.18)] border border-on-surface/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-lg font-semibold mb-1">
              {t("title")}
            </h2>
            <p className="text-sm text-on-surface/80">
              {t("description")}{" "}
              <Link
                href="/cookies"
                className="underline hover:text-primary transition-colors"
              >
                {t("learnMore")}
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCustomize((v) => !v)}
              className="rounded-xl border border-on-surface/15 px-4 py-2 text-sm font-headline uppercase tracking-widest font-semibold hover:bg-on-surface/5 transition-colors"
            >
              {t("customize")}
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="rounded-xl border border-on-surface/15 px-4 py-2 text-sm font-headline uppercase tracking-widest font-semibold hover:bg-on-surface/5 transition-colors"
            >
              {t("reject")}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors"
            >
              {t("accept")}
            </button>
          </div>
        </div>
        {customize && (
          <div className="mt-5 border-t border-on-surface/10 pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="consent-essential"
                type="checkbox"
                checked
                disabled
                className="mt-1 h-4 w-4 accent-primary"
              />
              <label htmlFor="consent-essential" className="text-sm">
                <span className="font-semibold block">
                  {t("essential.title")}
                </span>
                <span className="text-on-surface/70">
                  {t("essential.description")}
                </span>
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="consent-analytics"
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <label htmlFor="consent-analytics" className="text-sm">
                <span className="font-semibold block">
                  {t("analytics.title")}
                </span>
                <span className="text-on-surface/70">
                  {t("analytics.description")}
                </span>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors"
              >
                {t("save")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
