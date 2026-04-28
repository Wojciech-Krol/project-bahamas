"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "../../src/i18n/navigation";
import { routing, type Locale } from "../../src/i18n/routing";
import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";

const LOCALE_LABELS: Record<Locale, string> = {
  pl: "Polski",
  en: "English",
};

const LOCALE_SHORT: Record<Locale, string> = {
  pl: "PL",
  en: "EN",
};

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const switchTo = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    // next-intl's typed pathnames refuse a bare dynamic pathname (e.g.
    // "/activity/[slug]") because the union type forces params to match
    // a specific pathname literal; we pass the current params through so
    // the locale swap stays on the same route.
    const target = { pathname, params } as Parameters<typeof router.replace>[0];
    router.replace(target, { locale: next });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-widest hover:text-primary transition-colors"
      >
        <Icon name="language" className="text-[18px]" />
        <span>{LOCALE_SHORT[locale]}</span>
        {!compact && <Icon name="expand_more" className="text-[16px]" />}
      </button>
      <ul
        role="listbox"
        className={`absolute right-0 mt-2 min-w-[140px] rounded-md border border-on-surface/10 bg-[#fdf9f0] shadow-lg overflow-hidden z-50 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open
            ? "opacity-100 translate-y-0 max-h-[240px]"
            : "opacity-0 -translate-y-2 max-h-0 pointer-events-none"
        }`}
      >
        {routing.locales.map((loc) => (
          <li key={loc}>
            <button
              type="button"
              role="option"
              aria-selected={loc === locale}
              onClick={() => switchTo(loc)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                loc === locale
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-on-surface/5"
              }`}
            >
              {LOCALE_LABELS[loc]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
