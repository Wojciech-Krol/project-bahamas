import Link from "next/link";
import { ClassItem } from "@/lib/types";

export function ClassCard({ item }: { item: ClassItem }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            {item.category}
          </span>
          <span className="text-xs font-semibold text-slate-500">{item.rating.toFixed(1)} ({item.reviews})</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
        <p className="text-sm text-slate-600">{item.shortDescription}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-slate-700">${item.price} / session</span>
          <Link className="text-sm font-semibold text-violet-700 hover:underline" href={`/classes/${item.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
