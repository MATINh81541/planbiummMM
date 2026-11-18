/*
 * PlanBium catalog service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo catalog adapter
 * (5 realistic planner products with IRR pricing). When "false", keeps
 * the existing empty-catalog behavior for a real backend to replace.
 */

import type { Product, Price, ProductTranslation } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { fallbackLocale } from '@/lib/config/locales';
import { appConfig } from '@/lib/config/env';
import { demoCatalog } from './demo/catalog';

export interface ProductWithContent extends Product {
  translations: ProductTranslation[];
  prices: Price[];
}

const emptyService = {
  async listProducts(): Promise<Product[]> {
    return [];
  },
  async getProductBySlug(_slug: string): Promise<Product | null> {
    return null;
  },
  async getTranslations(_productId: string, _locale: LocaleCode): Promise<ProductTranslation[]> {
    return [];
  },
  async getBestTranslation(_productId: string, _locale: LocaleCode): Promise<ProductTranslation | null> {
    return null;
  },
  async getPrices(_productId: string): Promise<Price[]> {
    return [];
  },
  async getProductWithContent(_slug: string, _locale: LocaleCode): Promise<ProductWithContent | null> {
    return null;
  },
};

const demoService = {
  async listProducts(): Promise<Product[]> {
    return demoCatalog.listProducts();
  },
  async getProductBySlug(slug: string): Promise<Product | null> {
    return demoCatalog.getProductBySlug(slug);
  },
  async getTranslations(productId: string, locale: LocaleCode): Promise<ProductTranslation[]> {
    return demoCatalog.getTranslations(productId, locale);
  },
  async getBestTranslation(productId: string, locale: LocaleCode): Promise<ProductTranslation | null> {
    return demoCatalog.getBestTranslation(productId, locale);
  },
  async getPrices(productId: string): Promise<Price[]> {
    return demoCatalog.getPrices(productId);
  },
  async getProductWithContent(slug: string, locale: LocaleCode): Promise<ProductWithContent | null> {
    const product = demoCatalog.getProductBySlug(slug);
    if (!product) return null;
    const translations = demoCatalog.getTranslations(product.id, locale);
    const prices = demoCatalog.getPrices(product.id);
    return { ...product, translations, prices };
  },
};

export const catalogService = appConfig.isDemo ? demoService : emptyService;

void fallbackLocale;
