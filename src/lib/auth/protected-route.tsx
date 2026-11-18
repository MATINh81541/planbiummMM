/*
 * PlanBium route guards.
 *
 * IMPORTANT: Role checks in the frontend are for UX only — they control which
 * pages are visible and navigable. Real authorization must be enforced by the
 * backend on every request.
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-lime-600" />
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullScreenSpinner />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Guest-only route: redirects authenticated users away from login/signup.
 */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullScreenSpinner />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
