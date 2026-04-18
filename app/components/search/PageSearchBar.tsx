"use client";

import HeroSearchBar from "./HeroSearchBar";
import { useSearchState } from "./useSearchState";

export default function PageSearchBar({
  className = "w-full",
}: {
  className?: string;
}) {
  const s = useSearchState();
  return (
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
  );
}
