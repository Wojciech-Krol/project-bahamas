"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { useEnrollments } from "@/context/enrollment-context";
import { classes } from "@/data/classes";
import { getGoogleCalendarUrl } from "@/lib/utils";
import styles from "../dashboard.module.scss";

export default function MyClassesPage() {
  const { enrollments, cancel } = useEnrollments();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");

  const grouped = useMemo(() => {
    const groups: Record<string, typeof enriched> = {};
    const enriched = activeEnrollments.map((e) => ({
      ...e,
      class: classes.find((c) => c.id === e.classId),
    }));

    for (const e of enriched) {
      const key = e.profileName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return groups;
  }, [activeEnrollments]);

  const now = new Date();

  return (
    <div>
      <h1 className={styles.pageTitle}>Moje zajęcia</h1>
      <p className={styles.pageSubtitle}>Zarządzaj zapisami dla siebie i swoich bliskich</p>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([profile, items]) => (
          <div key={profile} className={styles.classGroup}>
            <div className={styles.groupTitle}>
              Zajęcia: {profile}
            </div>
            {items.map((e) =>
              e.class ? (
                <div key={e.id} className={styles.classRow}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.class.imageUrl} alt={e.class.name} className={styles.classRowImg} />
                  <div className={styles.classRowInfo}>
                    <Link href={`/classes/${e.class.id}`}>
                      <div className={styles.classRowName}>{e.class.name}</div>
                    </Link>
                    <div className={styles.classRowSchedule}>
                      {e.class.schedule.map((s) => `${s.day} ${s.startTime}`).join(" · ")}
                    </div>
                  </div>
                  <div className={styles.classRowActions}>
                    <a
                      href={getGoogleCalendarUrl({
                        title: e.class.name,
                        description: e.class.description,
                        location: `${e.class.location.address}, ${e.class.location.city}`,
                        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(e.class.schedule[0].startTime), 0),
                        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(e.class.schedule[0].endTime), 0),
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className={styles.btnPrimary}>
                        <Calendar size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        GCal
                      </button>
                    </a>
                    <button className={styles.btnOutline} onClick={() => cancel(e.id)}>
                      Wypisz
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        ))
      ) : (
        <div className={styles.noData}>
          Nie masz jeszcze żadnych zapisów.
        </div>
      )}
    </div>
  );
}
