/*
 * PlanBium centralized resolvers.
 *
 * These functions are the ONLY normal path for answering business questions.
 * Do not duplicate them inside pages or UI components.
 *
 * resolveLocale(explicitLocale, country)
 * resolvePaymentRegion(country)
 * resolveCurrency(paymentRegion)
 * resolveAllowedPaymentMethods(paymentRegion)
 * resolveProductPrice(productId, currency) — server-side only (edge function)
 * isProductAvailableInRegion(productId, paymentRegion) — server-side only (edge function)
 */

import { fallbackLocale, isLocaleCode, type LocaleCode } from '@/lib/config/locales';
import { getCountryConfig, type PaymentRegionId } from '@/lib/config/countries';
import { getPaymentRegion, type CurrencyCode } from '@/lib/config/payment-regions';
import { isProviderAvailable } from '@/lib/config/providers';
import type { PaymentMethodId } from '@/lib/config/payment-regions';

/**
 * Resolve locale by priority:
 *   1. explicit/manual user preference
 *   2. country default
 *   3. English fallback
 *
 * Profile preferred_locale is passed as explicitLocale by the caller after loading the profile.
 */
export function resolveLocale(
  explicitLocale: string | null | undefined,
  country: string | null | undefined,
): LocaleCode {
  if (explicitLocale && isLocaleCode(explicitLocale)) {
    return explicitLocale;
  }
  const countryConfig = getCountryConfig(country);
  if (countryConfig.defaultLocale && isLocaleCode(countryConfig.defaultLocale)) {
    return countryConfig.defaultLocale;
  }
  return fallbackLocale;
}

/** Resolve payment region from an ISO country code. */
export function resolvePaymentRegion(country: string | null | undefined): PaymentRegionId {
  return getCountryConfig(country).paymentRegionId as PaymentRegionId;
}

/** Resolve currency from a payment region. */
export function resolveCurrency(paymentRegionId: PaymentRegionId): CurrencyCode {
  const region = getPaymentRegion(paymentRegionId);
  if (!region) {
    return 'USD';
  }
  return region.currency;
}

/** Resolve allowed payment methods for a region + currency combination. */
export function resolveAllowedPaymentMethods(
  paymentRegionId: PaymentRegionId,
  currency: CurrencyCode,
): PaymentMethodId[] {
  const region = getPaymentRegion(paymentRegionId);
  if (!region) return [];
  return region.allowedMethods.filter((method) => isProviderAvailable(method, paymentRegionId, currency));
}

/**
 * Detect geo mismatch between observed IP country and billing country.
 * Returns true when they differ. Does NOT auto-block — provider rules decide.
 */
export function detectGeoMismatch(
  observedIpCountry: string | null | undefined,
  billingCountry: string | null | undefined,
): boolean {
  if (!observedIpCountry || !billingCountry) return false;
  return observedIpCountry.toUpperCase() !== billingCountry.toUpperCase();
}
