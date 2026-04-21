"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "../../../src/i18n/navigation";
import HeroSearchBar from "./HeroSearchBar";
import { MobileSearchPill, MobileSearchOverlay } from "./MobileSearch";
import { useSearchState } from "./useSearchState";
import { buildSearchQuery, parseSearchQuery } from "../../lib/searchQuery";

export default function PageSearchBar({
  className = "w-full",
}: {
  className?: string;
}) {
  const urlParams = useSearchParams();
  const router = useRouter();
  const initial = useMemo(
    () => parseSearchQuery(urlParams ?? new URLSearchParams()),
    [urlParams]
  );
  const s = useSearchState(initial);
  const [mobileOpen, setMobileOpen] = useState(false);

  const submit = useCallback(() => {
    const qs = buildSearchQuery(s.params);
    router.push(`/search${qs ? `?${qs}` : ""}`);
  }, [s.params, router]);

  return (
    <>
      <div className="md:hidden">
        <MobileSearchPill onClick={() => setMobileOpen(true)} />
      </div>

      <div className="hidden md:block">
        <HeroSearchBar
          className={className}
          activities={s.activities}
          neighborhood={s.neighborhood}
          when={s.when}
          ageCounts={s.ageCounts}
          ageLabel={s.ageLabel}
          onActivitiesChange={s.setActivities}
          onNeighborhoodChange={s.setNeighborhood}
          onWhenChange={s.setWhen}
          onAgeUpdate={s.handleAgeUpdate}
          onSubmit={submit}
        />
      </div>

      <MobileSearchOverlay
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activities={s.activities}
        neighborhood={s.neighborhood}
        when={s.when}
        ageCounts={s.ageCounts}
        ageLabel={s.ageLabel}
        onActivitiesChange={s.setActivities}
        onNeighborhoodChange={s.setNeighborhood}
        onWhenChange={s.setWhen}
        onAgeUpdate={s.handleAgeUpdate}
        onClearAll={s.clearAll}
        onSubmit={submit}
      />
    </>
  );
}
