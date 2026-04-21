import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { Icon } from "./Icon";

export default function SiteFooter() {
  const t = useTranslations("Footer");

  const tBlog = useTranslations("blog");
  const links: { href: string; label: string; external?: boolean }[] = [
    { href: "/blog", label: tBlog("title") },
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
    { href: "/cookies", label: t("cookies") },
    { href: "/about", label: t("contact") },
    { href: "https://instagram.com", label: t("instagram"), external: true },
    { href: "https://linkedin.com", label: t("linkedin"), external: true },
  ];

  return (
    <footer className="w-full rounded-t-[2rem] md:rounded-t-[3rem] mt-10 md:mt-20 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 md:py-16 gap-8 max-w-site mx-auto">
        <div className="space-y-4 text-center md:text-left">
          <Link href="/" className="text-xl font-bold text-on-surface">
            HAKUNA
          </Link>
          <p className="font-body text-sm leading-relaxed text-on-surface/60">
            {t("tagline")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-body text-sm leading-relaxed text-on-surface/60 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                href={l.href}
                className="font-body text-sm leading-relaxed text-on-surface/60 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
        </div>
        <div className="flex gap-4">
          {["share", "favorite"].map((icon) => (
            <div
              key={icon}
              className="w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Icon name={icon} className="text-[20px]" />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
