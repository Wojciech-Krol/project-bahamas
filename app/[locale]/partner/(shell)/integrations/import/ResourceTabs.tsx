"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";

import CsvImportPanel from "./CsvImportPanel";

type ResourceKey = "sessions" | "activities" | "instructors" | "pricing";

const TABS: ReadonlyArray<{ key: ResourceKey; icon: string }> = [
  { key: "sessions", icon: "event" },
  { key: "activities", icon: "category" },
  { key: "instructors", icon: "person" },
  { key: "pricing", icon: "payments" },
];

export default function ResourceTabs({
  partnerId,
  locale,
}: {
  partnerId: string;
  locale: "pl" | "en";
}) {
  const t = useTranslations("Partner.import");
  const [active, setActive] = useState<ResourceKey>("activities");

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-headline uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-on-primary editorial-shadow"
                  : "bg-surface-container-low text-on-surface hover:bg-primary-fixed hover:text-primary"
              }`}
            >
              <Icon name={tab.icon} className="text-[18px]" />
              {t(`tabs.${tab.key}`)}
            </button>
          );
        })}
      </div>

      <CsvImportPanel
        key={active}
        partnerId={partnerId}
        resourceType={active}
        locale={locale}
      />
    </div>
  );
}
