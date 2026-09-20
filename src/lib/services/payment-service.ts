/*
 * PlanBium payment service (client-side).
 *
 * Calls the payment edge function to initiate a payment attempt.
 * The server creates the order, payment record, and starts the provider adapter.
 * The client never dictates the final order total, provider, or currency.
 */

import { supabase } from '@/lib/supabase-client';

export interface PaymentInitResponse {
  orderId: string;
  paymentId: string;
  provider: string;
  redirectUrl: string | null;
  status: string;
}

export const paymentService = {
  /** Initiate a payment for a checkout session. */
  async initiatePayment(sessionId: string, methodId: string): Promise<PaymentInitResponse> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planbium-payment`;
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
      body: JSON.stringify({ action: 'initiate', sessionId, methodId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'payment_init_failed' }));
      throw new Error(err.error || `Payment init failed (${response.status})`);
    }
    const result = await response.json();
    if (!result.orderId || !result.paymentId) {
      throw new Error('Invalid payment response');
    }
    return result as PaymentInitResponse;
  },

  /** Verify payment after browser return (display only — not authoritative). */
  async verifyPayment(orderId: string): Promise<{ orderStatus: string; paymentStatus: string }> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planbium-payment`;
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
      body: JSON.stringify({ action: 'verify', orderId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'payment_verify_failed' }));
      throw new Error(err.error || `Payment verify failed (${response.status})`);
    }
    return response.json();
  },
};
