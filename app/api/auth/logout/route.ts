import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/src/lib/db/server";

/**
 * Sign out. POST only — never expose logout via GET (CSRF / link-prefetch).
 *
 * Reads the locale from the form body so the redirect lands on the user's
 * current locale; falls back to the default `pl`.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const locale = (formData?.get("locale") as string) || "pl";

  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/${locale}`, url.origin), { status: 303 });
}
