/*
 * PlanBium catalog hook.
 *
 * Fetches active products with translations and prices from the backend.
 * Uses the catalogService from Prompt 1.
 * Loading and error states are exposed for polished UI.
 */

import { useEffect, useState, useCallback } from 'react';
import { catalogService, type ProductWithContent } from '@/lib/services/catalog-service';
import { useLocale } from '@/lib/i18n/locale-context';
import type { Price, ProductTranslation } from '@/lib/types';

export interface CatalogProduct {
  product: ProductWithContent;
  translation: ProductTranslation | null;
  displayPrice: Price | null;
}

interface UseCatalogResult {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCatalog(): UseCatalogResult {
  const { locale } = useLocale();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const activeProducts = await catalogService.listProducts();
        const enriched: CatalogProduct[] = await Promise.all(
          activeProducts.map(async (product) => {
            const [translations, prices] = await Promise.all([
              catalogService.getTranslations(product.id, locale),
              catalogService.getPrices(product.id),
            ]);

            const translation =
              translations.find((t) => t.locale === locale) ??
              translations.find((t) => t.locale === 'en') ??
              null;

            // For display, pick the first active price (the pricing page shows all)
            // The actual checkout uses the server-resolved currency for the user's region.
            const displayPrice = prices[0] ?? null;

            return {
              product: { ...product, translations, prices },
              translation,
              displayPrice,
            };
          }),
        );

        if (!cancelled) {
          setProducts(enriched);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale, refetchKey]);

  return { products, loading, error, refetch };
}
