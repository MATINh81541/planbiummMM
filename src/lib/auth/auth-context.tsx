/*
 * PlanBium auth context.
 *
 * Wraps Supabase auth state, exposes user/session/loading to the app.
 * Uses onAuthStateChange with the async deadlock guard pattern.
 * Handles SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED events.
 * Session persists across browser refresh via Supabase's built-in storage.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { profileService } from '@/lib/services/profile-service';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Auth session restore error:', error.message);
      }
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          try {
            await profileService.ensureProfile();
          } catch (err) {
            console.error('Profile creation error:', err instanceof Error ? err.message : err);
          }
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
        }

        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(newSession);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, loading, signOut }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
