/*
 * PlanBium admin route guard.
 *
 * IMPORTANT: Role checks in the frontend are for UX only. Real authorization
 * must be enforced by the backend on every request.
 */

import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/lib/i18n/locale-context';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-lime-600" />
    </div>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, role } = useAuth();
  const { showToast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    if (status === 'authenticated' && role !== 'admin') {
      showToast('error', t('auth.error.notAdmin'));
    }
  }, [status, role, showToast, t]);

  if (status === 'loading') {
    return <FullScreenSpinner />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
