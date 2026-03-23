"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AgeGroup,
  Category,
  AGE_GROUP_LABELS,
  CATEGORY_LABELS,
} from "@/lib/types";
import { classes } from "@/data/classes";
import { ClassCard } from "@/components/class-card";
import { Map } from "@/components/map";
import styles from "./page.module.scss";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialAge = (searchParams.get("ageGroup") as AgeGroup) || "kids";
  const initialQuery = searchParams.get("q") || "";

  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialAge);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc">("rating");
  const [query] = useState(initialQuery);

  const filteredClasses = useMemo(() => {
    let result = classes.filter((c) => c.ageGroup === ageGroup);

    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }

    result = result.filter((c) => c.price <= maxPrice);

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "rating":
      default:
        return [...result].sort((a, b) => b.rating - a.rating);
    }
  }, [ageGroup, selectedCategories, maxPrice, sortBy, query]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const allCategories = Object.keys(CATEGORY_LABELS) as Category[];

  return (
    <div className={`${styles.page} container`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Znajdź zajęcia</h1>
        <div className={styles.ageTabs}>
          {(["kids", "teens", "adults"] as AgeGroup[]).map((ag) => (
            <button
              key={ag}
              className={`${styles.ageTab} ${ageGroup === ag ? styles.ageTabActive : ""}`}
              onClick={() => setAgeGroup(ag)}
            >
              {AGE_GROUP_LABELS[ag]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <h3 className={styles.filterTitle}>Filtry</h3>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Kategoria</span>
            <div className={styles.filterChips}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.chip} ${
                    selectedCategories.includes(cat) ? styles.chipActive : ""
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Maks. cena: {maxPrice} zł</span>
            <div className={styles.priceRange}>
              <span>0</span>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <span>500 zł</span>
            </div>
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.mapWrap}>
            <Map
              classes={filteredClasses}
              height="250px"
              onMarkerClick={(c) => router.push(`/classes/${c.id}`)}
            />
          </div>

          <div className={styles.sortBar}>
            <span className={styles.resultCount}>
              {filteredClasses.length} {filteredClasses.length === 1 ? "wynik" : "wyników"}
            </span>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="rating">Najwyżej oceniane</option>
              <option value="price-asc">Cena: od najniższej</option>
              <option value="price-desc">Cena: od najwyższej</option>
            </select>
          </div>

          {filteredClasses.length > 0 ? (
            <div className={styles.grid}>
              {filteredClasses.map((c) => (
                <ClassCard key={c.id} classItem={c} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              Nie znaleziono zajęć spełniających kryteria. Spróbuj zmienić filtry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
