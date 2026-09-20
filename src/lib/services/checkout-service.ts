/*
 * PlanBium checkout service (client-side).
 *
 * Calls the checkout edge function which re-derives all business truth server-side.
 * The client never sends prices, currency, provider, or totals — only the billing country
 * and checkout session reference.
 */

import { supabase } from '@/lib/supabase-client';
import type { CheckoutResponse } from '@/lib/types';

async function callCheckoutEndpoint(action: string, body: Record<string, unknown>): Promise<CheckoutResponse> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planbium-checkout`;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'checkout_failed' }));
    throw new Error(err.error || `Checkout request failed (${response.status})`);
  }
  const result = await response.json();
  return result as CheckoutResponse;
}

export const checkoutService = {
  /** Create a new checkout session. The server observes IP country and returns needs_country or ready. */
  async createCheckout(): Promise<CheckoutResponse> {
    return callCheckoutEndpoint('create', {});
  },

  /** Confirm billing country for an existing checkout session. */
  async confirmCountry(sessionId: string, billingCountry: string): Promise<CheckoutResponse> {
    return callCheckoutEndpoint('confirm_country', { sessionId, billingCountry });
  },

  /** Get the current state of a checkout session. */
  async getCheckout(sessionId: string): Promise<CheckoutResponse> {
    return callCheckoutEndpoint('get', { sessionId });
  },
};
