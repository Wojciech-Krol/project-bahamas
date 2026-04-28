import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import CreateArticleAccessClient from "./CreateArticleAccessClient";
import CreateArticleAdminClient from "./CreateArticleAdminClient";

const ACCESS_COOKIE = "create_article_access";
const ACCESS_CODE = "123";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invalid?: string }>;
};

export default async function CreateArticlePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { invalid } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CreateArticle" });
  const cookieStore = await cookies();
  const isUnlocked = cookieStore.get(ACCESS_COOKIE)?.value === ACCESS_CODE;

  if (!isUnlocked) {
    return <CreateArticleAccessClient locale={locale} copy={t.raw("ui")} invalidCode={invalid === "1"} />;
  }

  return <CreateArticleAdminClient locale={locale} copy={t.raw("ui")} />;
}
