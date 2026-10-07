"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Hydrates the zustand auth store from cookies on first client render. */
export function useAuth() {
  const { user, hydrated, hydrate, clear, hasRole } = useAuthStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return { user, hydrated, clear, hasRole, isAuthed: !!user };
}
