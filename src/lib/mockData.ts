export type Activity = {
  id: string;
  slug?: string;
  title: string;
  time: string;
  location: string;
  neighborhood: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  tag?: string;
  joined?: number;
  instructorAvatar?: string;
  description?: string;
  instructorName?: string;
  duration?: string;
  schoolId?: string;
  schoolSlug?: string;
  schoolName?: string;
  schoolAvatar?: string;
  rating?: number;
  reviewCount?: number;
  level?: string;
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  activity?: string;
};

export type School = {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  heroImage: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  location: string;
  stats: { label: string; value: string }[];
  about: string;
  classes: Activity[];
  gallery: string[];
};

export type Instructor = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  credentials: { icon: string; label: string }[];
};

const IMG = {
  yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=800&fit=crop",
  pottery: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop",
  padel: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=800&fit=crop",
  running: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=800&fit=crop",
  dance: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&h=800&fit=crop",
  tennis: "https://images.unsplash.com/photo-1551773740-bb85a3e2ddb2?w=800&h=800&fit=crop",
  climbing: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=800&fit=crop",
  boxing: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=800&fit=crop",
  cooking: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop",
  painting: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop",
  swim: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=800&fit=crop",
  guitar: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=800&fit=crop",
  studio: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=800&fit=crop",
  studio2: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=800&fit=crop",
  studio3: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=800&fit=crop",
  studio4: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=800&fit=crop",
  hero: "https://images.unsplash.com/photo-1587387119725-9d6bac0f22fb?w=1600&h=900&fit=crop",
  schoolHero: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop",
};

export const AVATAR = (seed: string) =>
  `https://i.pravatar.cc/120?u=${encodeURIComponent(seed)}`;

/**
 * Locale-agnostic activity data. User-facing strings (title, time, location,
 * description, instructor name, school name, level, duration, tag, neighborhood)
 * live in `messages/{locale}.json` under `activities.{id}`.
 *
 * DB seam: replace this constant + the translation bag with a server-side
 * query that returns the same merged shape via i18nData helpers.
 */
export type ActivityBase = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  price: string;
  joined?: number;
  instructorAvatar?: string;
  schoolId?: string;
  schoolAvatar?: string;
  rating?: number;
  reviewCount?: number;
};

export const ACTIVITIES_DATA: Record<string, ActivityBase> = {
  a1: { id: "a1", imageUrl: IMG.yoga, imageAlt: "Yoga in a sunlit studio", price: "€12.00", joined: 8, instructorAvatar: AVATAR("yoga1"), schoolId: "school-yoga-loft", schoolAvatar: AVATAR("yogaloft"), rating: 4.9, reviewCount: 182 },
  a2: { id: "a2", imageUrl: IMG.pottery, imageAlt: "Pottery workshop", price: "€35.00", joined: 4, instructorAvatar: AVATAR("pot1"), schoolId: "school-clay-studio", schoolAvatar: AVATAR("claystudio"), rating: 4.8, reviewCount: 96 },
  a3: { id: "a3", imageUrl: IMG.padel, imageAlt: "Outdoor padel court", price: "€8.00", joined: 12, instructorAvatar: AVATAR("pad1"), schoolId: "school-padel-hub", schoolAvatar: AVATAR("padelhub"), rating: 4.7, reviewCount: 64 },
  a4: { id: "a4", imageUrl: IMG.running, imageAlt: "Running group", price: "Free", joined: 22, instructorAvatar: AVATAR("run1"), schoolId: "school-run-crew", schoolAvatar: AVATAR("runcrew"), rating: 4.9, reviewCount: 312 },
  a5: { id: "a5", imageUrl: IMG.dance, imageAlt: "Contemporary dance workshop", price: "€129.00", joined: 18, instructorAvatar: AVATAR("dan1"), schoolId: "school-1", schoolAvatar: AVATAR("urbanrhythm"), rating: 4.9, reviewCount: 324 },
  a6: { id: "a6", imageUrl: IMG.tennis, imageAlt: "Clay tennis court", price: "€45.00", joined: 88, instructorAvatar: AVATAR("ten1"), schoolId: "school-wimbledon-tennis", schoolAvatar: AVATAR("wimbledon"), rating: 4.8, reviewCount: 201 },
  a7: { id: "a7", imageUrl: IMG.climbing, imageAlt: "Indoor climbing", price: "€18.00", joined: 14, instructorAvatar: AVATAR("clb1"), schoolId: "school-boulder-haus", schoolAvatar: AVATAR("boulderhaus"), rating: 4.7, reviewCount: 128 },
  a8: { id: "a8", imageUrl: IMG.boxing, imageAlt: "Boxing gym", price: "€20.00", joined: 9, instructorAvatar: AVATAR("box1"), schoolId: "school-iron-gym", schoolAvatar: AVATAR("irongym"), rating: 4.8, reviewCount: 144 },
  a9: { id: "a9", imageUrl: IMG.cooking, imageAlt: "Cooking class", price: "€48.00", joined: 6, instructorAvatar: AVATAR("coo1"), schoolId: "school-cucina", schoolAvatar: AVATAR("cucinalucia"), rating: 5.0, reviewCount: 87 },
  a10: { id: "a10", imageUrl: IMG.painting, imageAlt: "Watercolor class", price: "€25.00", joined: 11, instructorAvatar: AVATAR("pnt1"), schoolId: "school-atelier-noa", schoolAvatar: AVATAR("ateliernoa"), rating: 4.9, reviewCount: 112 },
  s1: { id: "s1", imageUrl: IMG.yoga, imageAlt: "Hatha yoga", price: "$120/Term", joined: 1212, instructorAvatar: AVATAR("hat1"), schoolId: "school-east-light", schoolAvatar: AVATAR("eastlight"), rating: 4.9, reviewCount: 428 },
  s2: { id: "s2", imageUrl: IMG.tennis, imageAlt: "Tennis", price: "$45/Session", joined: 88, instructorAvatar: AVATAR("tennis1"), schoolId: "school-wimbledon-tennis", schoolAvatar: AVATAR("wimbledon"), rating: 4.8, reviewCount: 201 },
  s3: { id: "s3", imageUrl: IMG.swim, imageAlt: "Swim pool", price: "$18/Drop-in", joined: 34, instructorAvatar: AVATAR("swim1"), schoolId: "school-hackney-aquatics", schoolAvatar: AVATAR("hackneyaq"), rating: 4.6, reviewCount: 92 },
  s4: { id: "s4", imageUrl: IMG.guitar, imageAlt: "Guitar night", price: "$12/Entry", joined: 64, instructorAvatar: AVATAR("guit1"), schoolId: "school-camden-chords", schoolAvatar: AVATAR("camdenchords"), rating: 4.7, reviewCount: 156 },
};

