import { NextResponse } from "next/server";

const ACCESS_COOKIE = "create_article_access";
const ACCESS_CODE = "123";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const formData = await request.formData();
  const code = formData.get("code");
  const { locale } = await context.params;
  const baseUrl = new URL(request.url);
  const redirectTo = new URL(`/${locale}/createarticle`, baseUrl.origin);

  if (typeof code !== "string" || code.trim() !== ACCESS_CODE) {
    redirectTo.searchParams.set("invalid", "1");
    return NextResponse.redirect(redirectTo);
  }

  const response = NextResponse.redirect(redirectTo);
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: ACCESS_CODE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
