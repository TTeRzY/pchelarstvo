"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, User } from "@/lib/authClient";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Auto-restore from token (mock) or httpOnly cookie (Sanctum)
    authClient.me().then(setUser).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user, loading,
    setUser,
    async login(email, password) {
      setLoading(true);
      try {
        const res = await authClient.login(email, password);
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    },
    async register(name, email, password) {
      setLoading(true);
      try {
        const res = await authClient.register(name, email, password);
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    },
    async logout() {
      setLoading(true);
      try {
        await authClient.logout();
        setUser(null);
        // Always redirect to home page after logout
        router.push('/');
      } finally {
        setLoading(false);
      }
    },
  }), [user, loading, router]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
