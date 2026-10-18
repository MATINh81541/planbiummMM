/*
 * PlanBium auth context — temporary demo mode.
 *
 * Supabase auth has been removed while we prepare a custom backend.
 * This context now exposes a synthetic demo user so existing dashboard UI
 * that reads `useAuth()` (avatar, email, account form) keeps rendering.
 *
 * No real session exists — actions that require a real backend (checkout,
 * payments, profile persistence, downloads) intentionally fail and surface
 * an error rather than pretending to succeed.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Minimal user shape compatible with the previous Supabase-based consumer code
 * (email + id only). Components only read `user.email` and `user.id`.
 */
export interface DemoUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  session: null;
  user: DemoUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: DemoUser = {
  id: 'demo-user',
  email: 'demo@planbium.local',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<DemoUser | null>(DEMO_USER);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: null,
      user,
      loading: false,
      signOut: async () => {
        /* No real session to clear in demo mode. */
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
