"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../../src/i18n/navigation";
import { Icon } from "../Icon";
import BrandLogo from "../BrandLogo";
import VenueSwitcher from "./VenueSwitcher";
import { CURRENT_USER }  from "@/src/lib/partnerMockData";

type NavItem = {
  href: string;
  icon: string;
  labelKey: string;
  badge?: string;
  badgeMuted?: string;
  dot?: boolean;
};

const PRIMARY: NavItem[] = [
  { href: "/partner", icon: "dashboard", labelKey: "overview" },
  { href: "/partner/classes", icon: "event_note", labelKey: "classes", badge: "12" },
  { href: "/partner/instructors", icon: "groups", labelKey: "instructors", badgeMuted: "6" },
  { href: "/partner/bookings", icon: "confirmation_number", labelKey: "bookings" },
  { href: "/partner/reviews", icon: "reviews", labelKey: "reviews", dot: true },
  { href: "/partner/insights", icon: "insights", labelKey: "insights" },
];

const SECONDARY: NavItem[] = [
  { href: "/partner/venue", icon: "storefront", labelKey: "venue" },
  { href: "/partner/promote", icon: "rocket_launch", labelKey: "promote" },
  { href: "/partner/payouts", icon: "payments", labelKey: "payouts" },
  { href: "/partner/payments", icon: "payments", labelKey: "payments" },
  { href: "/partner/plans", icon: "card_membership", labelKey: "plans" },
  { href: "/partner/integrations", icon: "sync", labelKey: "integrations" },
  { href: "/partner/settings", icon: "settings", labelKey: "settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/partner") return pathname === "/partner";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const t = useTranslations("Partner");
  const base =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors";
  const cls = active
    ? `${base} bg-primary text-on-primary font-semibold`
    : `${base} text-on-surface/80 hover:bg-primary-fixed/30 hover:text-primary`;

  return (
    <Link href={item.href} className={cls}>
      <Icon name={item.icon} className="text-[20px]" />
      <span className="flex-1">{t(`nav.${item.labelKey}`)}</span>
      {item.badge && (
        <span
          className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
            active ? "bg-on-primary/20 text-on-primary" : "bg-primary-fixed text-primary"
          }`}
        >
          {item.badge}
        </span>
      )}
      {item.badgeMuted && !active && (
        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface/60">
          {item.badgeMuted}
        </span>
      )}
      {item.dot && !active && <span className="w-2 h-2 rounded-full bg-primary" />}
    </Link>
  );
}

export default function PartnerSidebar() {
  const t = useTranslations("Partner");
  const tMock = useTranslations("Partner.mock.user");
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-surface-container-low border-r border-on-surface/5 px-5 py-6 flex flex-col min-h-screen">
      <Link href="/partner" className="flex items-center gap-2.5 mb-8 px-2">
        <BrandLogo size={28} />
        <div className="h-4 w-px bg-on-surface/20" />
        <div className="text-[0.6rem] font-headline font-bold uppercase tracking-[0.2em] text-on-surface/60">
          {t("brand")}
        </div>
      </Link>

      <VenueSwitcher />

      <nav className="space-y-1 flex-1 mt-6">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <div className="h-px bg-on-surface/5 my-3" />
        {SECONDARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-on-surface/5 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${CURRENT_USER.avatarGradient} text-on-secondary-container flex items-center justify-center font-bold text-sm`}
        >
          {tMock("initials")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{tMock("name")}</div>
          <div className="text-[0.65rem] text-on-surface/50">
            {t(`roles.${CURRENT_USER.role}`)}
          </div>
        </div>
        <Link
          href="/partner/login"
          className="text-on-surface/40 hover:text-primary"
          aria-label={t("nav.logout")}
        >
          <Icon name="logout" className="text-[20px]" />
        </Link>
      </div>
    </aside>
  );
}
