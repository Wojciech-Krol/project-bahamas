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
    <aside>
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          // `/account` is the profile page → only active for an exact
          // match. Sub-routes are active for prefix match.
          const active =
            item.href === "/account"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <Icon name={item.icon} className="text-[18px]" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
