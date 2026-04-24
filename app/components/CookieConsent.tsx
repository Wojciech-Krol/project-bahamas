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

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/src/i18n/navigation";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  readClientConsent,
} from "@/src/lib/consent";

// `useSyncExternalStore` adapter for the consent cookie. Cookies don't
// emit change events, so we expose a tiny pub/sub that `writeConsentCookie`
// pings after each write. This keeps the banner subscription idiomatic
// without the setState-in-effect anti-pattern.
const consentListeners = new Set<() => void>();
function subscribeConsent(listener: () => void) {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}
function notifyConsentChange() {
  for (const l of consentListeners) l();
}
function getClientHasChoice() {
  return readClientConsent().hasChoice;
}
function getServerHasChoice() {
  // Server snapshot is constant: pretend nothing was chosen so the banner
  // markup is stable on SSR. The client effect after hydration reconciles
  // this against the real cookie.
  return false;
}

function writeConsentCookie(value: string) {
  // `Secure` is required for HTTPS but breaks cookie writes over plain
  // http://localhost during dev. Detect the runtime scheme and only add
  // the flag when the page itself was served over https.
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}` +
    `; Max-Age=${CONSENT_MAX_AGE_SECONDS}` +
    `; Path=/` +
    `; SameSite=Lax` +
    (isSecure ? `; Secure` : "");
  notifyConsentChange();
}

export default function CookieConsent() {
  const t = useTranslations("Consent");
  // Read the cookie via useSyncExternalStore so SSR and the first client
  // render both report "hasn't chosen yet" (server snapshot is constant),
  // avoiding hydration mismatch. After hydration the real cookie is
  // observed and the banner can hide if a choice was already made.
  // `dismissed` lets the user's click instantly hide the banner without
  // waiting for the cookie write to round-trip through the store.
  const hasChoice = useSyncExternalStore(
    subscribeConsent,
    getClientHasChoice,
    getServerHasChoice,
  );
  const [dismissed, setDismissed] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const visible = !hasChoice && !dismissed;

  if (!visible) return null;

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
