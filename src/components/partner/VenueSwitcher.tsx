"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../Icon";

export default function VenueSwitcher() {
  const t = useTranslations("Partner");
  const tVenue = useTranslations("Partner.mock.venue");

  return (
    <button
      type="button"
      className="bg-surface-container-lowest rounded-2xl p-3 flex items-center gap-3 editorial-shadow border border-[#FAEEDA] text-left w-full hover:-translate-y-0.5 transition-transform"
    >
      <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline font-extrabold shrink-0">
        {tVenue("initial")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/40">
          {t("venueSwitcher.label")}
        </div>
        <div className="font-bold text-sm truncate">{tVenue("name")}</div>
      </div>
      <Icon name="unfold_more" className="text-[18px] text-on-surface/40" />
    </button>
  );
}
