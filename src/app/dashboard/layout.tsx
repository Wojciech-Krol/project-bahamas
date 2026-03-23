"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar } from "lucide-react";
import styles from "./layout.module.scss";

const links = [
  { href: "/dashboard", label: "Przegląd", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "Moje zajęcia", icon: BookOpen },
  { href: "/dashboard/calendar", label: "Kalendarz", icon: Calendar },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Panel użytkownika</div>
        <ul className={styles.nav}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
