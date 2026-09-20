/*
 * PlanBium pricing page.
 * Blueberry-dominant fluid background.
 * Exactly 5 pricing/product cards consuming backend catalog data.
 * Continue preserves selected product through auth flow.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/PricingCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useLocale } from '@/lib/i18n/locale-context';
import { useCatalog } from '@/hooks/useCatalog';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { supabase } from '@/lib/supabase-client';
import { cartService } from '@/lib/services/cart-service';

export function PricingPage() {
  const { t } = useLocale();
  const { products, loading, error, refetch } = useCatalog();
  const { setPending } = usePendingPurchase();
  const navigate = useNavigate();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = useCallback(
    async (productId: string) => {
      setSelectingId(productId);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Unauthenticated — preserve selected product, route to auth
          setPending(productId);
          navigate('/login?next=/dashboard/cart');
          return;
        }

        // Authenticated — add to real server-backed cart
        await cartService.addItem(productId);
        navigate('/dashboard/cart');
      } catch {
        // If cart fails, still preserve the selection
        setPending(productId);
        navigate('/login?next=/dashboard/cart');
      } finally {
        setSelectingId(null);
      }
    },
    [navigate, setPending],
  );

  // Determine which product is "popular" — the middle one (index 2)
  const popularIndex = 2;

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

          {/* Content */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
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

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="glass-surface rounded-glass px-6 py-4 text-gray-600">
                {t('pricing.noProducts')}
              </div>
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
      </div>
    </>
  );
}
