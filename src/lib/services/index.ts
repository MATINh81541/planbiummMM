/*
 * PlanBium service layer barrel export.
 *
 * Centralized export point for all service contracts.
 * The exact names may adapt, but responsibilities remain separated:
 *
 *   catalogService      — product/price/translation reads
 *   cartService         — cart and cart item management
 *   checkoutService     — checkout session creation and country confirmation
 *   paymentService      — payment initiation and verification
 *   orderService        — order history and detail reads
 *   entitlementService  — entitlement checks
 *   profileService      — user profile management
 *
 * Server-only services (not exported here — used by edge functions):
 *   downloadService     — signed URL generation (edge function)
 *   refundService       — refund processing (edge function)
 *   emailService        — transactional email queue (edge function)
 *   adminService        — admin data operations (edge function)
 */

export { catalogService } from '@/lib/services/catalog-service';
export { cartService } from '@/lib/services/cart-service';
export { checkoutService } from '@/lib/services/checkout-service';
export { paymentService } from '@/lib/services/payment-service';
export { orderService, entitlementService, requestDownloadUrl } from '@/lib/services/entitlement-service';
export { profileService } from '@/lib/services/profile-service';

// Resolvers and config
export {
  resolveLocale,
  resolvePaymentRegion,
  resolveCurrency,
  resolveAllowedPaymentMethods,
  detectGeoMismatch,
} from '@/lib/resolvers';

export { locales, localeList, supportedLocaleCodes, fallbackLocale, getLocale, isLocaleCode } from '@/lib/config/locales';
export type { LocaleCode, LocaleConfig, TextDirection } from '@/lib/config/locales';
export { getCountryConfig, isKnownCountry } from '@/lib/config/countries';
export type { CountryConfig, PaymentRegionId } from '@/lib/config/countries';
export { paymentRegions, getPaymentRegion } from '@/lib/config/payment-regions';
export type { CurrencyCode, PaymentMethodId, PaymentRegionConfig, MismatchPolicy } from '@/lib/config/payment-regions';
export { paymentProviders, getProvider, isProviderAvailable } from '@/lib/config/providers';
export type { PaymentProviderConfig, ProviderAdapterId } from '@/lib/config/providers';
export { appConfig, clientEnv } from '@/lib/config/env';

// Types and errors
export type * from '@/lib/types';
export { apiError } from '@/lib/errors';
export type { ErrorCode, ApiError } from '@/lib/errors';
