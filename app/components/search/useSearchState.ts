"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { AgeCounts } from "./constants";

export function useSearchState() {
  const t = useTranslations("Search.ageLabel");
  const [activities, setActivities] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [when, setWhen] = useState("");
  const [ageCounts, setAgeCounts] = useState<AgeCounts>({
    kids: 0,
    teens: 0,
    adults: 1,
  });

  const handleAgeUpdate = useCallback(
    (key: keyof AgeCounts, delta: number) => {
      setAgeCounts((prev) => ({
        ...prev,
        [key]: Math.max(0, prev[key] + delta),
      }));
    },
    []
  );

  const clearAll = useCallback(() => {
    setActivities("");
    setNeighborhood("");
    setWhen("");
    setAgeCounts({ kids: 0, teens: 0, adults: 1 });
  }, []);

  const ageLabel = (() => {
    const parts: string[] = [];
    if (ageCounts.adults > 0)
      parts.push(t("adults", { count: ageCounts.adults }));
    if (ageCounts.teens > 0) parts.push(t("teens", { count: ageCounts.teens }));
    if (ageCounts.kids > 0) parts.push(t("kids", { count: ageCounts.kids }));
    return parts.join(", ");
  })();

  return {
    activities,
    neighborhood,
    when,
    ageCounts,
    ageLabel,
    setActivities,
    setNeighborhood,
    setWhen,
    setAgeCounts,
    handleAgeUpdate,
    clearAll,
  };
}
