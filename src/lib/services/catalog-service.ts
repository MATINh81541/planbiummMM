/*
 * PlanBium catalog service (client-side).
 *
 * Reads public active products, prices, and translations via the anon key.
 * All catalog writes (products, prices, translations, assets) are server-side only.
 */

import { supabase } from '@/lib/supabase-client';
import type { Product, Price, ProductTranslation } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { fallbackLocale } from '@/lib/config/locales';

export interface ProductWithContent extends Product {
  translations: ProductTranslation[];
  prices: Price[];
}

export const catalogService = {
  /** List all active products. */
  async listProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Product[];
  },

  /** Get a single active product by slug. */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    return data as Product | null;
  },

  /** Get translations for a product, falling back to English if the requested locale is missing. */
  async getTranslations(productId: string, locale: LocaleCode): Promise<ProductTranslation[]> {
    const { data, error } = await supabase
      .from('product_translations')
      .select('*')
      .eq('product_id', productId)
      .in('locale', [locale, fallbackLocale]);
    if (error) throw error;
    return (data as ProductTranslation[]) ?? [];
  },

  /** Get the best translation for a product (preferred locale, falling back to English). */
  async getBestTranslation(productId: string, locale: LocaleCode): Promise<ProductTranslation | null> {
    const translations = await this.getTranslations(productId, locale);
    return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === fallbackLocale) ?? null;
  },

  /** Get active prices for a product. */
  async getPrices(productId: string): Promise<Price[]> {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .eq('product_id', productId)
      .eq('active', true);
    if (error) throw error;
    return (data as Price[]) ?? [];
  },

  /** Get a product with its translations and prices. */
  async getProductWithContent(slug: string, locale: LocaleCode): Promise<ProductWithContent | null> {
    const product = await this.getProductBySlug(slug);
    if (!product) return null;
    const [translations, prices] = await Promise.all([
      this.getTranslations(product.id, locale),
      this.getPrices(product.id),
    ]);
    return { ...product, translations, prices };
  },
};
