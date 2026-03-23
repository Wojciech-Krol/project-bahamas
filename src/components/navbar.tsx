"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import styles from "./navbar.module.scss";

export function Navbar() {
  const { isLoggedIn, role, userName, logout } = useAuth();

  const dashboardPath = role === "school" ? "/partner" : "/dashboard";

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <GraduationCap size={28} />
          <span>Bahamas</span>
        </Link>

        <ul className={styles.links}>
          <li>
            <Link href="/search?ageGroup=kids" className={styles.link}>
              Dzieci
            </Link>
          </li>
          <li>
            <Link href="/search?ageGroup=teens" className={styles.link}>
              Młodzież
            </Link>
          </li>
          <li>
            <Link href="/search?ageGroup=adults" className={styles.link}>
              Dorośli
            </Link>
          </li>
        </ul>

        <div className={styles.actions}>
          {isLoggedIn ? (
            <>
              <Link href={dashboardPath}>
                <button className={styles.dashboardBtn}>
                  {role === "school" ? "Panel szkoły" : `Cześć, ${userName}`}
                </button>
              </Link>
              <button className={styles.logoutBtn} onClick={logout}>
                Wyloguj
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className={styles.loginBtn}>Zaloguj się</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
