/*
 * PlanBium 404 page.
 */

import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocale } from '@/lib/i18n/locale-context';

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <>
      <FluidBackground variant="lime" />
      <div className="px-4 py-12">
        <Container size="sm">
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tighter text-gray-900">
              404
            </h1>
            <GlassCard className="mt-6 p-8 max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('common.notFound.title')}
              </h2>
              <p className="text-gray-500 mb-6">
                {t('common.notFound.body')}
              </p>
              <Link to="/">
                <Button variant="primary" size="md">
                  <Home size={18} aria-hidden="true" />
                  {t('common.backHome')}
                </Button>
              </Link>
            </GlassCard>
          </div>
        </Container>
      </div>
    </>
  );
}
