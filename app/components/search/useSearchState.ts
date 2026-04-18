"use client";

import { useCallback, useState } from "react";
import type { AgeCounts } from "./constants";

export function useSearchState() {
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
      parts.push(`${ageCounts.adults} Adult${ageCounts.adults > 1 ? "s" : ""}`);
    if (ageCounts.teens > 0)
      parts.push(`${ageCounts.teens} Teen${ageCounts.teens > 1 ? "s" : ""}`);
    if (ageCounts.kids > 0)
      parts.push(`${ageCounts.kids} Kid${ageCounts.kids > 1 ? "s" : ""}`);
    return parts.join(", ") || "";
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
