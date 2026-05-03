"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { Icon } from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";
import BrandLogo from "./BrandLogo";
import { createClient } from "@/src/lib/db/client";

export default function SiteNavbar({ children }: { children?: ReactNode }) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Lightweight session-aware nav: swap Login/Signup pair for an Account
  // link when a session cookie is present. `null` = unknown (initial
  // render) so we don't flicker the wrong CTA on first paint.
  useEffect(() => {
    let cancelled = false;
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      // Supabase env not configured (pre-launch) — leave as signed-out.
      setSignedIn(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setSignedIn(!!data.session);
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) setSignedIn(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav
      data-testid="site-navbar"
      className="fixed top-0 w-full z-50 bg-[#fdf9f0]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(45,10,23,0.06)] transition-all duration-300"
    >
      <div className="flex justify-between items-center px-4 md:px-8 h-16 md:h-[72px] max-w-site mx-auto relative">
        <div className="flex items-center gap-12 shrink-0">
          <Link href="/">
            <BrandLogo size={40} />
          </Link>
        </div>

        {children}

        {/* Right side: language + hamburger (always) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button
            className="w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-on-surface/10 active:scale-95 transition-all"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t("Nav.toggleMenu")}
          >
            <Icon name={menuOpen ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-on-surface/5 bg-[#fdf9f0]/95 backdrop-blur-xl">
          <div className="flex flex-col px-4 py-4 gap-1 max-w-site mx-auto">
            <div className="md:hidden px-3 py-2">
              <LanguageSwitcher />
            </div>
            <div className="md:hidden h-px bg-on-surface/5 my-2" />
            {signedIn === true ? (
              <>
                <Link
                  href="/account"
                  className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Icon name="person" className="text-[18px]" />
                  {t("Account.nav.profile")}
                </Link>
                <Link
                  href="/account/bookings"
                  className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Icon name="event" className="text-[18px]" />
                  {t("Account.nav.bookings")}
                </Link>
                <Link
                  href="/account/favorites"
                  className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Icon name="favorite" className="text-[18px]" />
                  {t("Account.nav.favorites")}
                </Link>
                <Link
                  href="/account/calendar"
                  className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Icon name="calendar_month" className="text-[18px]" />
                  {t("Account.nav.calendar")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:text-primary transition-colors"
                >
                  {t("Common.login")}
                </Link>
                <Link
                  href="/signup"
                  className="mt-1 inline-block text-center bg-primary text-on-primary px-4 py-3 rounded-xl font-headline uppercase tracking-widest text-[0.8rem] font-bold hover:bg-tertiary transition-colors"
                >
                  {t("Common.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
