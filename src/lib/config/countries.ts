/*
 * PlanBium country registry.
 *
 * Maps ISO country codes → default locale → payment region.
 * Do not scatter `if country === "IR"` checks throughout services/components.
 * Unknown countries fall back to a safe default.
 */

import type { LocaleCode } from './locales';

export interface CountryConfig {
  isoCode: string;
  defaultLocale: LocaleCode;
  paymentRegionId: string;
}

export type PaymentRegionId = 'ir' | 'eu' | 'intl';

const countryRegistry: Record<string, CountryConfig> = {
  IR: { isoCode: 'IR', defaultLocale: 'fa', paymentRegionId: 'ir' },
  NL: { isoCode: 'NL', defaultLocale: 'nl', paymentRegionId: 'eu' },
  ES: { isoCode: 'ES', defaultLocale: 'es', paymentRegionId: 'eu' },
  CN: { isoCode: 'CN', defaultLocale: 'zh-Hans', paymentRegionId: 'intl' },
  // English-speaking defaults
  US: { isoCode: 'US', defaultLocale: 'en', paymentRegionId: 'intl' },
  GB: { isoCode: 'GB', defaultLocale: 'en', paymentRegionId: 'eu' },
  CA: { isoCode: 'CA', defaultLocale: 'en', paymentRegionId: 'intl' },
  AU: { isoCode: 'AU', defaultLocale: 'en', paymentRegionId: 'intl' },
  // Additional Arabic-speaking countries (configurable, not hardcoded in services)
  SA: { isoCode: 'SA', defaultLocale: 'ar', paymentRegionId: 'intl' },
  AE: { isoCode: 'AE', defaultLocale: 'ar', paymentRegionId: 'intl' },
  EG: { isoCode: 'EG', defaultLocale: 'ar', paymentRegionId: 'intl' },
  IQ: { isoCode: 'IQ', defaultLocale: 'ar', paymentRegionId: 'intl' },
};

const fallbackCountry: CountryConfig = {
  isoCode: 'US',
  defaultLocale: 'en',
  paymentRegionId: 'intl',
};

export function getCountryConfig(isoCode: string | null | undefined): CountryConfig {
  if (isoCode && isoCode in countryRegistry) {
    return countryRegistry[isoCode];
  }
  return fallbackCountry;
}

export function isKnownCountry(isoCode: string): boolean {
  return isoCode in countryRegistry;
}

export function getCountriesForRegion(regionId: PaymentRegionId): CountryConfig[] {
  return Object.values(countryRegistry).filter((c) => c.paymentRegionId === regionId);
}
