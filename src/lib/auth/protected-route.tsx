
import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';

function safeRedirectPath(path: string | null): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return null;
  }
  return path;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // TEMPORARY: allow dashboard preview in local development only.
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    const next = safeRedirectPath(location.pathname + location.search);
    const loginPath = next
      ? `/login?next=${encodeURIComponent(next)}`
      : '/login';
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}

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
    if (pendingProductId) {
      return <Navigate to="/dashboard/cart" replace />;
    }

    const params = new URLSearchParams(location.search);
    const next = safeRedirectPath(params.get('next'));
    return <Navigate to={next ?? '/dashboard'} replace />;
  }

  return <>{children}</>;
}
