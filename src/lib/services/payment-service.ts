/*
 * PlanBium payment service — temporary demo mode.
 *
 * Supabase and the payment edge function have been removed. Payment
 * initiation/verification throw a clear "backend_unavailable" error so no
 * fake payments or orders are created. Reimplement against the custom
 * backend when ready.
 */

export interface PaymentInitResponse {
  orderId: string;
  paymentId: string;
  provider: string;
  redirectUrl: string | null;
  status: string;
}

export const paymentService = {
  /** Initiate a payment for a checkout session. Unavailable in demo mode. */
  async initiatePayment(_sessionId: string, _methodId: string): Promise<PaymentInitResponse> {
    throw new Error('backend_unavailable');
  },

  /** Verify payment after browser return. Unavailable in demo mode. */
  async verifyPayment(_orderId: string): Promise<{ orderStatus: string; paymentStatus: string }> {
    throw new Error('backend_unavailable');
  },
};
