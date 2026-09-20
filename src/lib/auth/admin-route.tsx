/*
 * PlanBium admin route guard.
 *
 * Checks authenticated + role === 'admin'.
 * Server enforces this too via the admin edge function — this is a UX layer.
 */

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale } from '@/lib/i18n/locale-context';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsAdmin(data?.role === 'admin');
    })();
  }, [user]);

  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?next=/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <Container size="sm">
        <div className="flex min-h-screen items-center justify-center">
          <GlassCard variant="strong" className="p-8 text-center">
            <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('admin.notAdmin')}</h1>
            <p className="text-gray-500 mb-6">{t('admin.notAdminDescription')}</p>
            <Link to="/dashboard">
              <Button variant="primary" size="md">{t('common.backHome')}</Button>
            </Link>
          </GlassCard>
        </div>
      </Container>
    );
  }

  return <>{children}</>;
}
