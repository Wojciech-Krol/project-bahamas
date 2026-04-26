"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../Icon";

export default function PlaceholderPage({
  icon,
  titleKey,
}: {
  icon: string;
  titleKey: "bookings" | "reviews" | "insights" | "payouts" | "settings";
}) {
  const t = useTranslations("Partner");
  return (
    <div className="p-8">
      <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
        {t(`nav.${titleKey}`)}
      </h1>
      <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6">
          <Icon name={icon} className="text-[32px]" />
        </div>
        <h2 className="font-headline font-bold text-2xl mb-2">
          {t(`nav.${titleKey}`)}
        </h2>
        <p className="text-on-surface/60 max-w-md">
          {/* Scoped stub: section listed in spec but not in the 6 mocked screens. */}
          Coming soon.
        </p>
      </div>
    </div>
  );
}
