"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarCheck, Sparkles } from "lucide-react";
import { AgeGroup, AGE_GROUP_LABELS } from "@/lib/types";
import { classes } from "@/data/classes";
import { ClassCard } from "@/components/class-card";
import { Map } from "@/components/map";
import styles from "./page.module.scss";

const AGE_GROUP_EMOJI: Record<AgeGroup, string> = {
  kids: "🧒",
  teens: "🎓",
  adults: "🧑",
};

export default function HomePage() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<AgeGroup>("kids");
  const [query, setQuery] = useState("");

  const filteredClasses = useMemo(
    () => classes.filter((c) => c.ageGroup === selectedAge),
    [selectedAge]
  );

  const featuredClasses = filteredClasses.slice(0, 6);

  const handleSearch = () => {
    const params = new URLSearchParams({ ageGroup: selectedAge });
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  };

  const classCounts: Record<AgeGroup, number> = {
    kids: classes.filter((c) => c.ageGroup === "kids").length,
    teens: classes.filter((c) => c.ageGroup === "teens").length,
    adults: classes.filter((c) => c.ageGroup === "adults").length,
  };

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Znajdź idealne zajęcia dla siebie i&nbsp;swoich bliskich
          </h1>
          <p className={styles.heroSub}>
            Przeglądaj setki zajęć dodatkowych w Twojej okolicy. Sport, sztuka, muzyka, technologia i
            więcej.
          </p>

          <div className={styles.ageTabs}>
            {(["kids", "teens", "adults"] as AgeGroup[]).map((ag) => (
              <button
                key={ag}
                className={`${styles.ageTab} ${selectedAge === ag ? styles.ageTabActive : ""} theme-${ag}`}
                onClick={() => setSelectedAge(ag)}
              >
                <span className={styles.ageTabEmoji}>{AGE_GROUP_EMOJI[ag]}</span>
                <span className={styles.ageTabLabel}>{AGE_GROUP_LABELS[ag]}</span>
                <span className={styles.ageTabCount}>{classCounts[ag]} zajęć</span>
              </button>
            ))}
          </div>

          <div className={styles.searchBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Szukaj zajęć, np. balet, programowanie, joga..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              <Search size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Szukaj
            </button>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Zajęcia w Twojej okolicy</h2>
          <p className={styles.sectionSub}>
            {AGE_GROUP_LABELS[selectedAge]} — {filteredClasses.length} dostępnych zajęć w Warszawie
          </p>
          <Map
            classes={filteredClasses}
            height="350px"
            onMarkerClick={(c) => router.push(`/classes/${c.id}`)}
          />
        </div>
      </section>

      <section className={styles.featured}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Popularne zajęcia</h2>
          <p className={styles.sectionSub}>
            Najlepiej oceniane zajęcia z kategorii: {AGE_GROUP_LABELS[selectedAge]}
          </p>
          <div className={styles.classGrid}>
            {featuredClasses.map((c) => (
              <ClassCard key={c.id} classItem={c} />
            ))}
          </div>
          <button className={styles.viewAll} onClick={() => router.push(`/search?ageGroup=${selectedAge}`)}>
            Zobacz wszystkie zajęcia
          </button>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Jak to działa?</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <Search size={28} />
              </div>
              <h3 className={styles.stepTitle}>1. Wyszukaj</h3>
              <p className={styles.stepDesc}>
                Przeglądaj zajęcia w swojej okolicy. Filtruj po kategorii, wieku i lokalizacji.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <CalendarCheck size={28} />
              </div>
              <h3 className={styles.stepTitle}>2. Zapisz się</h3>
              <p className={styles.stepDesc}>
                Wybierz odpowiedni termin i zapisz siebie lub swoje dziecko — szybko i wygodnie.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <Sparkles size={28} />
              </div>
              <h3 className={styles.stepTitle}>3. Rozwijaj się</h3>
              <p className={styles.stepDesc}>
                Śledź postępy, synchronizuj z kalendarzem i odkrywaj nowe pasje.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
