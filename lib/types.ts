export type Audience = "kids" | "teens" | "adults";

export type ClassCategory =
  | "sports"
  | "arts"
  | "tech"
  | "wellness"
  | "music"
  | "cooking";

export interface ClassItem {
  id: string;
  title: string;
  audience: Audience;
  category: ClassCategory;
  instructor: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  price: number;
  schedule: string;
  duration: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
}

export interface Enrollment {
  id: string;
  classId: string;
  studentName: string;
  nextSession: string;
  status: "active" | "waitlist" | "completed";
}
