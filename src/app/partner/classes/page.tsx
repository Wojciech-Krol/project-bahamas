"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { classes } from "@/data/classes";
import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types";
import styles from "../../dashboard/dashboard.module.scss";
import detailStyles from "../../classes/[id]/page.module.scss";

export default function PartnerClassesPage() {
  const schoolClasses = classes.filter((c) => c.schoolId === "school-1");
  const [showForm, setShowForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleCreate = () => {
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowForm(false);
    }, 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.pageTitle}>Zarządzaj zajęciami</h1>
          <p className={styles.pageSubtitle}>Dodawaj, edytuj i usuwaj swoje zajęcia</p>
        </div>
        <button className={styles.btnPrimary} style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }} onClick={() => setShowForm(true)}>
          <Plus size={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Dodaj zajęcia
        </button>
      </div>

      {schoolClasses.map((c) => (
        <div key={c.id} className={styles.classRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.imageUrl} alt={c.name} className={styles.classRowImg} />
          <div className={styles.classRowInfo}>
            <div className={styles.classRowName}>
              {c.name}
              <span style={{ marginLeft: 8, fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: 50, background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>
                {AGE_GROUP_LABELS[c.ageGroup]}
              </span>
            </div>
            <div className={styles.classRowSchedule}>
              {CATEGORY_LABELS[c.category]} &middot; {c.price} zł/mies. &middot; {c.spotsLeft}/{c.spots} wolnych
            </div>
          </div>
          <div className={styles.classRowActions}>
            <button className={styles.btnPrimary}><Pencil size={14} /></button>
            <button className={styles.btnOutline}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className={detailStyles.overlay} onClick={() => setShowForm(false)}>
          <div className={detailStyles.modal} onClick={(e) => e.stopPropagation()}>
            {formSuccess ? (
              <div className={detailStyles.successMsg}>
                <h3>Zajęcia dodane!</h3>
                <p>Nowe zajęcia zostały dodane do Twojego profilu.</p>
              </div>
            ) : (
              <>
                <h2 className={detailStyles.modalTitle}>Dodaj nowe zajęcia</h2>
                <div className={detailStyles.field}>
                  <label className={detailStyles.fieldLabel}>Nazwa zajęć</label>
                  <input type="text" className={detailStyles.fieldInput} placeholder="np. Joga dla początkujących" />
                </div>
                <div className={detailStyles.field}>
                  <label className={detailStyles.fieldLabel}>Grupa wiekowa</label>
                  <select className={detailStyles.fieldSelect}>
                    <option value="kids">Dzieci</option>
                    <option value="teens">Młodzież</option>
                    <option value="adults">Dorośli</option>
                  </select>
                </div>
                <div className={detailStyles.field}>
                  <label className={detailStyles.fieldLabel}>Kategoria</label>
                  <select className={detailStyles.fieldSelect}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className={detailStyles.field}>
                  <label className={detailStyles.fieldLabel}>Cena (zł/mies.)</label>
                  <input type="number" className={detailStyles.fieldInput} placeholder="200" />
                </div>
                <div className={detailStyles.field}>
                  <label className={detailStyles.fieldLabel}>Liczba miejsc</label>
                  <input type="number" className={detailStyles.fieldInput} placeholder="15" />
                </div>
                <div className={detailStyles.modalActions}>
                  <button className={detailStyles.modalCancel} onClick={() => setShowForm(false)}>Anuluj</button>
                  <button className={detailStyles.modalSubmit} onClick={handleCreate}>Dodaj zajęcia</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
