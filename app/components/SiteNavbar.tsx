"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "../../src/i18n/navigation";
import { Icon } from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function SiteNavbar({ children }: { children?: ReactNode }) {
  const t = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fdf9f0]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(45,10,23,0.06)] transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 md:h-[72px] max-w-site mx-auto relative">
        <div className="flex items-center gap-12 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-primary font-headline"
          >
            <Image src="/logo.svg" alt="Hakuna Logo" width={40} height={40} className="w-10 h-10" />
            hakuna
          </Link>
        </div>

        {children}

        <div className="hidden md:flex items-center gap-6 shrink-0">
          <LanguageSwitcher />
          <div className="flex items-center gap-4">
            <button className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary transition-all">
              {t("Common.login")}
            </button>
            <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.75rem] font-bold hover:bg-tertiary scale-95 hover:scale-100 duration-200 transition-all">
              {t("Common.signup")}
            </button>
          </div>
        </div>

        <button
          className="md:hidden w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center active:scale-95 transition-transform"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t("Nav.toggleMenu")}
        >
          <Icon name={mobileOpen ? "close" : "menu"} className="text-[22px]" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-on-surface/5 bg-[#fdf9f0]/95 backdrop-blur-xl">
          <div className="flex flex-col px-4 py-4 gap-1">
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            <div className="h-px bg-on-surface/5 my-2" />
            <button className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface">
              {t("Common.login")}
            </button>
            <button className="mt-1 bg-primary text-on-primary px-4 py-3 rounded-xl font-headline uppercase tracking-widest text-[0.8rem] font-bold">
              {t("Common.signup")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
