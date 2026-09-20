/*
 * PlanBium auth error page.
 *
 * Supports OAuth failure, invalid callback, expired state, provider error.
 * Localized error messages.
 */

import { Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/locale-context';

export function AuthErrorPage() {
  const { t } = useLocale();

  return (
    <>
      <FluidBackground variant="gray" />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Container size="sm">
          <GlassCard variant="strong" className="p-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-red-100/60 text-red-600 mb-5">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('auth.authFailed')}</h1>
            <p className="text-gray-500 mb-6">{t('auth.authFailedDescription')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button variant="primary" size="md">
                  <RefreshCw size={18} aria-hidden="true" />
                  {t('auth.retryAuth')}
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="md">
                  <Home size={18} aria-hidden="true" />
                  {t('auth.backToHome')}
                </Button>
              </Link>
            </div>
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
