"use client";

import { User } from "@/types";

const TOKEN_KEY = "ai_security_token";
const USER_KEY = "ai_security_user";

export const authStorage = {
  getToken: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  setSession: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
