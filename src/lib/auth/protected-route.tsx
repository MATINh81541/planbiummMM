/*
 * PlanBium route guards — temporary demo mode.
 *
 * The Supabase-backed auth has been removed while we prepare a custom backend.
 * Both guards currently render their children unconditionally so the existing
 * dashboard UI can be exercised without a real session.
 *
 * When the new backend is wired up, reintroduce real session checks here.
 */

import { type ReactNode } from 'react';

/** Temporary pass-through: dashboard pages render without a session. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Temporary pass-through for guest-only routes (login/signup).
 * Auth pages are currently disabled in the router, so this is effectively unused,
 * but kept so imports continue to resolve.
 */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
