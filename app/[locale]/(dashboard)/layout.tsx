import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/src/i18n/navigation";
import BrandLogo from "@/src/components/BrandLogo";
import { getCurrentUser } from "@/src/lib/db/server";

/**
 * Dashboard shell for internal tools (admin, future partner dashboard).
 *
 * Deliberately NOT the public Hakuna navbar — dashboards are distinct
 * surfaces and should look and feel different from marketing pages.
 *
 * Guard: admin-only. The spec says "if not admin, 404 (don't reveal
 * existence)" — so unauthenticated visitors and non-admin signed-in users
 * both get `notFound()`. We revalidate the session on every request via
 * `getCurrentUser()` (which uses `auth.getUser()` under the hood, not the
 * unsafe `getSession()`).
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // `getCurrentUser` throws when Supabase env is missing. Treat that the same
  // as "not an admin": notFound() — never leak existence of the dashboard,
  // never crash the page with a 500.
  let current;
  try {
    current = await getCurrentUser();
  } catch {
    notFound();
  }
  const role = current?.profile?.role as string | undefined;
  if (!current || role !== "admin") {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Admin" });

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <aside className="w-64 shrink-0 border-r border-on-surface/10 bg-surface-container-lowest flex flex-col">
        <div className="px-6 py-6 border-b border-on-surface/10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <BrandLogo size={28} />
            <span className="font-headline font-semibold text-sm uppercase tracking-wide text-on-surface/70">
              {t("nav.brandTag")}
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-on-surface hover:bg-on-surface/5"
          >
            {t("nav.partners")}
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-on-surface/10">
          <form action="/api/auth/logout" method="post">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-on-surface/80 hover:bg-on-surface/5"
            >
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-site mx-auto px-6 md:px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
