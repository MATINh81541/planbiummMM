/*
 * PlanBium auth pages — temporarily disabled.
 *
 * Supabase auth has been removed while we prepare a custom backend. The login
 * and signup routes are disabled in the router (they redirect to /dashboard),
 * but this component is kept so imports resolve and a clear message is shown
 * if the route is reached directly.
 */

import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { t } = useLocale();
  void mode;

  return (
    <>
      <FluidBackground variant="gray" />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Container size="sm">
          <GlassCard variant="strong" className="p-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-gray-100/60 text-gray-500 mb-5">
              <Lock size={32} aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('auth.authFailed')}</h1>
            <p className="text-gray-500 mb-6">
              Sign in and sign up are temporarily unavailable while we connect a new backend.
            </p>
            <Link to="/dashboard">
              <Button variant="primary" size="md">
                {t('auth.backToHome')}
              </Button>
            </Link>
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
