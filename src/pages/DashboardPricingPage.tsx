/*
 * PlanBium dashboard pricing page.
 *
 * Uses the same backend catalog/pricing source as public pricing.
 * Continue adds to the real server-backed cart (user is already authenticated).
 * Duplicate purchase protection: checks entitlements.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { useCatalog } from '@/hooks/useCatalog';
import { cartService } from '@/lib/services/cart-service';
import { entitlementService } from '@/lib/services/entitlement-service';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/PricingCard';
import { SkeletonCard } from '@/components/ui/Skeleton';

export function DashboardPricingPage() {
  const { t } = useLocale();
  const { products, loading, error, refetch } = useCatalog();
  const navigate = useNavigate();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = useCallback(async (productId: string) => {
    setSelectingId(productId);
    try {
      // Check if already owned
      const owned = await entitlementService.hasEntitlement(productId);
      if (owned) {
        navigate('/dashboard/purchases');
        return;
      }
      await cartService.addItem(productId);
      navigate('/dashboard/cart');
    } catch {
      // ignore
    } finally {
      setSelectingId(null);
    }
  }, [navigate]);

  const popularIndex = 2;

  return (
    <Container size="xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{t('pricing.title')}</h1>
        <p className="mt-1 text-gray-500">{t('pricing.subtitle')}</p>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="glass-surface flex items-center gap-3 rounded-glass px-6 py-4 text-gray-700">
            <AlertCircle size={20} className="text-red-500" aria-hidden="true" />
            <span>{t('pricing.error')}</span>
          </div>
          <Button variant="glass" size="md" onClick={refetch}>
            <RefreshCw size={18} aria-hidden="true" />
            {t('pricing.retry')}
          </Button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.map((item, i) => (
            <PricingCard
              key={item.product.id}
              product={item.product}
              translation={item.translation}
              price={item.displayPrice}
              isPopular={i === popularIndex}
              onSelect={handleSelect}
              isLoading={selectingId === item.product.id}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
