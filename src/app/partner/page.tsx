"use client";

import { useAuth } from "@/context/auth-context";
import { useEnrollments } from "@/context/enrollment-context";
import { classes } from "@/data/classes";
import styles from "../dashboard/dashboard.module.scss";

export default function PartnerOverview() {
  const { userName } = useAuth();
  const { enrollments } = useEnrollments();

  const schoolClasses = classes.filter((c) => c.schoolId === "school-1");
  const schoolEnrollments = enrollments.filter((e) =>
    schoolClasses.some((sc) => sc.id === e.classId) && e.status === "active"
  );

  const totalSpots = schoolClasses.reduce((sum, c) => sum + c.spots, 0);
  const totalFilled = totalSpots - schoolClasses.reduce((sum, c) => sum + c.spotsLeft, 0);

  return (
    <div>
      <h1 className={styles.pageTitle}>Witaj, {userName || "Szkoła"}!</h1>
      <p className={styles.pageSubtitle}>Przegląd Twojej szkoły na platformie Bahamas</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Twoje zajęcia</div>
          <div className={styles.statValue}>{schoolClasses.length}</div>
          <div className={styles.statSub}>aktywnych ogłoszeń</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Łączne zapisy</div>
          <div className={styles.statValue}>{schoolEnrollments.length}</div>
          <div className={styles.statSub}>aktywnych uczestników</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Zajętość miejsc</div>
          <div className={styles.statValue}>
            {totalSpots > 0 ? Math.round((totalFilled / totalSpots) * 100) : 0}%
          </div>
          <div className={styles.statSub}>{totalFilled} / {totalSpots} miejsc</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Przychód (szac.)</div>
          <div className={styles.statValue}>
            {schoolEnrollments.reduce((sum, e) => {
              const cls = schoolClasses.find((c) => c.id === e.classId);
              return sum + (cls?.price || 0);
            }, 0).toLocaleString("pl-PL")}{" "}
            zł
          </div>
          <div className={styles.statSub}>miesięcznie</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Twoje zajęcia</h2>
      <div className={styles.upcomingList}>
        {schoolClasses.map((c) => (
          <div key={c.id} className={styles.upcomingItem}>
            <div
              className={`${styles.upcomingDot} ${
                { kids: styles.dotKids, teens: styles.dotTeens, adults: styles.dotAdults }[c.ageGroup]
              }`}
            />
            <div className={styles.upcomingInfo}>
              <div className={styles.upcomingName}>{c.name}</div>
              <div className={styles.upcomingMeta}>
                {c.schedule.map((s) => `${s.day} ${s.startTime}`).join(" · ")} &middot;{" "}
                {c.spotsLeft}/{c.spots} wolnych
              </div>
            </div>
            <span className={styles.upcomingProfile}>
              {c.price} zł/mies.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
