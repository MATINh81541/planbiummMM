/*
 * PlanBium auth callback page.
 *
 * Handles OAuth redirect callbacks (e.g. Google).
 * Preserves session, validates next path, prevents open redirects.
 * If pending purchase exists, redirects to cart. Otherwise dashboard.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useLocale } from '@/lib/i18n/locale-context';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

function safeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

export function AuthCallbackPage() {
  const { t } = useLocale();
  const { pendingProductId } = usePendingPurchase();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data.session) {
          // No session — check for error in URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const errorCode = hashParams.get('error_code');
          if (errorCode) {
            navigate('/auth/error', { replace: true });
            return;
          }
          // No session and no error — go to login
          navigate('/login', { replace: true });
          return;
        }

        // Session established — determine destination
        if (pendingProductId) {
          navigate('/dashboard/cart', { replace: true });
        } else {
          const params = new URLSearchParams(window.location.search);
          const next = safeRedirectPath(params.get('next'));
          navigate(next ?? '/dashboard', { replace: true });
        }
      } catch {
        setError('Authentication failed');
        setTimeout(() => navigate('/auth/error', { replace: true }), 1500);
      }
    })();
  }, [navigate, pendingProductId]);

  return (
    <>
      <FluidBackground variant="gray" />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Container size="sm">
          <GlassCard variant="strong" className="p-10 text-center">
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <>
                <Loader2 size={32} className="mx-auto animate-spin text-gray-500 mb-4" aria-hidden="true" />
                <p className="text-gray-700 font-medium">{t('auth.dashboardRedirect')}</p>
              </>
            )}
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
