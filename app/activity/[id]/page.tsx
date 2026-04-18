"use client";

import { use, useState } from "react";
import SiteNavbar from "../../components/SiteNavbar";
import SiteFooter from "../../components/SiteFooter";
import ReviewsSection from "../../components/ReviewsSection";
import { Icon } from "../../components/Icon";
import { ACTIVITY_DETAIL } from "../../lib/mockData";

export default function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // id is unused for now; this is a mock single-activity page
  use(params);
  const a = ACTIVITY_DETAIL;
  const [selectedDate, setSelectedDate] = useState(a.dates[0].id);

  return (
    <>
      <SiteNavbar />
      <main className="pt-20 md:pt-24 pb-24 md:pb-0">
        {/* Hero */}
        <section className="relative h-[55vh] md:h-[70vh] min-h-[360px] md:min-h-[500px] w-full overflow-hidden">
          <img
            src={a.heroImage}
            alt={a.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-4 md:px-6 pb-10 md:pb-16 text-white">
            <div className="flex flex-wrap gap-2 mb-5">
              {a.tags.map((t) => (
                <span
                  key={t}
                  className="bg-primary-fixed/90 text-primary px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
              {a.title}
            </h1>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 md:gap-14 items-start">
          {/* Left column */}
          <div className="space-y-12 md:space-y-16 min-w-0">
            {/* Experience */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Icon name="auto_awesome" className="text-[22px] text-primary" />
                <h2 className="font-headline font-bold text-xl text-primary uppercase tracking-widest">
                  The Experience
                </h2>
              </div>
              <p className="text-lg md:text-xl text-on-surface/80 leading-relaxed">
                {a.description}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {a.metadata.map((m) => (
                  <div
                    key={m.label}
                    className="bg-surface-container-low rounded-[1.5rem] p-5"
                  >
                    <Icon name={m.icon} className="text-[22px] text-primary mb-3" />
                    <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                      {m.label}
                    </div>
                    <div className="font-bold text-on-surface">{m.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="font-headline font-bold text-3xl md:text-4xl tracking-tight mb-8">
                Curriculum Focus
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {a.curriculum.map((c, idx) => (
                  <article
                    key={c.id}
                    className={`bg-surface-container-lowest rounded-[1.5rem] p-6 border border-on-surface/[0.05] editorial-shadow ${
                      c.image ? "md:col-span-2 flex flex-col md:flex-row gap-5" : ""
                    }`}
                  >
                    {c.image && (
                      <img
                        src={c.image}
                        alt=""
                        className="w-full md:w-56 h-40 md:h-auto object-cover rounded-[1rem] shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-headline font-bold text-lg md:text-xl">
                          {c.title}
                        </h3>
                      </div>
                      <p className="text-on-surface/70 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                <div className="relative shrink-0">
                  <img
                    src={a.instructor.avatar}
                    alt={a.instructor.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center border-4 border-surface-container-low">
                    <Icon name="verified" className="text-[18px]" />
                  </span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-2">
                    {a.instructor.role}
                  </div>
                  <h3 className="font-headline font-bold text-3xl text-on-surface mb-3">
                    {a.instructor.name}
                  </h3>
                  <p className="text-on-surface/70 leading-relaxed mb-5">
                    {a.instructor.bio}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {a.instructor.credentials.map((c) => (
                      <span
                        key={c.label}
                        className="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-semibold border border-on-surface/[0.06]"
                      >
                        <Icon name={c.icon} className="text-[18px] text-primary" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-5">
            <div className="rounded-[2rem] overflow-hidden editorial-shadow border border-on-surface/[0.05] bg-surface-container-lowest">
              <div className="bg-gradient-to-br from-primary to-tertiary text-on-primary p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-widest opacity-80">
                      Total Experience
                    </div>
                    <div className="font-headline font-extrabold text-5xl md:text-6xl mt-1">
                      {a.price}
                    </div>
                  </div>
                  <Icon name="bolt" className="text-[28px]" />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div>
                  <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-3">
                    Available Dates
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {a.dates.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDate(d.id)}
                        className={`rounded-2xl p-3 text-center transition-all border-2 ${
                          selectedDate === d.id
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-surface-container-low border-transparent hover:border-primary/30"
                        }`}
                      >
                        <div className="text-xs font-bold uppercase tracking-widest">
                          {d.label}
                        </div>
                        <div className="font-bold mt-0.5">{d.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-on-surface/80">
                    <Icon name="location_on" className="text-[20px] text-primary" />
                    <span className="text-sm">{a.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface/80">
                    <Icon name="person" className="text-[20px] text-primary" />
                    <span className="text-sm">Only {a.spotsLeft} spots left!</span>
                  </div>
                </div>

                <button className="w-full bg-primary text-on-primary py-4 rounded-full font-headline uppercase tracking-widest text-sm font-bold hover:bg-tertiary transition-colors">
                  Book Your Spot
                </button>

                <p className="text-xs text-on-surface/50 text-center">
                  Free cancellation up to 48 hours before the class.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-[1.5rem] p-5">
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-3">
                Joining The Pulse
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {a.joined.map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-low"
                    />
                  ))}
                  <span className="w-10 h-10 rounded-full bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center border-2 border-surface-container-low">
                    +{a.joinedExtra}
                  </span>
                </div>
                <div className="text-sm text-on-surface/70">
                  Already booked for this session
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ReviewsSection
          reviews={a.reviews}
          title="What participants say"
          subtitle="Feedback from people who've already taken this session."
        />
      </main>

      {/* Mobile sticky booking bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-on-surface/[0.06] px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(45,10,23,0.08)]">
        <div className="flex flex-col min-w-0">
          <span className="font-headline font-extrabold text-lg text-on-surface leading-none">{a.price}</span>
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mt-1">
            {a.spotsLeft} spots left
          </span>
        </div>
        <button className="ml-auto bg-primary text-on-primary px-6 py-3.5 rounded-full font-headline font-bold uppercase tracking-widest text-[0.75rem] shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 transition-transform">
          Book Now
        </button>
      </div>

      <SiteFooter />
      {/* Spacer to keep sticky mobile bar from covering footer content */}
      <div className="md:hidden h-20" aria-hidden />
    </>
  );
}
