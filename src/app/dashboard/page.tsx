"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useEnrollments } from "@/context/enrollment-context";
import { classes } from "@/data/classes";
import styles from "./dashboard.module.scss";

export default function DashboardOverview() {
  const { userName } = useAuth();
  const { enrollments } = useEnrollments();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");

  const enriched = useMemo(
    () =>
      activeEnrollments.map((e) => ({
        ...e,
        class: classes.find((c) => c.id === e.classId),
      })),
    [activeEnrollments]
  );

  const uniqueProfiles = [...new Set(activeEnrollments.map((e) => e.profileName))];

  return (
    <div>
      <h1 className={styles.pageTitle}>Cześć, {userName || "Użytkownik"}!</h1>
      <p className={styles.pageSubtitle}>Oto przegląd Twoich zajęć</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Aktywne zapisy</div>
          <div className={styles.statValue}>{activeEnrollments.length}</div>
          <div className={styles.statSub}>we wszystkich profilach</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Profile</div>
          <div className={styles.statValue}>{uniqueProfiles.length}</div>
          <div className={styles.statSub}>{uniqueProfiles.join(", ")}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Najbliższe zajęcia</div>
          <div className={styles.statValue} style={{ fontSize: "1.1rem" }}>
            {enriched[0]?.class?.name || "—"}
          </div>
          <div className={styles.statSub}>
            {enriched[0]?.class?.schedule[0]?.day} {enriched[0]?.class?.schedule[0]?.startTime}
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Nadchodzące zajęcia</h2>
      <div className={styles.upcomingList}>
        {enriched.length > 0 ? (
          enriched.map((e) =>
            e.class ? (
              <div key={e.id} className={styles.upcomingItem}>
                <div
                  className={`${styles.upcomingDot} ${
                    {
                      kids: styles.dotKids,
                      teens: styles.dotTeens,
                      adults: styles.dotAdults,
                    }[e.class.ageGroup]
                  }`}
                />
                <div className={styles.upcomingInfo}>
                  <div className={styles.upcomingName}>{e.class.name}</div>
                  <div className={styles.upcomingMeta}>
                    {e.class.schedule[0]?.day} {e.class.schedule[0]?.startTime}–
                    {e.class.schedule[0]?.endTime} &middot; {e.class.location.address}
                  </div>
                </div>
                <span className={styles.upcomingProfile}>{e.profileName}</span>
              </div>
            ) : null
          )
        ) : (
          <div className={styles.noData}>
            Nie masz jeszcze żadnych zapisów. Przeglądaj zajęcia i zapisz się!
          </div>
        )}
      </div>
    </div>
  );
}
