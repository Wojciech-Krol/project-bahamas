import { Link } from "../../src/i18n/navigation";
import { Icon } from "./Icon";
import type { Activity } from "../lib/mockData";

export default function ActivityRowCard({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activity/${activity.id}`}
      className="bg-surface-container-lowest p-4 md:p-5 rounded-[2rem] flex gap-4 md:gap-6 items-center border border-[#FAEEDA] editorial-shadow hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-fixed to-secondary-fixed">
        {activity.imageUrl && (
          <img
            alt={activity.imageAlt}
            className="w-full h-full object-cover"
            src={activity.imageUrl}
          />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg md:text-2xl font-bold text-on-surface mb-1 truncate">
          {activity.title}
        </h3>
        <p className="text-primary font-semibold uppercase tracking-widest text-[0.7rem] md:text-xs mb-3">
          {activity.time}
        </p>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-on-surface/50 text-xs md:text-sm">
            <Icon name="location_on" className="text-[16px] md:text-[18px]" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface/50 text-xs md:text-sm">
            <Icon name="payments" className="text-[16px] md:text-[18px]" />
            <span className="font-bold text-on-surface/80">{activity.price}</span>
          </div>
        </div>
      </div>
      <span className="mr-2 text-on-surface/20 hover:text-primary transition-colors hidden md:inline">
        <Icon name="arrow_forward_ios" className="text-2xl" />
      </span>
    </Link>
  );
}
