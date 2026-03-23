import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { KidsHero } from "@/components/kids/kids-hero";
import { KidsCategories } from "@/components/kids/kids-categories";
import { KidsFeatured } from "@/components/kids/kids-featured";
import { KidsSummerSessions } from "@/components/kids/kids-summer-sessions";
import { KidsTestimonials } from "@/components/kids/kids-testimonials";
import { KidsCTA } from "@/components/kids/kids-cta";

export const metadata = {
  title: "Kids Classes | Hakuna - Fun Learning for Ages 4-12",
  description: "Discover fun and educational classes for kids aged 4-12 in The Bahamas. Art, music, sports, coding, and more!",
};

export default function KidsPage() {
  return (
    <>
      <Navigation variant="kids" />
      <main className="bg-[var(--color-kids-bg)]">
        <KidsHero />
        <KidsCategories />
        <KidsFeatured />
        <KidsSummerSessions />
        <KidsTestimonials />
        <KidsCTA />
      </main>
      <Footer variant="kids" />
    </>
  );
}
