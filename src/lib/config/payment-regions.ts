/*
 * PlanBium payment-region registry.
 *
 * Structure:
 *   COUNTRY → PAYMENT REGION → CURRENCY → ALLOWED PAYMENT METHODS → PROVIDER RULES
 *
 * Language and payment region are INDEPENDENT state axes.
 * Changing language must NEVER silently change payment region.
 */

import type { PaymentRegionId } from './countries';

export type CurrencyCode = 'USD' | 'EUR' | 'IRR' | 'CNY';

export type PaymentMethodId = 'zarinpal-card' | 'stripe-card' | 'paypal';

export type MismatchPolicy = 'allow' | 'flag' | 'require_reconfirm' | 'deny';

export interface PaymentRegionConfig {
  id: PaymentRegionId;
  label: string;
  currency: CurrencyCode;
  allowedMethods: PaymentMethodId[];
  mismatchPolicy: MismatchPolicy;
}

export const paymentRegions: Record<PaymentRegionId, PaymentRegionConfig> = {
  ir: {
    id: 'ir',
    label: 'Iran',
    currency: 'IRR',
    allowedMethods: ['zarinpal-card'],
    mismatchPolicy: 'flag',
  },
  eu: {
    id: 'eu',
    label: 'European Union',
    currency: 'EUR',
    allowedMethods: ['stripe-card', 'paypal'],
    mismatchPolicy: 'flag',
  },
  intl: {
    id: 'intl',
    label: 'International',
    currency: 'USD',
    allowedMethods: ['stripe-card', 'paypal'],
    mismatchPolicy: 'flag',
  },
};

export function getPaymentRegion(regionId: string): PaymentRegionConfig | undefined {
  return paymentRegions[regionId as PaymentRegionId];
}
