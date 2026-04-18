export type Activity = {
  id: string;
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

export const CLOSEST_ACTIVITIES: Activity[] = [
  { id: "a1", title: "Sunrise Vinyasa Flow", time: "Starts in 15 min", location: "Prenzlauer Berg", neighborhood: "Prenzlauer Berg", price: "€12.00", imageUrl: IMG.yoga, imageAlt: "Yoga in a sunlit studio", joined: 8, instructorAvatar: AVATAR("yoga1"), instructorName: "Elena Grace", duration: "60 min", description: "Wake up the body with a breath-led flow by the rooftop garden. All levels welcome — mats provided.", schoolId: "school-yoga-loft", schoolName: "Yoga Loft Berlin", schoolAvatar: AVATAR("yogaloft"), rating: 4.9, reviewCount: 182, level: "All levels" },
  { id: "a2", title: "Intro to Wheel Throwing", time: "Starts in 42 min", location: "Mitte District", neighborhood: "Mitte", price: "€35.00", imageUrl: IMG.pottery, imageAlt: "Pottery workshop", joined: 4, instructorAvatar: AVATAR("pot1"), instructorName: "Jonas Weber", duration: "90 min", description: "Shape your first bowl on a spinning wheel. Small group, hands-on guidance, clay and firing included.", schoolId: "school-clay-studio", schoolName: "Clay Studio Mitte", schoolAvatar: AVATAR("claystudio"), rating: 4.8, reviewCount: 96, level: "Beginner" },
  { id: "a3", title: "Open Padel Session", time: "Starts in 1h 05 min", location: "Friedrichshain", neighborhood: "Friedrichshain", price: "€8.00", imageUrl: IMG.padel, imageAlt: "Outdoor padel court", joined: 12, instructorAvatar: AVATAR("pad1"), instructorName: "Coach Marco", duration: "75 min", description: "Drop in on a friendly mixed-level padel session. Rackets available, beginners rotate every game.", schoolId: "school-padel-hub", schoolName: "Padel Hub FHain", schoolAvatar: AVATAR("padelhub"), rating: 4.7, reviewCount: 64, level: "Mixed" },
  { id: "a4", title: "Urban Run Club", time: "Starts in 1h 30 min", location: "Tiergarten", neighborhood: "Tiergarten", price: "Free", imageUrl: IMG.running, imageAlt: "Running group", joined: 22, instructorAvatar: AVATAR("run1"), instructorName: "Run Crew Berlin", duration: "45 min", description: "Easy 5K loop through the park with pace groups and a coffee stop after. Bring water.", schoolId: "school-run-crew", schoolName: "Run Crew Berlin", schoolAvatar: AVATAR("runcrew"), rating: 4.9, reviewCount: 312, level: "All paces" },
  { id: "a5", title: "Urban Flow Masterclass", time: "Starts in 2h", location: "Downtown Arts District", neighborhood: "Mitte", price: "€129.00", imageUrl: IMG.dance, imageAlt: "Contemporary dance workshop", tag: "POPULAR", joined: 18, instructorAvatar: AVATAR("dan1"), instructorName: "Ava Morin", duration: "2 hours", description: "High-energy contemporary class blending hip-hop and flow. Mirrors, sprung floor, pro sound system.", schoolId: "school-1", schoolName: "Urban Rhythm Academy", schoolAvatar: AVATAR("urbanrhythm"), rating: 4.9, reviewCount: 324, level: "Intermediate" },
  { id: "a6", title: "Advanced Clay Tennis", time: "Tomorrow 09:00", location: "Wimbledon, London", neighborhood: "Wimbledon", price: "€45.00", imageUrl: IMG.tennis, imageAlt: "Clay tennis court", tag: "POPULAR", joined: 88, instructorAvatar: AVATAR("ten1"), instructorName: "David Hughes", duration: "90 min", description: "Technique-focused match play on red clay. For intermediate/advanced players working on their slide.", schoolId: "school-wimbledon-tennis", schoolName: "Wimbledon Tennis Club", schoolAvatar: AVATAR("wimbledon"), rating: 4.8, reviewCount: 201, level: "Advanced" },
  { id: "a7", title: "Bouldering Basics", time: "Tonight 19:00", location: "Kreuzberg", neighborhood: "Kreuzberg", price: "€18.00", imageUrl: IMG.climbing, imageAlt: "Indoor climbing", joined: 14, instructorAvatar: AVATAR("clb1"), instructorName: "Pia Ender", duration: "90 min", description: "First time climbing? Learn to read routes, fall safe, and send your first V0s with a friendly coach.", schoolId: "school-boulder-haus", schoolName: "BoulderHaus Kreuzberg", schoolAvatar: AVATAR("boulderhaus"), rating: 4.7, reviewCount: 128, level: "Beginner" },
  { id: "a8", title: "Sunset Boxing", time: "Tonight 20:30", location: "Neukölln", neighborhood: "Neukölln", price: "€20.00", imageUrl: IMG.boxing, imageAlt: "Boxing gym", joined: 9, instructorAvatar: AVATAR("box1"), instructorName: "Kai Novak", duration: "60 min", description: "Shake off the day with pad rounds, footwork drills, and a full-body circuit. Gloves on site.", schoolId: "school-iron-gym", schoolName: "Iron Gym Neukölln", schoolAvatar: AVATAR("irongym"), rating: 4.8, reviewCount: 144, level: "All levels" },
  { id: "a9", title: "Pasta From Scratch", time: "Saturday 18:00", location: "Charlottenburg", neighborhood: "Charlottenburg", price: "€48.00", imageUrl: IMG.cooking, imageAlt: "Cooking class", joined: 6, instructorAvatar: AVATAR("coo1"), instructorName: "Chef Lucia", duration: "2.5 hours", description: "Roll fresh tagliatelle and ravioli, then sit down together over wine. Ingredients and apron included.", schoolId: "school-cucina", schoolName: "Cucina Lucia", schoolAvatar: AVATAR("cucinalucia"), rating: 5.0, reviewCount: 87, level: "Beginner" },
  { id: "a10", title: "Watercolor Basics", time: "Sunday 11:00", location: "Mitte", neighborhood: "Mitte", price: "€25.00", imageUrl: IMG.painting, imageAlt: "Watercolor class", joined: 11, instructorAvatar: AVATAR("pnt1"), instructorName: "Noa Stein", duration: "2 hours", description: "Loose, expressive watercolor techniques for total beginners. Paper, brushes, and paints provided.", schoolId: "school-atelier-noa", schoolName: "Atelier Noa", schoolAvatar: AVATAR("ateliernoa"), rating: 4.9, reviewCount: 112, level: "Beginner" },
];

export const SEARCH_RESULTS: Activity[] = [
  { id: "s1", title: "Sunset Hatha Flow", time: "Today 18:00", location: "Shoreditch, London", neighborhood: "Shoreditch", price: "$120/Term", imageUrl: IMG.yoga, imageAlt: "Hatha yoga", joined: 1212, instructorAvatar: AVATAR("hat1"), instructorName: "Priya Shah", duration: "75 min", description: "Slow, grounded Hatha sequence lit by golden-hour light. Perfect for unwinding and improving flexibility.", schoolId: "school-east-light", schoolName: "East Light Yoga", schoolAvatar: AVATAR("eastlight"), rating: 4.9, reviewCount: 428, level: "All levels", tag: "FEATURED" },
  { id: "s2", title: "Advanced Clay Tennis", time: "Tomorrow 09:00", location: "Wimbledon, London", neighborhood: "Wimbledon", price: "$45/Session", imageUrl: IMG.tennis, imageAlt: "Tennis", tag: "POPULAR", joined: 88, instructorAvatar: AVATAR("tennis1"), instructorName: "David Hughes", duration: "90 min", description: "Drill-heavy session on red clay focused on footwork, sliding, and match tactics. Bring two balls.", schoolId: "school-wimbledon-tennis", schoolName: "Wimbledon Tennis Club", schoolAvatar: AVATAR("wimbledon"), rating: 4.8, reviewCount: 201, level: "Advanced" },
  { id: "s3", title: "Morning Lap Swim", time: "Tomorrow 07:00", location: "Hackney, London", neighborhood: "Hackney", price: "$18/Drop-in", imageUrl: IMG.swim, imageAlt: "Swim pool", joined: 34, instructorAvatar: AVATAR("swim1"), instructorName: "Lane Coach Eli", duration: "60 min", description: "Structured lane-based swim with set intervals for all paces. Heated 25m pool, showers and towels included.", schoolId: "school-hackney-aquatics", schoolName: "Hackney Aquatics", schoolAvatar: AVATAR("hackneyaq"), rating: 4.6, reviewCount: 92, level: "Intermediate" },
  { id: "s4", title: "Open Mic Guitar Night", time: "Friday 20:00", location: "Camden, London", neighborhood: "Camden", price: "$12/Entry", imageUrl: IMG.guitar, imageAlt: "Guitar night", joined: 64, instructorAvatar: AVATAR("guit1"), instructorName: "Host: Jesse Lane", duration: "3 hours", description: "Bring your guitar and a song or two. Warm crowd, pro PA, a full bar, and sign-ups on the door.", schoolId: "school-camden-chords", schoolName: "Camden Chords", schoolAvatar: AVATAR("camdenchords"), rating: 4.7, reviewCount: 156, level: "All levels", tag: "LIVE" },
];

export const REVIEWS: Review[] = [
  { id: "r1", name: "Anna Kowalska", avatar: AVATAR("anna"), rating: 5, text: "Hakuna zmieniło moje weekendy. Znalazłam lokalny warsztat ceramiki 200 metrów od domu — o którym nie miałam pojęcia. Rezerwacja zajęła 20 sekund.", activity: "Intro to Wheel Throwing" },
  { id: "r2", name: "Marek Nowak", avatar: AVATAR("marek"), rating: 5, text: "Spontaniczne mecze padla w dzielnicy to był game-changer. Na Hakunie wszystko jest live — widzę co zaczyna się za godzinę i po prostu idę.", activity: "Open Padel Session" },
  { id: "r3", name: "Sophia Lindqvist", avatar: AVATAR("sophia"), rating: 4, text: "Love how curated the experiences feel. Every instructor I've booked has been top-tier. The app finally respects my time.", activity: "Urban Flow Masterclass" },
  { id: "r4", name: "Daniel Osei", avatar: AVATAR("daniel"), rating: 5, text: "The 'Closest to You' feature is pure magic — I booked a sunrise run with strangers that became my Tuesday ritual.", activity: "Urban Run Club" },
  { id: "r5", name: "Léa Moreau", avatar: AVATAR("lea"), rating: 5, text: "Clean design, honest pricing, real communities. Hakuna feels like the city is a little more alive.", activity: "Sunrise Vinyasa Flow" },
  { id: "r6", name: "Tomáš Dvořák", avatar: AVATAR("tomas"), rating: 4, text: "Great for traveling. I dropped into a boxing class in Berlin the same night I landed.", activity: "Sunset Boxing" },
];

export const INSTRUCTOR: Instructor = {
  id: "i1",
  name: "Marcus Thorne",
  role: "Lead Instructor",
  avatar: AVATAR("marcus"),
  bio: "Founder of the Kinetic Lab, Marcus has choreographed for world tours and international cinema. His philosophy centers on the bridge between technical excellence and raw human emotion.",
  credentials: [
    { icon: "workspace_premium", label: "Best Choreographer 2023" },
    { icon: "military_tech", label: "15+ Years Exp." },
  ],
};

export const ACTIVITY_DETAIL = {
  id: "a5",
  title: "Urban Flow: The Elite Performance Workshop",
  tags: ["MASTERCLASS", "CONTEMPORARY DANCE"],
  heroImage: IMG.hero,
  description:
    "Push your boundaries in this high-intensity masterclass designed for performers who want to master the fusion of contemporary movement and urban precision. Lead by internationally acclaimed choreographer Marcus Thorne, this session focuses on spatial awareness, explosive power, and emotional storytelling.",
  metadata: [
    { icon: "groups", label: "Target Age", value: "16+ (Teens/Adults)" },
    { icon: "trending_up", label: "Intensity", value: "Advanced/Elite" },
    { icon: "timer", label: "Duration", value: "180 Minutes" },
  ],
  price: "€129",
  dates: [
    { id: "d1", label: "OCT 24", time: "6:00 PM" },
    { id: "d2", label: "OCT 26", time: "10:00 AM" },
  ],
  location: "Studio 4, Downtown Arts District",
  spotsLeft: 4,
  curriculum: [
    {
      id: "c1",
      title: "Kinetic Foundation",
      description:
        "Deep dive into weight distribution and momentum control. Master the art of using gravity to power your transitions.",
    },
    {
      id: "c2",
      title: "Urban Textures",
      description:
        "Exploring the contrast between fluid contemporary lines and sharp, isolated urban movements.",
    },
    {
      id: "c3",
      title: "Choreographic Nuance",
      description:
        "The final phase focuses on the 'Urban Flow' routine. You'll learn to interpret complex rhythmic patterns through full-body expression.",
      image: IMG.dance,
    },
  ],
  joined: [AVATAR("j1"), AVATAR("j2"), AVATAR("j3")],
  joinedExtra: 12,
  instructor: INSTRUCTOR,
  reviews: REVIEWS.slice(0, 3),
};

export const SCHOOL_DETAIL: School = {
  id: "school-1",
  name: "Urban Rhythm Academy",
  tagline: "Where movement meets mastery",
  heroImage: IMG.schoolHero,
  rating: 4.9,
  reviewCount: 324,
  location: "Downtown Arts District, Berlin",
  stats: [
    { label: "Students", value: "500+" },
    { label: "Years", value: "10+" },
    { label: "Certification", value: "Pulse Certified" },
  ],
  about:
    "Urban Rhythm Academy is a hub for dancers, performers and movement-lovers who want more than a class — they want a community. Our instructors are working professionals, our studios are built for serious training, and our philosophy is simple: movement should feel as good as it looks.",
  classes: [
    { id: "sc1", title: "Contemporary Foundations", time: "Mon & Wed 18:00", location: "Studio 1", neighborhood: "Mitte", price: "€22/class", imageUrl: IMG.dance, imageAlt: "Contemporary class", tag: "All Levels" },
    { id: "sc2", title: "Urban Flow Intermediate", time: "Tue & Thu 19:30", location: "Studio 3", neighborhood: "Mitte", price: "€28/class", imageUrl: IMG.dance, imageAlt: "Urban flow class", tag: "Intermediate" },
    { id: "sc3", title: "Kids Movement Lab", time: "Sat 10:00", location: "Studio 2", neighborhood: "Mitte", price: "€18/class", imageUrl: IMG.painting, imageAlt: "Kids class", tag: "Ages 7–12" },
    { id: "sc4", title: "Pro Performance Lab", time: "Sun 14:00", location: "Studio 4", neighborhood: "Mitte", price: "€40/class", imageUrl: IMG.dance, imageAlt: "Pro performance", tag: "Advanced" },
  ],
  gallery: [IMG.studio, IMG.studio2, IMG.studio3, IMG.studio4, IMG.dance, IMG.pottery],
};
