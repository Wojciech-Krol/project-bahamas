import { NextResponse } from "next/server";

const ACCESS_COOKIE = "create_article_access";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { locale } = await context.params;
  const baseUrl = new URL(request.url);
  const redirectTo = new URL(`/${locale}/createarticle`, baseUrl.origin);
  const response = NextResponse.redirect(redirectTo);

  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
