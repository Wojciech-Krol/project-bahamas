"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, School } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/lib/types";
import styles from "./page.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!selectedRole || !name.trim()) return;
    login(selectedRole, name.trim());
    router.push(selectedRole === "school" ? "/partner" : "/dashboard");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Witaj w Bahamas</h1>
        <p className={styles.subtitle}>Wybierz jak chcesz korzystać z platformy</p>

        <div className={styles.roles}>
          <button
            className={styles.roleBtn}
            style={{
              borderColor: selectedRole === "user" ? "var(--color-primary)" : undefined,
              background: selectedRole === "user" ? "#f8faff" : undefined,
            }}
            onClick={() => setSelectedRole("user")}
          >
            <div className={`${styles.roleIcon} ${styles.roleIconUser}`}>
              <User size={24} />
            </div>
            <div>
              <div className={styles.roleTitle}>Szukam zajęć</div>
              <div className={styles.roleDesc}>Dla siebie, dziecka lub rodziny</div>
            </div>
          </button>

          <button
            className={styles.roleBtn}
            style={{
              borderColor: selectedRole === "school" ? "var(--color-primary)" : undefined,
              background: selectedRole === "school" ? "#f8faff" : undefined,
            }}
            onClick={() => setSelectedRole("school")}
          >
            <div className={`${styles.roleIcon} ${styles.roleIconSchool}`}>
              <School size={24} />
            </div>
            <div>
              <div className={styles.roleTitle}>Prowadzę zajęcia</div>
              <div className={styles.roleDesc}>Szkoła, instruktor lub organizacja</div>
            </div>
          </button>
        </div>

        {selectedRole && (
          <>
            <div className={styles.nameField}>
              <label className={styles.nameLabel}>
                {selectedRole === "school" ? "Nazwa szkoły / organizacji" : "Twoje imię"}
              </label>
              <input
                type="text"
                className={styles.nameInput}
                placeholder={selectedRole === "school" ? "np. Akademia Ruchu" : "np. Anna"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button
              className={styles.submitBtn}
              disabled={!name.trim()}
              onClick={handleSubmit}
            >
              {selectedRole === "school" ? "Przejdź do panelu szkoły" : "Przejdź do platformy"}
            </button>
          </>
        )}

        <div className={styles.note}>
          To jest wersja demo — logowanie nie wymaga hasła ani rejestracji.
        </div>
      </div>
    </div>
  );
}
