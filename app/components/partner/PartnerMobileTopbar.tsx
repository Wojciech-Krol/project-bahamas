"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import BrandLogo from "../BrandLogo";
import { Icon } from "../Icon";

export default function PartnerMobileTopbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const t = useTranslations("Partner");
  return (
    <header className="md:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-on-surface/5 px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={t("nav.toggleMenu")}
        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-primary-fixed/30 active:bg-primary-fixed/50 text-on-surface transition-colors"
      >
        <Icon name="menu" className="text-[24px]" />
      </button>
      <Link href="/partner" className="flex items-center gap-2 flex-1 min-w-0">
        <BrandLogo size={26} />
        <span className="h-3 w-px bg-on-surface/20" />
        <span className="text-[0.55rem] font-headline font-bold uppercase tracking-[0.2em] text-on-surface/60">
          {t("brand")}
        </span>
      </Link>
    </header>
  );
}
