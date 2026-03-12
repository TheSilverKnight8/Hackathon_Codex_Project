"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SignedInUser } from "@/types/auth";

type AuthContextValue = {
  user: SignedInUser | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { session: { user: SignedInUser } | null };
  return data.session?.user ?? null;
}

export function AuthProvider({
  children,
  initialUser
}: {
  children: ReactNode;
  initialUser: SignedInUser | null;
}) {
  const [user, setUser] = useState<SignedInUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(initialUser ? false : true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    const nextUser = await loadSession();
    setUser(nextUser);
    setIsLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!initialUser) {
      void refreshSession();
    }
  }, [refreshSession, initialUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      refreshSession,
      signOut
    }),
    [user, isLoading, refreshSession, signOut]
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
