// Partner-dashboard mock data. IDs + non-translatable fields only.
// Translatable copy lives in messages/{locale}.json under "Partner.mock.*".
// DB swap: replace this file + request.ts JSON import; keep shapes stable.

export type PartnerRole = "owner" | "manager" | "instructor" | "viewer";

export type PartnerUserBase = {
  id: string;
  role: PartnerRole;
  avatarGradient: string;
};

export type VenueBase = {
  id: string;
  status: "draft" | "published" | "archived";
  rating: number;
  reviewCount: number;
  heroGradient: string;
  logoGradient: string;
  galleryGradients: string[];
  activeNeighborhoodId: string;
  neighborhoodIds: string[];
};

export type ClassLevel = "beginner" | "intermediate" | "advanced" | "all";
export type ClassStatus = "published" | "draft" | "archived";
export type PricingModel = "per_class" | "per_session" | "per_term" | "drop_in";
export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type PartnerClassBase = {
  id: string;
  copyKey: string; // maps to Partner.mock.classes.<key>
  icon: string;
  iconGradient: string;
  iconColor: string;
  level: ClassLevel;
  levelLabelKey: string; // Partner.status.level* OR custom override key
  tag?: "popular" | "new" | "featured";
  status: ClassStatus;
  durationMinutes: number;
  capacity: number;
  booked: number;
  waitlist?: number;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  recurringDays: Weekday[];
  startTime: string;
  primaryInstructorId: string;
  backupInstructorIds: string[];
  nextSessionLabelKey?: string; // "Next session" or day-name override
  needsInstructor?: boolean;
};

export type PartnerInstructorBase = {
  id: string;
  copyKey: string; // Partner.mock.instructors.<key>
  avatarGradient: string;
  verified: boolean;
  classCount: number;
  rating: number;
  studentCount: number;
  status: "active" | "invited" | "inactive";
};

export type PartnerInvitedInstructorBase = {
  id: string;
  copyKey: string;
  status: "invited";
};

const GRADIENTS = {
  primaryTertiary: "from-primary to-tertiary",
  secondaryDim: "from-secondary to-secondary-fixed-dim",
  pinkDim: "from-primary-fixed-dim to-tertiary-container",
  darkGold: "from-on-surface/80 to-on-surface",
  heroBrand: "from-primary via-tertiary to-secondary",
  heroClassPrimary: "from-primary/60 to-tertiary/60",
  heroClassSecondary: "from-secondary/50 to-secondary-fixed-dim",
  heroClassSoft: "from-primary-fixed-dim to-primary-fixed",
  g1: "from-secondary-fixed to-secondary-fixed-dim",
  g2: "from-primary-fixed to-primary-fixed-dim",
  g3: "from-tertiary-container to-primary",
  g4: "from-surface-container-highest to-surface-container-high",
  g5: "from-primary-fixed-dim to-tertiary",
  g6: "from-secondary to-secondary-fixed-dim",
} as const;

export const CURRENT_USER: PartnerUserBase = {
  id: "pu-ava",
  role: "owner",
  avatarGradient: "from-secondary-container to-secondary-container",
};

export const CURRENT_VENUE: VenueBase = {
  id: "venue-urban-rhythm",
  status: "published",
  rating: 4.9,
  reviewCount: 324,
  heroGradient: GRADIENTS.heroBrand,
  logoGradient: "from-primary to-tertiary",
  galleryGradients: [
    GRADIENTS.g1,
    GRADIENTS.g2,
    GRADIENTS.g3,
    GRADIENTS.g4,
    GRADIENTS.g5,
    GRADIENTS.g6,
  ],
  activeNeighborhoodId: "srodmiescie",
  neighborhoodIds: ["srodmiescie", "mokotow", "praga"],
};

