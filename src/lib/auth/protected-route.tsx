/*
 * PlanBium protected route wrapper.
 *
 * Guest accessing a protected route → /login?next=<validated-internal-path>
 * Authenticated user visiting /login or /signup → /dashboard (or pending purchase destination)
 *
 * Open redirect protection: only allow internal paths starting with "/".
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';

/** Validate that a redirect target is a safe internal path. */
function safeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  // Block paths that look like protocol-relative URLs
  return path;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    const next = safeRedirectPath(location.pathname + location.search);
    const loginPath = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}

/** Redirect authenticated users away from auth pages. */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { pendingProductId } = usePendingPurchase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (user) {
    // If there's a pending purchase, send to cart to restore it
    if (pendingProductId) {
      return <Navigate to="/dashboard/cart" replace />;
    }
    // Check for a ?next= param for safe redirect
    const params = new URLSearchParams(location.search);
    const next = safeRedirectPath(params.get('next'));
    return <Navigate to={next ?? '/dashboard'} replace />;
  }

  return <>{children}</>;
}
