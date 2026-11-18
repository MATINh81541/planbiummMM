/*
 * Demo checkout adapter.
 *
 * Simulates a checkout session. On create, builds priced lines from
 * the current cart. On confirmCountry, resolves region/currency/methods.
 * The demo always uses IRR pricing and offers Zarinpal + a demo card method.
 */

import type { CheckoutResponse, PricedLine } from '@/lib/types';
import { demoCart } from './cart';
import { demoCatalog } from './catalog';
import { demoOrders } from './orders';
import { demoId } from './shared';

interface DemoCheckoutSession {
  sessionId: string;
  billingCountry: string | null;
  status: 'needs_country' | 'ready';
}

let currentSession: DemoCheckoutSession | null = null;

async function buildPricedLines(cartItems: { product_id: string; quantity: number }[]): Promise<{
  lines: PricedLine[];
  total: number;
  unavailable: string[];
}> {
  const lines: PricedLine[] = [];
  let total = 0;
  const unavailable: string[] = [];

  for (const item of cartItems) {
    const product = demoCatalog.getProductById(item.product_id);
    if (!product) {
      unavailable.push(item.product_id);
      continue;
    }
    const prices = demoCatalog.getPrices(item.product_id);
    const price = prices[0];
    if (!price) {
      unavailable.push(item.product_id);
      continue;
    }
    const translation = demoCatalog.getBestTranslation(item.product_id, 'en');
    const lineTotal = price.amount_minor * item.quantity;
    lines.push({
      product_id: item.product_id,
      product_name: translation?.name ?? product.slug,
      quantity: item.quantity,
      unit_amount_minor: price.amount_minor,
      total_amount_minor: lineTotal,
      currency: price.currency,
    });
    total += lineTotal;
  }

  return { lines, total, unavailable };
}

function toResponse(session: DemoCheckoutSession): CheckoutResponse {
  return {
    status: session.status,
    billingCountry: session.billingCountry,
    region: session.billingCountry === 'IR' ? 'ir' : 'intl',
    currency: 'IRR',
    pricedLines: [],
    total: null,
    allowedMethods: [],
    unavailableProducts: [],
    sessionId: session.sessionId,
  };
}

export const demoCheckout = {
  async createCheckout(): Promise<CheckoutResponse> {
    const { items } = await demoCart.getCartWithItems();
    if (items.length === 0) {
      throw new Error('cart_empty');
    }

    currentSession = {
      sessionId: demoId('chk'),
      billingCountry: null,
      status: 'needs_country',
    };

    return toResponse(currentSession);
  },

  async confirmCountry(_sessionId: string, billingCountry: string): Promise<CheckoutResponse> {
    if (!currentSession) {
      throw new Error('checkout_expired');
    }

    currentSession.billingCountry = billingCountry.toUpperCase();
    currentSession.status = 'ready';

    const { items } = await demoCart.getCartWithItems();
    const { lines, total, unavailable } = await buildPricedLines(
      items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    );

    return {
      status: unavailable.length > 0 ? 'unavailable' : 'ready',
      billingCountry: currentSession.billingCountry,
      region: currentSession.billingCountry === 'IR' ? 'ir' : 'intl',
      currency: 'IRR',
      pricedLines: lines,
      total,
      allowedMethods: unavailable.length > 0 ? [] : ['zarinpal-card', 'stripe-card'],
      unavailableProducts: unavailable,
      sessionId: currentSession.sessionId,
    };
  },

  async getCheckout(_sessionId: string): Promise<CheckoutResponse> {
    if (!currentSession) {
      throw new Error('checkout_expired');
    }

    if (currentSession.status === 'needs_country') {
      return toResponse(currentSession);
    }

    const { items } = await demoCart.getCartWithItems();
    const { lines, total, unavailable } = await buildPricedLines(
      items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    );

    return {
      status: unavailable.length > 0 ? 'unavailable' : 'ready',
      billingCountry: currentSession.billingCountry,
      region: currentSession.billingCountry === 'IR' ? 'ir' : 'intl',
      currency: 'IRR',
      pricedLines: lines,
      total,
      allowedMethods: unavailable.length > 0 ? [] : ['zarinpal-card', 'stripe-card'],
      unavailableProducts: unavailable,
      sessionId: currentSession.sessionId,
    };
  },

  /**
   * Complete the checkout: create an order from the session, return orderId.
   */
  async createOrderFromSession(): Promise<string> {
    if (!currentSession) {
      throw new Error('checkout_expired');
    }

    const { items } = await demoCart.getCartWithItems();
    const { lines } = await buildPricedLines(
      items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    );

    const { order } = demoOrders.createOrder(
      lines.map((l) => ({
        productId: l.product_id,
        productName: l.product_name,
        quantity: l.quantity,
        unitAmountMinor: l.unit_amount_minor,
      })),
      'IRR',
      currentSession.billingCountry ?? 'IR',
    );

    return order.id;
  },

  /**
   * Clear the current session (after order creation or abandonment).
   */
  clearSession(): void {
    currentSession = null;
  },
};
