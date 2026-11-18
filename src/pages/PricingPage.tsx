/*
 * PlanBium public pricing page.
 * Blueberry-dominant fluid background.
 * Uses the shared PricingGrid component.
 * Continue preserves selected product through auth flow.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { PricingGrid } from '@/components/pricing/PricingGrid';
import { useLocale } from '@/lib/i18n/locale-context';
import { useCatalog } from '@/hooks/useCatalog';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { useAuth } from '@/lib/auth/auth-context';
import { cartService } from '@/lib/services/cart-service';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/components/ui/Toast';

export function PricingPage() {
  const { t } = useLocale();
  const { products, loading, error, refetch } = useCatalog();
  const { setPending } = usePendingPurchase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  useDocumentTitle('page.title.pricing');
  const { showToast } = useToast();

  const handleSelect = useCallback(
    async (productId: string) => {
      setSelectingId(productId);
      try {
        if (user) {
          try {
            await cartService.addItem(productId);
          } catch {
            showToast('error', t('toast.cartAddFailed'));
          }
          navigate('/dashboard/cart');
        } else {
          setPending(productId);
          navigate('/login');
        }
      } finally {
        setSelectingId(null);
      }
    },
    [navigate, setPending, user, showToast, t],
  );

  return (
    <>
      <FluidBackground variant="blueberry" />

      <div className="px-4 py-12 sm:py-16">
        <Container size="xl">
          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 text-balance">
              {t('pricing.title')}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 text-pretty">
              {t('pricing.subtitle')}
            </p>
          </div>

          <PricingGrid
            products={products}
            loading={loading}
            error={error}
            onRetry={refetch}
            onSelect={handleSelect}
            ownedProductIds={[]}
            selectingId={selectingId}
          />
        </Container>
      </div>
    </>
  );
}
