export type AgeGroup = "kids" | "teens" | "adults";

export type Category =
  | "sport"
  | "art"
  | "music"
  | "science"
  | "languages"
  | "dance"
  | "cooking"
  | "technology";

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface ClassItem {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  category: Category;
  description: string;
  ageRange: { min: number; max: number };
  price: number;
  schedule: Schedule[];
  location: Location;
  schoolId: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  spots: number;
  spotsLeft: number;
}

export interface School {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
}

export interface Review {
  id: string;
  classId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Enrollment {
  id: string;
  classId: string;
  profileName: string;
  profileType: "child" | "self";
  enrolledAt: string;
  status: "active" | "pending" | "cancelled";
}

export interface UserProfile {
  id: string;
  name: string;
  type: "child" | "self";
  age?: number;
  interests?: Category[];
}

export type UserRole = "user" | "school";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  kids: "Dzieci",
  teens: "Młodzież",
  adults: "Dorośli",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  sport: "Sport",
  art: "Sztuka",
  music: "Muzyka",
  science: "Nauka",
  languages: "Języki",
  dance: "Taniec",
  cooking: "Gotowanie",
  technology: "Technologia",
};
