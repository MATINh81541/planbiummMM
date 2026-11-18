/*
 * PlanBium dashboard pricing page.
 *
 * Uses the shared PricingGrid component.
 * Continue adds to the real server-backed cart (user is already authenticated).
 * Owned products show a "Purchased" badge and link to purchases.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/lib/i18n/locale-context';
import { useCatalog } from '@/hooks/useCatalog';
import { cartService } from '@/lib/services/cart-service';
import { entitlementService } from '@/lib/services/entitlement-service';
import { Container } from '@/components/ui/Container';
import { PricingGrid } from '@/components/pricing/PricingGrid';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/components/ui/Toast';

export function DashboardPricingPage() {
  const { t } = useLocale();
  const { products, loading, error, refetch } = useCatalog();
  const navigate = useNavigate();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  useDocumentTitle('page.title.dashboardPricing');
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const entitlements = await entitlementService.listEntitlements();
        setOwnedProductIds(entitlements.map((e) => e.product_id));
      } catch {
        // Non-fatal — grid still renders without owned badges
      }
    })();
  }, []);

  const handleSelect = useCallback(async (productId: string) => {
    setSelectingId(productId);
    try {
      if (ownedProductIds.includes(productId)) {
        navigate('/dashboard/purchases');
        return;
      }
      await cartService.addItem(productId);
      showToast('success', t('toast.addedToCart'));
      navigate('/dashboard/cart');
    } catch {
      showToast('error', t('toast.cartAddFailed'));
    } finally {
      setSelectingId(null);
    }
  }, [navigate, ownedProductIds, showToast, t]);

  return (
    <Container size="xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{t('pricing.title')}</h1>
        <p className="mt-1 text-gray-500">{t('pricing.subtitle')}</p>
      </div>

      <PricingGrid
        products={products}
        loading={loading}
        error={error}
        onRetry={refetch}
        onSelect={handleSelect}
        ownedProductIds={ownedProductIds}
        selectingId={selectingId}
      />
    </Container>
  );
}
