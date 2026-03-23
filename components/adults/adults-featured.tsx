import { ClassCard } from "@/components/class-card";

const featuredWorkshops = [
  {
    id: "a1",
    title: "Morning Vinyasa Flow",
    instructor: "Elena Rodriguez",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    rating: 4.9,
    reviewCount: 245,
    price: 35,
    duration: "75 mins",
    category: "Yoga",
    featured: true,
  },
  {
    id: "a2",
    title: "Farm-to-Table Cooking",
    instructor: "Chef Pierre",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    rating: 4.9,
    reviewCount: 189,
    price: 95,
    duration: "3 hours",
    category: "Culinary",
    featured: true,
  },
  {
    id: "a3",
    title: "Landscape Photography",
    instructor: "Marcus Webb",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80",
    rating: 4.8,
    reviewCount: 156,
    price: 75,
    duration: "2 hours",
    category: "Photography",
    featured: false,
  },
  {
    id: "a4",
    title: "Wine Tasting Essentials",
    instructor: "Sommelier Ana",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    rating: 4.9,
    reviewCount: 98,
    price: 85,
    duration: "2 hours",
    category: "Wine",
    featured: false,
  },
  {
    id: "a5",
    title: "Meditation & Breathwork",
    instructor: "David Zen",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80",
    rating: 4.8,
    reviewCount: 312,
    price: 30,
    duration: "60 mins",
    category: "Wellness",
    featured: true,
  },
  {
    id: "a6",
    title: "Creative Writing Workshop",
    instructor: "Sarah Collins",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    rating: 4.7,
    reviewCount: 87,
    price: 55,
    duration: "2 hours",
    category: "Writing",
    featured: false,
  },
];

export function AdultsFeatured() {
  return (
    <section className="py-20 bg-[var(--color-adults-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-2">
              Featured Workshops
            </h2>
            <p className="text-lg text-[var(--color-gray-500)]">
              Handpicked experiences led by expert instructors
            </p>
          </div>
          <a
            href="/adults/all"
            className="text-[var(--color-adults-primary)] font-medium hover:underline"
          >
            View all workshops
          </a>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWorkshops.map((workshop) => (
            <ClassCard
              key={workshop.id}
              {...workshop}
              variant="adults"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
