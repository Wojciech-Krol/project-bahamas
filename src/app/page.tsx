"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarCheck, Rocket, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [isSwitchingAge, setIsSwitchingAge] = useState(false);

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
  const heroClass = filteredClasses[0] ?? classes[0];

  useEffect(() => {
    setIsSwitchingAge(true);
    const timeout = setTimeout(() => setIsSwitchingAge(false), 220);
    return () => clearTimeout(timeout);
  }, [selectedAge]);

  const fadeUp = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.24 },
    transition: { duration: 0.42, ease: "easeOut" },
  } as const;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGlowPrimary} />
        <div className={styles.heroGlowWarm} />
        <div className={`container ${styles.heroInner}`}>
          <motion.div className={styles.heroContent} {...fadeUp}>
            <div className={styles.heroTag}>
              <Rocket size={14} />
              Nowe warsztaty otwarte
            </div>
            <h1 className={styles.heroTitle}>
              Odblokuj rodzinną
              <span className={styles.heroHighlight}> kreatywność.</span>
            </h1>
            <p className={styles.heroSub}>
              Wyszukuj najlepsze zajęcia w swojej okolicy. Sport, taniec, warsztaty i technologia -
              wszystko w jednym miejscu.
            </p>
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
                Przeglądaj
              </button>
            </div>
            <div className={styles.trustRow}>
              <div className={styles.trustAvatars}>
                <span>JD</span>
                <span>MK</span>
                <span>SR</span>
              </div>
              <p>Dołącz do 500+ rodzin uczących się z Bahamas</p>
            </div>
          </motion.div>
          <motion.div className={styles.heroVisual} {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroClass.imageUrl} alt={heroClass.name} className={styles.heroImage} />
            <div className={styles.heroBadge}>
              <div className={styles.heroBadgeIcon}>
                <Star size={14} />
              </div>
              <div>
                <strong>Top Rated</strong>
                <p>{heroClass.category}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.ageStage}>
        <div className="container">
          <motion.div className={styles.sectionHead} {...fadeUp}>
            <h2 className={styles.sectionTitle}>Zajęcia na każdym etapie</h2>
            <p className={styles.sectionSub}>Wybierz grupę wiekową i odkrywaj zajęcia dopasowane do celu.</p>
          </motion.div>
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
                <span className={styles.ageTabCta}>Odkryj</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className="container">
          <motion.div className={styles.sectionHead} {...fadeUp}>
            <h2 className={styles.sectionTitle}>Zajęcia w Twojej okolicy</h2>
            <p className={styles.sectionSub}>
            {AGE_GROUP_LABELS[selectedAge]} — {filteredClasses.length} dostępnych zajęć w Warszawie
            </p>
          </motion.div>
          <Map
            classes={filteredClasses}
            height="350px"
            onMarkerClick={(c) => router.push(`/classes/${c.id}`)}
          />
        </div>
      </section>

      <section className={styles.featured}>
        <div className="container">
          <motion.div className={styles.sectionHead} {...fadeUp}>
            <h2 className={styles.sectionTitle}>Popularne zajęcia</h2>
            <p className={styles.sectionSub}>
              Najlepiej oceniane zajęcia z kategorii: {AGE_GROUP_LABELS[selectedAge]}
            </p>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={styles.classGrid}
            >
              {isSwitchingAge
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className={styles.classSkeleton}>
                      <div className={styles.classSkeletonMedia} />
                      <div className={styles.classSkeletonBody}>
                        <div className={styles.classSkeletonLineSm} />
                        <div className={styles.classSkeletonLineMd} />
                        <div className={styles.classSkeletonLineXs} />
                      </div>
                    </div>
                  ))
                : featuredClasses.map((c) => <ClassCard key={c.id} classItem={c} />)}
            </motion.div>
          </AnimatePresence>
          <button className={styles.viewAll} onClick={() => router.push(`/search?ageGroup=${selectedAge}`)}>
            Zobacz wszystkie zajęcia
          </button>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className="container">
          <motion.div className={styles.howLayout} {...fadeUp}>
            <div>
              <h2 className={styles.sectionTitle}>
                Gotowy do nauki?
                <span className={styles.howHighlight}> To proste.</span>
              </h2>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepIndex}>1</div>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>Wyszukaj</h3>
                    <p className={styles.stepDesc}>
                      Przeglądaj zajęcia w swojej okolicy. Filtruj po kategorii, wieku i lokalizacji.
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepIndex}>2</div>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>Zapisz się</h3>
                    <p className={styles.stepDesc}>
                      Wybierz odpowiedni termin i zapisz siebie lub swoje dziecko — szybko i wygodnie.
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepIndex}>3</div>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>Rozwijaj się</h3>
                    <p className={styles.stepDesc}>
                      Śledź postępy, synchronizuj z kalendarzem i odkrywaj nowe pasje.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.howVisual}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredClasses[1]?.imageUrl ?? heroClass.imageUrl} alt="Zajęcia Bahamas" />
              <div className={styles.howBubble}>
                <CalendarCheck size={16} />
                Harmonogram gotowy
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
