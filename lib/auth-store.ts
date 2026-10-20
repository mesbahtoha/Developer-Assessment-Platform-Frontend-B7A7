"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE, apiFetch } from "./api-client";
import type { AuthPayload, Role, SessionUser } from "./types";

interface AuthState {
  user: SessionUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (payload: AuthPayload) => void;
  clear: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

function readUserCookie(): SessionUser | null {
  try {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ user: readUserCookie(), hydrated: true });
  },
  setSession: (payload) => {
    Cookies.set(ACCESS_COOKIE, payload.accessToken, { expires: 1, sameSite: "lax" });
    Cookies.set(REFRESH_COOKIE, payload.refreshToken, { expires: 30, sameSite: "lax" });
    Cookies.set(USER_COOKIE, JSON.stringify(payload.user), { expires: 30, sameSite: "lax" });
    set({ user: payload.user, hydrated: true });
  },
  clear: () => {
    Cookies.remove(ACCESS_COOKIE);
    Cookies.remove(REFRESH_COOKIE);
    Cookies.remove(USER_COOKIE);
    set({ user: null, hydrated: true });
  },
  hasRole: (...roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));

export function dashboardPathFor(role: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/dashboard";
}

export async function logoutRemote(): Promise<void> {
  const refreshToken = Cookies.get(REFRESH_COOKIE);
  try {
    if (refreshToken) {
      await apiFetch("/auth/logout", { method: "POST", body: { refreshToken } });
    }
  } catch {
    // Best-effort: still clear local session below.
  } finally {
    useAuthStore.getState().clear();
  }
}
