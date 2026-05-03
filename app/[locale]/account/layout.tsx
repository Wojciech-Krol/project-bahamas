import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

import SiteNavbar from "@/src/components/SiteNavbar";
import SiteFooter from "@/src/components/SiteFooter";
import { getCurrentUser } from "@/src/lib/db/server";

import AccountSidebar from "./AccountSidebar";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let current;
  try {
    current = await getCurrentUser();
  } catch {
    current = null;
  }
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }

  const t = await getTranslations({ locale, namespace: "Account" });

  const fullName = (current.profile?.full_name as string | null) ?? null;
  const email = current.user.email ?? "";
  const initial = (fullName ?? email).trim().charAt(0).toUpperCase() || "·";

  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen pt-24 md:pt-32 pb-20">
        <div className="mx-auto max-w-site px-4 md:px-6">
          {/* Editorial greeting hero — same vibe as activity / school heroes */}
          <header className="mb-10 md:mb-14">
            <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
              {t("greetingBadge")}
            </span>
            <div className="flex items-end gap-5 flex-wrap">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-extrabold text-3xl md:text-4xl shrink-0 editorial-shadow">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-headline font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.05] text-on-surface">
                  {fullName
                    ? t("greetingNamed", { name: fullName.split(" ")[0] })
                    : t("greetingFallback")}
                </h1>
                <p className="text-on-surface/60 mt-2 text-base md:text-lg truncate">
                  {email}
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-8 md:grid-cols-[260px_1fr]">
            <AccountSidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
