"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole, UserProfile } from "@/lib/types";

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  userName: string;
  profiles: UserProfile[];
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, name: string) => void;
  logout: () => void;
  addProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "bahamas_auth";

const defaultProfiles: UserProfile[] = [
  { id: "profile-1", name: "Zosia", type: "child", age: 7, interests: ["dance", "art"] },
  { id: "profile-2", name: "Kacper", type: "child", age: 14, interests: ["technology", "sport"] },
  { id: "profile-self", name: "Ja", type: "self", interests: ["cooking", "art", "sport"] },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    role: null,
    userName: "",
    profiles: [],
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persist = (newState: AuthState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const login = (role: UserRole, name: string) => {
    persist({
      isLoggedIn: true,
      role,
      userName: name,
      profiles: role === "user" ? defaultProfiles : [],
    });
  };

  const logout = () => {
    persist({ isLoggedIn: false, role: null, userName: "", profiles: [] });
  };

  const addProfile = (profile: UserProfile) => {
    const newState = { ...state, profiles: [...state.profiles, profile] };
    persist(newState);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, addProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
