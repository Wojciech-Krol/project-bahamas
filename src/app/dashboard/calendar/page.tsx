"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEnrollments } from "@/context/enrollment-context";
import { classes } from "@/data/classes";
import { generateICS } from "@/lib/utils";
import styles from "../dashboard.module.scss";

const DAY_NAMES = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

const DAY_MAP: Record<string, number> = {
  "Poniedziałek": 0, "Wtorek": 1, "Środa": 2, "Czwartek": 3,
  "Piątek": 4, "Sobota": 5, "Niedziela": 6,
};

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const { enrollments } = useEnrollments();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const enrolledClasses = useMemo(
    () =>
      activeEnrollments
        .map((e) => ({
          enrollment: e,
          class: classes.find((c) => c.id === e.classId)!,
        }))
        .filter((e) => e.class),
    [activeEnrollments]
  );

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false });
  }

  const getEventsForDay = (dayIndex: number) => {
    return enrolledClasses.filter((ec) =>
      ec.class.schedule.some((s) => DAY_MAP[s.day] === dayIndex)
    );
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const exportAll = () => {
    const icsContent = enrolledClasses
      .map((ec) => {
        const s = ec.class.schedule[0];
        const startDate = new Date(year, month, today.getDate() + 1, parseInt(s.startTime), 0);
        const endDate = new Date(year, month, today.getDate() + 1, parseInt(s.endTime), 0);
        return generateICS({
          title: ec.class.name,
          description: ec.class.description,
          location: `${ec.class.location.address}, ${ec.class.location.city}`,
          startDate,
          endDate,
        });
      })
      .join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bahamas-zajecia.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kalendarz</h1>
      <p className={styles.pageSubtitle}>Przeglądaj swoje zajęcia w widoku kalendarza</p>

      <div className={styles.calHeader}>
        <button className={styles.calNavBtn} onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className={styles.calMonth}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button className={styles.calNavBtn} onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.calGrid}>
        {DAY_NAMES.map((d) => (
          <div key={d} className={styles.calDayName}>{d}</div>
        ))}
        {calendarDays.map((cd, i) => {
          const dayOfWeek = i % 7;
          const isToday = cd.isCurrentMonth && cd.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const events = cd.isCurrentMonth ? getEventsForDay(dayOfWeek) : [];

          return (
            <div
              key={i}
              className={`${styles.calDay} ${!cd.isCurrentMonth ? styles.calDayOther : ""} ${isToday ? styles.calDayToday : ""}`}
            >
              <div className={styles.calDayNum}>{cd.day}</div>
              {events.slice(0, 2).map((ev) => (
                <div
                  key={ev.enrollment.id}
                  className={`${styles.calEvent} ${
                    {
                      kids: styles.calEventKids,
                      teens: styles.calEventTeens,
                      adults: styles.calEventAdults,
                    }[ev.class.ageGroup]
                  }`}
                >
                  {ev.class.name.substring(0, 15)}
                </div>
              ))}
              {events.length > 2 && (
                <div style={{ fontSize: "0.6rem", color: "var(--color-text-secondary)" }}>
                  +{events.length - 2} więcej
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className={styles.exportBtn} onClick={exportAll}>
        <Download size={16} />
        Eksportuj do kalendarza (.ics)
      </button>
    </div>
  );
}
