/*
 * PlanBium auth callback page — temporarily disabled.
 *
 * With Supabase auth removed, OAuth callbacks are not expected. This page
 * simply redirects to the dashboard. Kept so the route resolves if an old
 * bookmark or redirect lands here.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

export function AuthCallbackPage() {
  const { t } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <>
      <FluidBackground variant="gray" />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Container size="sm">
          <GlassCard variant="strong" className="p-10 text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-gray-500 mb-4" aria-hidden="true" />
            <p className="text-gray-700 font-medium">{t('auth.dashboardRedirect')}</p>
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
