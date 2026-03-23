import { ClassCard } from "@/components/class-card";
import { Icon } from "@/components/ui/icon";

const trendingClasses = [
  {
    id: "t1",
    title: "Build Your First App with React",
    instructor: "Alex Chen",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    rating: 4.9,
    reviewCount: 234,
    price: 60,
    duration: "2 hours",
    category: "Coding",
    featured: true,
  },
  {
    id: "t2",
    title: "Music Production with Ableton",
    instructor: "DJ Nova",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    rating: 4.8,
    reviewCount: 189,
    price: 55,
    duration: "1.5 hours",
    category: "Music",
    featured: true,
  },
  {
    id: "t3",
    title: "YouTube Content Masterclass",
    instructor: "Maya Vlogger",
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=80",
    rating: 4.9,
    reviewCount: 312,
    price: 45,
    duration: "2 hours",
    category: "Content",
    featured: false,
  },
  {
    id: "t4",
    title: "Digital Art & Illustration",
    instructor: "Kai Arts",
    image: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800&q=80",
    rating: 4.7,
    reviewCount: 156,
    price: 50,
    duration: "1.5 hours",
    category: "Art",
    featured: false,
  },
  {
    id: "t5",
    title: "Start Your Side Hustle",
    instructor: "Jordan Biz",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    rating: 4.8,
    reviewCount: 98,
    price: 40,
    duration: "1 hour",
    category: "Business",
    featured: true,
  },
  {
    id: "t6",
    title: "Photography for Social Media",
    instructor: "Sam Lens",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    rating: 4.6,
    reviewCount: 124,
    price: 35,
    duration: "1 hour",
    category: "Photo",
    featured: false,
  },
];

export function TrendingClasses() {
  return (
    <section className="py-20 bg-[var(--color-teens-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="local_fire_department" className="text-orange-500" filled />
              <span className="text-sm font-medium text-[var(--color-teens-neon-green)]">
                TRENDING NOW
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Most Popular Programs
            </h2>
          </div>
          <a
            href="/teens/all"
            className="text-[var(--color-teens-neon-green)] font-medium hover:underline flex items-center gap-2"
          >
            View all
            <Icon name="arrow_forward" size="sm" />
          </a>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              {...classItem}
              variant="teens"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
