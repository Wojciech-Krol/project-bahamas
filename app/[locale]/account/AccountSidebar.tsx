"use client";

import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";
import { Link, usePathname } from "@/src/i18n/navigation";

type AccountHref =
  | "/account"
  | "/account/bookings"
  | "/account/favorites"
  | "/account/calendar";

const NAV_ITEMS: ReadonlyArray<{
  href: AccountHref;
  icon: string;
  labelKey: string;
}> = [
  { href: "/account", icon: "person", labelKey: "nav.profile" },
  { href: "/account/bookings", icon: "event", labelKey: "nav.bookings" },
  { href: "/account/favorites", icon: "favorite", labelKey: "nav.favorites" },
  { href: "/account/calendar", icon: "calendar_month", labelKey: "nav.calendar" },
];

export default function AccountSidebar() {
  const t = useTranslations("Account");
  const pathname = usePathname();

  return (
    <aside className="md:sticky md:top-28">
      <nav
        className={[
          // Mobile: horizontal pill rail; Desktop: editorial card column
          "flex gap-2 overflow-x-auto no-scrollbar pb-1",
          "md:flex-col md:gap-1 md:overflow-visible md:p-3",
          "md:bg-surface-container-lowest md:border md:border-on-surface/[0.06]",
          "md:rounded-[1.5rem] md:editorial-shadow",
        ].join(" ")}
        aria-label={t("nav.aria")}
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/account"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                "px-4 py-2.5 md:px-3 md:py-3",
                active
                  ? "bg-primary text-on-primary editorial-shadow md:translate-x-0"
                  : "bg-surface-container-low text-on-surface hover:bg-primary-fixed hover:text-primary md:bg-transparent md:hover:bg-primary-fixed",
              ].join(" ")}
            >
              <span
                className={[
                  "flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors",
                  active
                    ? "bg-on-primary/15 text-on-primary"
                    : "bg-primary-fixed text-primary group-hover:bg-primary group-hover:text-on-primary",
                ].join(" ")}
              >
                <Icon
                  name={item.icon}
                  filled={active && item.icon === "favorite"}
                  className="text-[18px]"
                />
              </span>
              <span className="font-headline tracking-tight">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
