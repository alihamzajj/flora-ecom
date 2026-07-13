import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/lib/api";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "manager" | "admin";
  isVerified?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const USER_KEY = "flora-user";
const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadUser();
    const token = localStorage.getItem("accessToken");
    if (saved && token) setUser(saved);
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAdmin: user?.role === "admin" || user?.role === "manager",
      login: async (email, password) => {
        const data = await authService.login(email, password);
        const nextUser = data.user as AuthUser;
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        return nextUser;
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // ignore network logout errors
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("accessToken");
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
