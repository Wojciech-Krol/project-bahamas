"use client";

import { useState } from "react";
import HeroSearchBar from "./HeroSearchBar";
import { MobileSearchPill, MobileSearchOverlay } from "./MobileSearch";
import { useSearchState } from "./useSearchState";

export default function PageSearchBar({
  className = "w-full",
}: {
  className?: string;
}) {
  const s = useSearchState();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile pill */}
      <div className="md:hidden">
        <MobileSearchPill onClick={() => setMobileOpen(true)} />
      </div>

      {/* Desktop full bar */}
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
      />
    </>
  );
}