export const PARTNER_CLASSES: PartnerClassBase[] = [
  {
    id: "pc-contemporary",
    copyKey: "contemporary",
    icon: "sports_gymnastics",
    iconGradient: GRADIENTS.heroClassPrimary,
    iconColor: "text-on-primary",
    level: "all",
    levelLabelKey: "Partner.status.levelAll",
    status: "published",
    durationMinutes: 60,
    capacity: 18,
    booked: 14,
    pricingModel: "per_class",
    price: 22,
    currency: "EUR",
    recurringDays: ["mon", "wed"],
    startTime: "18:00",
    primaryInstructorId: "pi-marcus",
    backupInstructorIds: ["pi-elena"],
  },
  {
    id: "pc-urbanflow",
    copyKey: "urbanFlow",
    icon: "music_note",
    iconGradient: GRADIENTS.secondaryDim,
    iconColor: "text-on-secondary",
    level: "intermediate",
    levelLabelKey: "Partner.status.levelIntermediate",
    tag: "popular",
    status: "published",
    durationMinutes: 75,
    capacity: 18,
    booked: 18,
    waitlist: 3,
    pricingModel: "per_class",
    price: 28,
    currency: "EUR",
    recurringDays: ["tue", "thu"],
    startTime: "19:30",
    primaryInstructorId: "pi-marcus",
    backupInstructorIds: [],
  },
  {
    id: "pc-kidslab",
    copyKey: "kidsLab",
    icon: "child_care",
    iconGradient: GRADIENTS.heroClassSoft,
    iconColor: "text-primary",
    level: "all",
    levelLabelKey: "Partner.mock.classes.kidsLab.ageLabel",
    status: "published",
    durationMinutes: 45,
    capacity: 12,
    booked: 8,
    pricingModel: "per_class",
    price: 18,
    currency: "EUR",
    recurringDays: ["sat"],
    startTime: "10:00",
    primaryInstructorId: "",
    backupInstructorIds: ["pi-noa"],
    needsInstructor: true,
  },
  {
    id: "pc-prolab",
    copyKey: "proLab",
    icon: "stars",
    iconGradient: GRADIENTS.darkGold,
    iconColor: "text-secondary-fixed-dim",
    level: "advanced",
    levelLabelKey: "Partner.status.levelAdvanced",
    status: "published",
    durationMinutes: 120,
    capacity: 16,
    booked: 4,
    pricingModel: "per_class",
    price: 40,
    currency: "EUR",
    recurringDays: ["sun"],
    startTime: "14:00",
    primaryInstructorId: "pi-marcus",
    backupInstructorIds: [],
  },
];

export const PARTNER_INSTRUCTORS: PartnerInstructorBase[] = [
  {
    id: "pi-marcus",
    copyKey: "marcus",
    avatarGradient: GRADIENTS.primaryTertiary,
    verified: true,
    classCount: 4,
    rating: 4.9,
    studentCount: 142,
    status: "active",
  },
  {
    id: "pi-noa",
    copyKey: "noa",
    avatarGradient: GRADIENTS.secondaryDim,
    verified: true,
    classCount: 2,
    rating: 4.8,
    studentCount: 58,
    status: "active",
  },
  {
    id: "pi-elena",
    copyKey: "elena",
    avatarGradient: GRADIENTS.pinkDim,
    verified: false,
    classCount: 3,
    rating: 5.0,
    studentCount: 94,
    status: "active",
  },
];

export const PARTNER_INVITED_INSTRUCTORS: PartnerInvitedInstructorBase[] = [
  { id: "pi-kai", copyKey: "kaiInvite", status: "invited" },
];

export const CLASS_STATUS_COUNTS = {
  published: 12,
  drafts: 2,
  archived: 5,
};

export const OVERVIEW_METRICS = {
  bookings: { value: "147", delta: "+12%", deltaPositive: true },
  revenue: { value: "€3,240", delta: "+8%", deltaPositive: true },
  fillRate: { value: "82%", percent: 82 },
  rating: { value: "4.9", count: 324 },
};

export const SPARKLINE_PATHS = {
  bookings: {
    fill: "M0 24 L15 20 L30 22 L45 14 L60 16 L75 8 L90 12 L105 6 L120 4 L120 32 L0 32 Z",
    line: "M0 24 L15 20 L30 22 L45 14 L60 16 L75 8 L90 12 L105 6 L120 4",
  },
  revenue: {
    fill: "M0 22 L15 24 L30 18 L45 18 L60 12 L75 14 L90 10 L105 8 L120 10 L120 32 L0 32 Z",
    line: "M0 22 L15 24 L30 18 L45 18 L60 12 L75 14 L90 10 L105 8 L120 10",
  },
};

export function classById(id: string): PartnerClassBase | undefined {
  return PARTNER_CLASSES.find((c) => c.id === id);
}

export function instructorById(id: string): PartnerInstructorBase | undefined {
  return PARTNER_INSTRUCTORS.find((i) => i.id === id);
}
