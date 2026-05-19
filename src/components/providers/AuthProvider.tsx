"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { clearSession, persistSession, readSessionCookie } from "@/lib/auth/client";
import type { AppSession } from "@/lib/auth/session";
import { roleDashboardRoutes } from "@/lib/auth/session";

interface AuthContextValue {
  isPending: boolean;
  session: AppSession | null;
  signIn: (input: { email: string; password: string; role: AppSession["role"] }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: AppSession | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AppSession | null>(initialSession);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const cookieSession = readSessionCookie();
    if (cookieSession) {
      setSession(cookieSession);
    }
  }, [pathname]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isPending,
      session,
      async signIn(input) {
        const result = await persistSession(input);
        setSession(result.session);
        startTransition(() => {
          router.replace(roleDashboardRoutes[result.session.role]);
          router.refresh();
        });
      },
      async signOut() {
        await clearSession();
        setSession(null);
        startTransition(() => {
          router.replace("/login");
          router.refresh();
        });
      },
    }),
    [isPending, router, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

