"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, MapPin, Clock, Users, Calendar } from "lucide-react";
import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types";
import { classes } from "@/data/classes";
import { schools } from "@/data/schools";
import { reviews } from "@/data/reviews";
import { useAuth } from "@/context/auth-context";
import { useEnrollments } from "@/context/enrollment-context";
import { Map } from "@/components/map";
import { getGoogleCalendarUrl } from "@/lib/utils";
import styles from "./page.module.scss";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, profiles } = useAuth();
  const { enroll: doEnroll } = useEnrollments();
  const [showModal, setShowModal] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [formData, setFormData] = useState({ profileName: "", contactName: "", phone: "" });

  const classItem = classes.find((c) => c.id === params.id);
  if (!classItem) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2>Nie znaleziono zajęć</h2>
        <button className={styles.back} onClick={() => router.back()}>
          Wróć
        </button>
      </div>
    );
  }

  const school = schools.find((s) => s.id === classItem.schoolId);
  const classReviews = reviews.filter((r) => r.classId === classItem.id);

  const badgeClass = {
    kids: styles.badgeKids,
    teens: styles.badgeTeens,
    adults: styles.badgeAdults,
  }[classItem.ageGroup];

  const isAdult = classItem.ageGroup === "adults";

  const handleEnroll = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const submitEnroll = () => {
    doEnroll({
      classId: classItem.id,
      profileName: formData.profileName || formData.contactName,
      profileType: isAdult ? "self" : "child",
    });
    setEnrollSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setEnrollSuccess(false);
    }, 2500);
  };

  const nextSchedule = classItem.schedule[0];
  const now = new Date();
  const calUrl = nextSchedule
    ? getGoogleCalendarUrl({
        title: classItem.name,
        description: classItem.description,
        location: classItem.location.address + ", " + classItem.location.city,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(nextSchedule.startTime), 0),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(nextSchedule.endTime), 0),
      })
    : "#";

  return (
    <div className={`${styles.page} container`}>
      <button className={styles.back} onClick={() => router.back()}>
        <ArrowLeft size={16} /> Wróć do wyników
      </button>

      <div className={styles.grid}>
        <div>
          <div className={styles.imageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={classItem.imageUrl} alt={classItem.name} />
          </div>

          <div className={styles.badges}>
            <span className={`${styles.badge} ${badgeClass}`}>
              {AGE_GROUP_LABELS[classItem.ageGroup]}
            </span>
            <span className={styles.catBadge}>{CATEGORY_LABELS[classItem.category]}</span>
          </div>

          <h1 className={styles.name}>{classItem.name}</h1>

          <div className={styles.meta}>
            <span className={`${styles.metaItem} ${styles.ratingItem}`}>
              <Star size={16} fill="currentColor" />
              {classItem.rating.toFixed(1)} ({classItem.reviewCount} opinii)
            </span>
            <span className={styles.metaItem}>
              <MapPin size={16} />
              {classItem.location.address}, {classItem.location.city}
            </span>
            <span className={styles.metaItem}>
              <Users size={16} />
              Wiek: {classItem.ageRange.min}–{classItem.ageRange.max} lat
            </span>
          </div>

          <p className={styles.description}>{classItem.description}</p>

          <h3 className={styles.scheduleTitle}>Harmonogram</h3>
          <ul className={styles.scheduleList}>
            {classItem.schedule.map((s, i) => (
              <li key={i} className={styles.scheduleItem}>
                <Clock size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                {s.day} {s.startTime}–{s.endTime}
              </li>
            ))}
          </ul>

          <h3 className={styles.mapTitle}>Lokalizacja</h3>
          <Map classes={[classItem]} center={[classItem.location.lat, classItem.location.lng]} zoom={15} height="250px" />

          {classReviews.length > 0 && (
            <div className={styles.reviews}>
              <h3 className={styles.reviewsTitle}>Opinie ({classReviews.length})</h3>
              {classReviews.map((r) => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewAuthor}>{r.authorName}</span>
                    <span className={styles.reviewDate}>{r.date}</span>
                  </div>
                  <div className={styles.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.priceCard}>
            <div className={styles.priceAmount}>
              {classItem.price} zł<span>/mies.</span>
            </div>
            <div className={`${styles.spots} ${classItem.spotsLeft <= 3 ? styles.spotsLow : ""}`}>
              Pozostało {classItem.spotsLeft} z {classItem.spots} miejsc
            </div>
            <button className={styles.enrollBtn} onClick={handleEnroll}>
              Zapisz się
            </button>
            <a href={calUrl} target="_blank" rel="noopener noreferrer">
              <button className={styles.calendarBtn}>
                <Calendar size={16} /> Dodaj do Google Calendar
              </button>
            </a>
          </div>

          {school && (
            <div className={styles.schoolCard}>
              <h4 className={styles.schoolName}>{school.name}</h4>
              <p className={styles.schoolDesc}>{school.description}</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => !enrollSuccess && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {enrollSuccess ? (
              <div className={styles.successMsg}>
                <h3>Zapisano!</h3>
                <p>Zapis na zajęcia &quot;{classItem.name}&quot; został potwierdzony.</p>
              </div>
            ) : (
              <>
                <h2 className={styles.modalTitle}>
                  Zapisz się na: {classItem.name}
                </h2>

                {!isAdult && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Dla kogo?</label>
                    {profiles.length > 0 ? (
                      <select
                        className={styles.fieldSelect}
                        value={formData.profileName}
                        onChange={(e) => setFormData((p) => ({ ...p, profileName: e.target.value }))}
                      >
                        <option value="">Wybierz profil...</option>
                        {profiles
                          .filter((p) => p.type === "child")
                          .map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.age} lat)
                            </option>
                          ))}
                        <option value="__new">+ Nowy profil</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className={styles.fieldInput}
                        placeholder="Imię dziecka"
                        value={formData.profileName}
                        onChange={(e) => setFormData((p) => ({ ...p, profileName: e.target.value }))}
                      />
                    )}
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {isAdult ? "Twoje imię i nazwisko" : "Imię rodzica / opiekuna"}
                  </label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    placeholder={isAdult ? "np. Jan Kowalski" : "np. Anna Nowak"}
                    value={formData.contactName}
                    onChange={(e) => setFormData((p) => ({ ...p, contactName: e.target.value }))}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Telefon kontaktowy</label>
                  <input
                    type="tel"
                    className={styles.fieldInput}
                    placeholder="+48 123 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.modalCancel} onClick={() => setShowModal(false)}>
                    Anuluj
                  </button>
                  <button className={styles.modalSubmit} onClick={submitEnroll}>
                    Potwierdź zapis
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
