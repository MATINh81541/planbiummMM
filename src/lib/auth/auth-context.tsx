/*
 * PlanBium authentication context.
 *
 * Adapter-based auth: a DemoAuth adapter is used when VITE_DEMO_MODE is "true".
 * A real backend adapter can be added later without changing any consuming page.
 *
 * IMPORTANT: Role checks in the frontend (AdminRoute, Header UI) are for UX
 * only — they control which pages are visible and navigable. Real authorization
 * must be enforced by the backend on every request. Never rely on client-side
 * role checks for security.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { appConfig } from '@/lib/config/env';
import { demoGet, demoSet, demoRemove, demoId } from '@/lib/services/demo/shared';
import { cartService } from '@/lib/services/cart-service';

/* ---- Public types ---- */

export type AuthRole = 'customer' | 'admin';
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProfile {
  displayName: string;
  role: AuthRole;
}

export interface Session {
  user: AuthUser;
  profile: AuthProfile;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: AuthProfile | null;
  role: AuthRole | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'session';

/* ---- Adapter interface ---- */

export interface AuthAdapter {
  getSession: () => Session | null;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (email: string, password: string, displayName: string) => Promise<Session>;
  signOut: () => void;
}

/* ---- Demo adapter ---- */

const DEMO_ADMIN_EMAIL = 'admin@planbium.ir';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const demoAdapter: AuthAdapter = {
  getSession(): Session | null {
    return demoGet<Session | null>(SESSION_KEY, null);
  },

  async signIn(email: string, password: string): Promise<Session> {
    await new Promise((r) => setTimeout(r, 400));

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new AuthError('auth.error.invalidEmail');
    }
    if (password.length < 6) {
      throw new AuthError('auth.error.passwordTooShort');
    }

    const isAdmin = normalized === DEMO_ADMIN_EMAIL;
    const session: Session = {
      user: {
        id: demoId('user'),
        email: normalized,
      },
      profile: {
        displayName: isAdmin ? 'Admin' : normalized.split('@')[0],
        role: isAdmin ? 'admin' : 'customer',
      },
    };
    demoSet(SESSION_KEY, session);
    return session;
  },

  async signUp(email: string, password: string, displayName: string): Promise<Session> {
    await new Promise((r) => setTimeout(r, 400));

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new AuthError('auth.error.invalidEmail');
    }
    if (password.length < 6) {
      throw new AuthError('auth.error.passwordTooShort');
    }
    if (!displayName.trim() || displayName.trim().length < 2) {
      throw new AuthError('auth.error.displayNameTooShort');
    }

    const isAdmin = normalized === DEMO_ADMIN_EMAIL;
    const session: Session = {
      user: {
        id: demoId('user'),
        email: normalized,
      },
      profile: {
        displayName: displayName.trim(),
        role: isAdmin ? 'admin' : 'customer',
      },
    };
    demoSet(SESSION_KEY, session);
    return session;
  },

  signOut() {
    demoRemove(SESSION_KEY);
  },
};

/* ---- Error class ---- */

export class AuthError extends Error {
  constructor(public readonly messageKey: string) {
    super(messageKey);
    this.name = 'AuthError';
  }
}

/* ---- Provider ---- */

function getAdapter(): AuthAdapter {
  if (appConfig.isDemo) return demoAdapter;
  // TODO: Replace with a real backend adapter when the backend is connected.
  // For now, non-demo mode throws so the app doesn't silently bypass auth.
  return {
    getSession: () => null,
    signIn: () => Promise.reject(new AuthError('auth.error.backendUnavailable')),
    signUp: () => Promise.reject(new AuthError('auth.error.backendUnavailable')),
    signOut: () => {},
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => getAdapter(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const existing = adapter.getSession();
    if (existing) {
      setSession(existing);
      setStatus('authenticated');
    } else {
      setStatus('anonymous');
    }
  }, [adapter]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const s = await adapter.signIn(email, password);
      setSession(s);
      setStatus('authenticated');
    },
    [adapter],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const s = await adapter.signUp(email, password, displayName);
      setSession(s);
      setStatus('authenticated');
    },
    [adapter],
  );

  const signOut = useCallback(async () => {
    adapter.signOut();
    setSession(null);
    setStatus('anonymous');
    try {
      await cartService.clearCart();
    } catch {
      // cart clear failure is non-fatal during sign-out
    }
    try {
      sessionStorage.removeItem('planbium.pendingPurchase');
    } catch {
      // ignore
    }
  }, [adapter]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      profile: session?.profile ?? null,
      role: session?.profile.role ?? null,
      status,
      signIn,
      signUp,
      signOut,
    }),
    [session, status, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
