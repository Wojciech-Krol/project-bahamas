import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

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

  // Single auth gate at the layout level — every nested page inherits.
  let current;
  try {
    current = await getCurrentUser();
  } catch {
    current = null;
  }
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }

  return (
    <div className="min-h-screen bg-surface pt-24 md:pt-32 pb-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