export const CLOSEST_IDS = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"];
export const SEARCH_RESULT_IDS = ["s1", "s2", "s3", "s4"];
export const REVIEW_IDS = ["r1", "r2", "r3", "r4", "r5", "r6"];

export const REVIEWS_DATA: Record<string, { avatar: string; rating: number }> = {
  r1: { avatar: AVATAR("anna"), rating: 5 },
  r2: { avatar: AVATAR("marek"), rating: 5 },
  r3: { avatar: AVATAR("sophia"), rating: 4 },
  r4: { avatar: AVATAR("daniel"), rating: 5 },
  r5: { avatar: AVATAR("lea"), rating: 5 },
  r6: { avatar: AVATAR("tomas"), rating: 4 },
};

/** Non-copy bits for the featured activity detail mock. */
export const ACTIVITY_DETAIL_BASE = {
  id: "a5",
  heroImage: IMG.hero,
  price: "€129",
  dates: ["d1", "d2"] as const,
  spotsLeft: 4,
  curriculum: [
    { id: "c1" as const, image: undefined as string | undefined },
    { id: "c2" as const, image: undefined as string | undefined },
    { id: "c3" as const, image: IMG.dance as string | undefined },
  ],
  joined: [AVATAR("j1"), AVATAR("j2"), AVATAR("j3")],
  joinedExtra: 12,
  instructor: {
    avatar: AVATAR("marcus"),
    credIcons: ["workspace_premium", "military_tech"] as const,
  },
  reviewIds: ["r1", "r2", "r3"] as const,
  metadataIcons: ["groups", "trending_up", "timer"] as const,
};

export const SCHOOL_DETAIL_BASE = {
  id: "school-1",
  heroImage: IMG.schoolHero,
  rating: 4.9,
  reviewCount: 324,
  gallery: [IMG.studio, IMG.studio2, IMG.studio3, IMG.studio4, IMG.dance, IMG.pottery],
  classes: [
    { id: "sc1", imageUrl: IMG.dance, imageAlt: "Contemporary class", price: "€22/class" },
    { id: "sc2", imageUrl: IMG.dance, imageAlt: "Urban flow class", price: "€28/class" },
    { id: "sc3", imageUrl: IMG.painting, imageAlt: "Kids class", price: "€18/class" },
    { id: "sc4", imageUrl: IMG.dance, imageAlt: "Pro performance", price: "€40/class" },
  ],
};
