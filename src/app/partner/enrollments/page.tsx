"use client";

import { useMemo } from "react";
import { useEnrollments } from "@/context/enrollment-context";
import { classes } from "@/data/classes";
import { AGE_GROUP_LABELS } from "@/lib/types";
import styles from "../../dashboard/dashboard.module.scss";

export default function PartnerEnrollmentsPage() {
  const { enrollments } = useEnrollments();

  const schoolClasses = classes.filter((c) => c.schoolId === "school-1");

  const schoolEnrollments = useMemo(
    () =>
      enrollments
        .filter((e) => schoolClasses.some((sc) => sc.id === e.classId) && e.status === "active")
        .map((e) => ({
          ...e,
          class: schoolClasses.find((sc) => sc.id === e.classId)!,
        })),
    [enrollments, schoolClasses]
  );

  return (
    <div>
      <h1 className={styles.pageTitle}>Zapisy uczestników</h1>
      <p className={styles.pageSubtitle}>
        Lista osób zapisanych na Twoje zajęcia ({schoolEnrollments.length} aktywnych)
      </p>

      {schoolEnrollments.length > 0 ? (
        <div className={styles.upcomingList}>
          {schoolEnrollments.map((e) => (
            <div key={e.id} className={styles.upcomingItem}>
              <div
                className={`${styles.upcomingDot} ${
                  { kids: styles.dotKids, teens: styles.dotTeens, adults: styles.dotAdults }[e.class.ageGroup]
                }`}
              />
              <div className={styles.upcomingInfo}>
                <div className={styles.upcomingName}>{e.profileName}</div>
                <div className={styles.upcomingMeta}>
                  {e.class.name} &middot; {AGE_GROUP_LABELS[e.class.ageGroup]} &middot; Zapisano:{" "}
                  {e.enrolledAt}
                </div>
              </div>
              <span className={styles.upcomingProfile}>
                {e.profileType === "self" ? "Osoba dorosła" : "Dziecko/młodzież"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>Brak zapisów na Twoje zajęcia.</div>
      )}
    </div>
  );
}
