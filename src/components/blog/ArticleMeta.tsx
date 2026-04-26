import Image from "next/image";
import { format } from "date-fns";
import { pl as plLocale, enGB } from "date-fns/locale";

type Props = {
  authorName: string;
  authorAvatar: string;
  publishedAt: string;
  locale: string;
  tone?: "light" | "dark";
  showLabel?: string;
  className?: string;
};

export default function ArticleMeta({
  authorName,
  authorAvatar,
  publishedAt,
  locale,
  tone = "dark",
  showLabel,
  className = "",
}: Props) {
  const dateLocale = locale === "pl" ? plLocale : enGB;
  const date = new Date(publishedAt);
  const formatted = format(date, "PPP", { locale: dateLocale });
  const nameColor = tone === "light" ? "text-white" : "text-on-surface";
  const subColor = tone === "light" ? "text-white/70" : "text-on-surface/55";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src={authorAvatar}
        alt=""
        width={40}
        height={40}
        className="rounded-full object-cover ring-2 ring-white/40"
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold text-sm ${nameColor}`}>
          {showLabel ? showLabel : authorName}
        </span>
        <time
          dateTime={publishedAt}
          className={`text-xs ${subColor}`}
        >
          {formatted}
        </time>
      </div>
    </div>
  );
}
