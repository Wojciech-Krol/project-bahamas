import { ClassCard } from "@/components/class-card";

const featuredClasses = [
  {
    id: "1",
    title: "Introduction to Watercolor Painting",
    instructor: "Maria Santos",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    rating: 4.9,
    reviewCount: 128,
    price: 45,
    duration: "2 hours",
    category: "Art",
    featured: true,
  },
  {
    id: "2",
    title: "Caribbean Cooking Masterclass",
    instructor: "Chef Marcus",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    rating: 4.8,
    reviewCount: 95,
    price: 65,
    duration: "3 hours",
    category: "Cooking",
    featured: false,
  },
  {
    id: "3",
    title: "Beginner Surfing Lessons",
    instructor: "Jake Thompson",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
    rating: 4.9,
    reviewCount: 212,
    price: 80,
    duration: "2 hours",
    category: "Sports",
    featured: true,
  },
  {
    id: "4",
    title: "Guitar for Beginners",
    instructor: "Carlos Rivera",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    rating: 4.7,
    reviewCount: 76,
    price: 40,
    duration: "1.5 hours",
    category: "Music",
    featured: false,
  },
  {
    id: "5",
    title: "Kids Coding Camp",
    instructor: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80",
    rating: 4.9,
    reviewCount: 156,
    price: 55,
    duration: "2 hours",
    category: "Coding",
    featured: true,
  },
  {
    id: "6",
    title: "Yoga & Meditation Flow",
    instructor: "Maya Williams",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    rating: 4.8,
    reviewCount: 189,
    price: 35,
    duration: "1 hour",
    category: "Wellness",
    featured: false,
  },
];

export function FeaturedClassesSection() {
  return (
    <section className="py-20 bg-[var(--color-off-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-2">
              Featured Classes
            </h2>
            <p className="text-lg text-[var(--color-gray-500)]">
              Handpicked by our team for quality and experience
            </p>
          </div>
          <a
            href="/classes"
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            Browse all classes
          </a>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              {...classItem}
              variant="default"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
