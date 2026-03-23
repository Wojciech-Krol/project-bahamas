"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Enrollment } from "@/lib/types";

interface EnrollmentContextType {
  enrollments: Enrollment[];
  enroll: (enrollment: Omit<Enrollment, "id" | "enrolledAt" | "status">) => void;
  cancel: (id: string) => void;
  getEnrollmentsByClass: (classId: string) => Enrollment[];
}

const EnrollmentContext = createContext<EnrollmentContextType | null>(null);

const STORAGE_KEY = "bahamas_enrollments";

const defaultEnrollments: Enrollment[] = [
  {
    id: "enr-1",
    classId: "class-k1",
    profileName: "Zosia",
    profileType: "child",
    enrolledAt: "2026-01-15",
    status: "active",
  },
  {
    id: "enr-2",
    classId: "class-k4",
    profileName: "Zosia",
    profileType: "child",
    enrolledAt: "2026-02-01",
    status: "active",
  },
  {
    id: "enr-3",
    classId: "class-t2",
    profileName: "Kacper",
    profileType: "child",
    enrolledAt: "2026-02-10",
    status: "active",
  },
  {
    id: "enr-4",
    classId: "class-a2",
    profileName: "Ja",
    profileType: "self",
    enrolledAt: "2026-03-01",
    status: "active",
  },
  {
    id: "enr-5",
    classId: "class-a4",
    profileName: "Ja",
    profileType: "self",
    enrolledAt: "2026-03-05",
    status: "active",
  },
];

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEnrollments(JSON.parse(stored));
      } catch {
        setEnrollments(defaultEnrollments);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEnrollments));
      }
    } else {
      setEnrollments(defaultEnrollments);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEnrollments));
    }
  }, []);

  const persist = (updated: Enrollment[]) => {
    setEnrollments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const enroll = (data: Omit<Enrollment, "id" | "enrolledAt" | "status">) => {
    const newEnrollment: Enrollment = {
      ...data,
      id: `enr-${Date.now()}`,
      enrolledAt: new Date().toISOString().split("T")[0],
      status: "active",
    };
    persist([...enrollments, newEnrollment]);
  };

  const cancel = (id: string) => {
    persist(enrollments.map((e) => (e.id === id ? { ...e, status: "cancelled" as const } : e)));
  };

  const getEnrollmentsByClass = (classId: string) =>
    enrollments.filter((e) => e.classId === classId);

  return (
    <EnrollmentContext.Provider value={{ enrollments, enroll, cancel, getEnrollmentsByClass }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollments() {
  const context = useContext(EnrollmentContext);
  if (!context) throw new Error("useEnrollments must be used within EnrollmentProvider");
  return context;
}
