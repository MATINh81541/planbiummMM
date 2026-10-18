/*
 * PlanBium checkout service — temporary demo mode.
 *
 * Supabase and the checkout edge function have been removed. All checkout
 * operations throw a clear "backend_unavailable" error so the UI surfaces a
 * real failure instead of faking a checkout session. Reimplement against the
 * custom backend when ready.
 */

import type { CheckoutResponse } from '@/lib/types';

export const checkoutService = {
  /** Create a new checkout session. Unavailable in demo mode. */
  async createCheckout(): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },

  /** Confirm billing country for an existing checkout session. Unavailable in demo mode. */
  async confirmCountry(_sessionId: string, _billingCountry: string): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },

  /** Get the current state of a checkout session. Unavailable in demo mode. */
  async getCheckout(_sessionId: string): Promise<CheckoutResponse> {
    throw new Error('backend_unavailable');
  },
};
