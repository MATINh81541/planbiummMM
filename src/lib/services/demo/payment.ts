/*
 * Demo payment adapter.
 *
 * initiatePayment creates a pending order from the checkout session and
 * returns an orderId (no real redirect). verifyPayment checks the order
 * status. The actual "payment" is triggered by the demo payment button
 * on the checkout result page via demoPayment.completePayment().
 */

import type { PaymentInitResponse } from '../payment-service';
import { demoCheckout } from './checkout';
import { demoOrders } from './orders';
import { demoEntitlements } from './entitlements';
import { demoCart } from './cart';

export const demoPayment = {
  async initiatePayment(_sessionId: string, _methodId: string): Promise<PaymentInitResponse> {
    const orderId = await demoCheckout.createOrderFromSession();

    return {
      orderId,
      paymentId: `pay_${orderId}`,
      provider: 'demo',
      redirectUrl: null,
      status: 'initiated',
    };
  },

  async verifyPayment(orderId: string): Promise<{ orderStatus: string; paymentStatus: string }> {
    const { order } = await demoOrders.getOrder(orderId);
    if (!order) {
      return { orderStatus: 'expired', paymentStatus: 'failed' };
    }

    if (order.status === 'paid') {
      return { orderStatus: 'paid', paymentStatus: 'succeeded' };
    }

    return { orderStatus: 'pending', paymentStatus: 'processing' };
  },

  /**
   * Simulate a successful payment: mark the order as paid, grant
   * entitlements, and clear the cart. Called by the demo payment button.
   */
  async completePayment(orderId: string, method: string): Promise<{ orderStatus: string; paymentStatus: string }> {
    const { order } = await demoOrders.getOrder(orderId);
    if (!order) {
      return { orderStatus: 'expired', paymentStatus: 'failed' };
    }

    if (order.status === 'paid') {
      return { orderStatus: 'paid', paymentStatus: 'succeeded' };
    }

    demoOrders.markOrderPaid(orderId, method);

    const productIds = await demoOrders.getOrderProductIds(orderId);
    demoEntitlements.grantEntitlementsForOrder(orderId, productIds);

    await demoCart.clearCart();

    demoCheckout.clearSession();

    return { orderStatus: 'paid', paymentStatus: 'succeeded' };
  },
};
