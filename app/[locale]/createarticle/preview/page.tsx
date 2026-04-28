import { setRequestLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteNavbar from "@/src/components/SiteNavbar";
import SiteFooter from "@/src/components/SiteFooter";
import CreateArticlePreviewClient from "./CreateArticlePreviewClient";

const ACCESS_COOKIE = "create_article_access";
const ACCESS_CODE = "123";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CreateArticlePreviewPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const isUnlocked = cookieStore.get(ACCESS_COOKIE)?.value === ACCESS_CODE;
  if (!isUnlocked) {
    redirect(`/${locale}/createarticle`);
  }

  const t = await getTranslations({ locale, namespace: "CreateArticle.ui.preview" });

  const copy = {
    notice: t("notice"),
    backToEditor: t("backToEditor"),
    draftBadge: t("draftBadge"),
    publishedBadge: t("publishedBadge"),
    untitled: t("untitled"),
    unknownAuthor: t("unknownAuthor"),
    noCategory: t("noCategory"),
    emptyTitle: t("emptyTitle"),
    emptyDescription: t("emptyDescription"),
    emptyCta: t("emptyCta"),
    activitiesTitle: t("activitiesTitle"),
    activitiesDescription: t("activitiesDescription"),
    addActivity: t("addActivity"),
    comingSoon: t("comingSoon"),
    tagsLabel: t("tagsLabel"),
  };

  return (
    <>
      <SiteNavbar />
      <CreateArticlePreviewClient locale={locale} copy={copy} />
      <SiteFooter />
    </>
  );
}
