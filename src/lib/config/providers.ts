/*
 * PlanBium payment provider registry.
 *
 * Each provider/method has:
 *   id, display name, enabled, supported regions, supported currencies,
 *   deny rules, mismatch policy, adapter identifier, metadata.
 *
 * A provider is exposed ONLY when: configured + enabled + region supported + currency supported.
 * Do not show an imaginary payment provider merely to make the UI look complete.
 */

import type { PaymentMethodId } from './payment-regions';
import type { PaymentRegionId } from './countries';
import type { CurrencyCode } from './payment-regions';

export type ProviderAdapterId = 'zarinpal' | 'stripe' | 'paypal';

export interface PaymentProviderConfig {
  id: PaymentMethodId;
  adapterId: ProviderAdapterId;
  displayName: string;
  enabled: boolean;
  supportedRegions: PaymentRegionId[];
  supportedCurrencies: CurrencyCode[];
  mismatchPolicy: 'allow' | 'flag' | 'require_reconfirm' | 'deny';
  metadata: Record<string, string>;
}

export const paymentProviders: Record<PaymentMethodId, PaymentProviderConfig> = {
  'zarinpal-card': {
    id: 'zarinpal-card',
    adapterId: 'zarinpal',
    displayName: 'Zarinpal (Card)',
    enabled: false, // disabled until ZARINPAL_MERCHANT_ID is configured
    supportedRegions: ['ir'],
    supportedCurrencies: ['IRR'],
    mismatchPolicy: 'flag',
    metadata: {},
  },
  'stripe-card': {
    id: 'stripe-card',
    adapterId: 'stripe',
    displayName: 'Credit / Debit Card',
    enabled: false, // disabled until Stripe keys are configured
    supportedRegions: ['eu', 'intl'],
    supportedCurrencies: ['USD', 'EUR'],
    mismatchPolicy: 'flag',
    metadata: {},
  },
  paypal: {
    id: 'paypal',
    adapterId: 'paypal',
    displayName: 'PayPal',
    enabled: false,
    supportedRegions: ['eu', 'intl'],
    supportedCurrencies: ['USD', 'EUR'],
    mismatchPolicy: 'flag',
    metadata: {},
  },
};

export function getProvider(methodId: string): PaymentProviderConfig | undefined {
  return paymentProviders[methodId as PaymentMethodId];
}

export function isProviderAvailable(
  methodId: PaymentMethodId,
  regionId: PaymentRegionId,
  currency: CurrencyCode,
): boolean {
  const provider = paymentProviders[methodId];
  if (!provider || !provider.enabled) return false;
  if (!provider.supportedRegions.includes(regionId)) return false;
  if (!provider.supportedCurrencies.includes(currency)) return false;
  return true;
}
