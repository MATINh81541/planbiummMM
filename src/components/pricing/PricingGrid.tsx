/*
 * PlanBium shared pricing grid.
 *
 * Renders loading skeletons, error state, empty state, and a responsive
 * grid of PricingCards that works for any number of products (1–8).
 * Used by both the public PricingPage and the dashboard PricingPage.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/PricingCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { CatalogProduct } from '@/hooks/useCatalog';

interface PricingGridProps {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (productId: string) => void;
  ownedProductIds: string[];
  selectingId?: string | null;
}

export function PricingGrid({
  products,
  loading,
  error,
  onRetry,
  onSelect,
  ownedProductIds,
  selectingId,
}: PricingGridProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="glass-surface flex items-center gap-3 rounded-glass px-6 py-4 text-gray-700">
          <AlertCircle size={20} className="text-red-500" aria-hidden="true" />
          <span>{t('pricing.error')}</span>
        </div>
        <Button variant="glass" size="md" onClick={onRetry}>
          <RefreshCw size={18} aria-hidden="true" />
          {t('pricing.retry')}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="glass-surface rounded-glass px-6 py-4 text-gray-600">
          {t('pricing.noProducts')}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((item) => {
        const isOwned = ownedProductIds.includes(item.product.id);
        const billing = (item.product.metadata?.billing as 'one_time' | 'monthly' | undefined) ?? 'one_time';

        return (
          <PricingCard
            key={item.product.id}
            product={item.product}
            translation={item.translation}
            price={item.displayPrice}
            isPopular={item.product.metadata?.is_popular === true}
            isOwned={isOwned}
            billing={billing}
            onSelect={onSelect}
            isLoading={selectingId === item.product.id}
          />
        );
      })}
    </div>
  );
}
