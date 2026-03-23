import { ClassCard } from "@/components/class-card";

const featuredClasses = [
  {
    id: "k1",
    title: "Creative Art Adventures",
    instructor: "Miss Lisa",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    rating: 4.9,
    reviewCount: 156,
    price: 35,
    duration: "1.5 hours",
    category: "Art",
    featured: true,
  },
  {
    id: "k2",
    title: "Little Chefs Cooking Class",
    instructor: "Chef Maria",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    rating: 4.8,
    reviewCount: 98,
    price: 45,
    duration: "2 hours",
    category: "Cooking",
    featured: false,
  },
  {
    id: "k3",
    title: "Scratch Coding for Kids",
    instructor: "Mr. James",
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80",
    rating: 4.9,
    reviewCount: 124,
    price: 40,
    duration: "1 hour",
    category: "Coding",
    featured: true,
  },
  {
    id: "k4",
    title: "Junior Soccer Academy",
    instructor: "Coach Mike",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    rating: 4.7,
    reviewCount: 89,
    price: 30,
    duration: "1 hour",
    category: "Sports",
    featured: false,
  },
  {
    id: "k5",
    title: "Fun with Music & Movement",
    instructor: "Ms. Rachel",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    rating: 4.9,
    reviewCount: 201,
    price: 35,
    duration: "45 mins",
    category: "Music",
    featured: true,
  },
  {
    id: "k6",
    title: "Science Explorers Lab",
    instructor: "Dr. Emily",
    image: "https://images.unsplash.com/photo-1567168544230-b053c0f8e95a?w=800&q=80",
    rating: 4.8,
    reviewCount: 76,
    price: 50,
    duration: "2 hours",
    category: "Science",
    featured: false,
  },
];

export function KidsFeatured() {
  return (
    <section className="py-16 bg-[var(--color-kids-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-2">
              Top Picks for Kids
            </h2>
            <p className="text-lg text-[var(--color-gray-500)]">
              Classes loved by kids and trusted by parents
            </p>
          </div>
          <a
            href="/kids/all"
            className="text-[var(--color-kids-primary)] font-medium hover:underline"
          >
            View all classes
          </a>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              {...classItem}
              variant="kids"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
