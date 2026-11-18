/*
 * PlanBium checkout service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo checkout adapter.
 * When "false", keeps the existing throw-on-use behavior.
 */

import type { CheckoutResponse } from '@/lib/types';
import { appConfig } from '@/lib/config/env';
import { demoCheckout } from './demo/checkout';

const emptyService = {
  async createCheckout(): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },
  async confirmCountry(_sessionId: string, _billingCountry: string): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },
  async getCheckout(_sessionId: string): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },
};

export const checkoutService = appConfig.isDemo ? demoCheckout : emptyService;
