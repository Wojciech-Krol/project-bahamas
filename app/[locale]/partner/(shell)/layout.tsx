import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import PartnerSidebarShell from "@/src/components/partner/PartnerSidebarShell";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { env } from "@/src/env";

/**
 * Partner dashboard shell.
 *
 * Auth behavior:
 *   - If Supabase is not configured (pre-launch / fresh clone without env),
 *     the guard is a no-op so designers and PMs can browse the mock UI.
 *   - Once Supabase is configured, access requires:
 *       1. a signed-in user
 *       2. membership in at least one partner via `partner_members`
 *     Non-members fall through to `notFound()` (don't leak the dashboard's
 *     existence to random visitors).
 *
 * The full auth-gated CRUD rewrite of these pages is tracked in the plan —
 * today the pages still render from `partnerMockData.ts`.
 */
export default async function PartnerShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const current = await getCurrentUser();
    if (!current) {
      redirect(`/${locale}/login?next=/${locale}/partner`);
    }

    const supabase = await createClient();
    const { data: memberships } = await supabase
      .from("partner_members")
      .select("partner_id")
      .eq("user_id", current.user.id)
      .limit(1);

    const isAdmin = current.profile?.role === "admin";
    if (!memberships?.length && !isAdmin) {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface md:flex">
      <PartnerSidebarShell />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
