import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/src/i18n/navigation";
import BrandLogo from "@/app/components/BrandLogo";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="px-6 md:px-10 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <BrandLogo size={36} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
