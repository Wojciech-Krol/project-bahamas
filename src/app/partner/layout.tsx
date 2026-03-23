"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users } from "lucide-react";
import styles from "../dashboard/layout.module.scss";

const links = [
  { href: "/partner", label: "Przegląd", icon: LayoutDashboard },
  { href: "/partner/classes", label: "Zarządzaj zajęciami", icon: BookOpen },
  { href: "/partner/enrollments", label: "Zapisy", icon: Users },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Panel szkoły</div>
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
