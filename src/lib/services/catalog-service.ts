/*
 * PlanBium catalog service — temporary demo mode.
 *
 * Supabase has been removed. The catalog service now returns an empty active
 * catalog and null lookups so the pricing UI renders its (existing) empty
 * state without a backend. The interface is preserved so a custom backend can
 * be plugged in later without touching consumers.
 */

import type { Product, Price, ProductTranslation } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { fallbackLocale } from '@/lib/config/locales';

export interface ProductWithContent extends Product {
  translations: ProductTranslation[];
  prices: Price[];
}

export const catalogService = {
  /** List all active products. Empty in demo mode. */
  async listProducts(): Promise<Product[]> {
    return [];
  },

  /** Get a single active product by slug. None in demo mode. */
  async getProductBySlug(_slug: string): Promise<Product | null> {
    return null;
  },

  /** Get translations for a product. Empty in demo mode. */
  async getTranslations(_productId: string, _locale: LocaleCode): Promise<ProductTranslation[]> {
    return [];
  },

  /** Get the best translation for a product. None in demo mode. */
  async getBestTranslation(_productId: string, _locale: LocaleCode): Promise<ProductTranslation | null> {
    return null;
  },

  /** Get active prices for a product. Empty in demo mode. */
  async getPrices(_productId: string): Promise<Price[]> {
    return [];
  },

  /** Get a product with its translations and prices. None in demo mode. */
  async getProductWithContent(_slug: string, _locale: LocaleCode): Promise<ProductWithContent | null> {
    return null;
  },
};

// Keep the fallback import referenced for future implementation parity.
void fallbackLocale;
