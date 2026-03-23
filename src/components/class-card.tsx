"use client";

import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";
import { ClassItem, CATEGORY_LABELS, AGE_GROUP_LABELS } from "@/lib/types";
import styles from "./class-card.module.scss";

interface ClassCardProps {
  classItem: ClassItem;
}

export function ClassCard({ classItem }: ClassCardProps) {
  const badgeClass = {
    kids: styles.badgeKids,
    teens: styles.badgeTeens,
    adults: styles.badgeAdults,
  }[classItem.ageGroup];

  const spotsLow = classItem.spotsLeft <= 3;

  return (
    <Link href={`/classes/${classItem.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={classItem.imageUrl} alt={classItem.name} />
        <span className={`${styles.badge} ${badgeClass}`}>
          {AGE_GROUP_LABELS[classItem.ageGroup]}
        </span>
        <span className={`${styles.spotsTag} ${spotsLow ? styles.spotsLow : ""}`}>
          {classItem.spotsLeft} {classItem.spotsLeft === 1 ? "miejsce" : "miejsc"}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.category}>{CATEGORY_LABELS[classItem.category]}</div>
        <h3 className={styles.name}>{classItem.name}</h3>

        <div className={styles.meta}>
          <span className={`${styles.metaItem} ${styles.rating}`}>
            <Star size={14} fill="currentColor" />
            {classItem.rating.toFixed(1)} ({classItem.reviewCount})
          </span>
          <span className={styles.metaItem}>
            <Clock size={14} />
            {classItem.schedule[0]?.day}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>
            {classItem.price} zł<span className={styles.priceUnit}>/mies.</span>
          </span>
          <span className={styles.location}>
            <MapPin size={13} />
            {classItem.location.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
