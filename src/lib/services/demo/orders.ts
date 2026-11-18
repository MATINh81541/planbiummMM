/*
 * Demo orders adapter.
 *
 * Orders and their items persist in localStorage. listOrders
 * returns orders with their items in the same call (no per-order
 * extra queries needed by the page).
 */

import type { Order, OrderItem, Payment } from '@/lib/types';
import { demoGet, demoSet, demoId, DEMO_USER_ID } from './shared';

const ORDERS_KEY = 'orders';
const ORDER_ITEMS_KEY = 'order_items';
const PAYMENTS_KEY = 'payments';

interface OrderStore {
  orders: Order[];
  itemsByOrder: Record<string, OrderItem[]>;
}

function loadStore(): OrderStore {
  const orders = demoGet<Order[]>(ORDERS_KEY, []);
  const itemsByOrder = demoGet<Record<string, OrderItem[]>>(ORDER_ITEMS_KEY, {});
  return { orders, itemsByOrder };
}

function saveStore(store: OrderStore): void {
  demoSet(ORDERS_KEY, store.orders);
  demoSet(ORDER_ITEMS_KEY, store.itemsByOrder);
}

function loadPayments(): Payment[] {
  return demoGet<Payment[]>(PAYMENTS_KEY, []);
}

function savePayments(payments: Payment[]): void {
  demoSet(PAYMENTS_KEY, payments);
}

export const demoOrders = {
  async listOrders(): Promise<Order[]> {
    const store = loadStore();
    return [...store.orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getOrder(orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId) ?? null;
    const items = orderId in store.itemsByOrder ? store.itemsByOrder[orderId] : [];
    return { order, items };
  },

  async getPayments(orderId: string): Promise<Payment[]> {
    return loadPayments().filter((p) => p.order_id === orderId);
  },

  /**
   * Create a pending order from cart items.
   * Returns the order and its items.
   */
  createOrder(
    items: { productId: string; productName: string; quantity: number; unitAmountMinor: number }[],
    currency: string,
    billingCountry: string,
  ): { order: Order; orderItems: OrderItem[] } {
    const orderId = demoId('ord');
    const total = items.reduce((sum, i) => sum + i.unitAmountMinor * i.quantity, 0);
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      user_id: DEMO_USER_ID,
      status: 'pending',
      billing_country: billingCountry,
      payment_region_id: 'ir',
      observed_ip_country: billingCountry,
      geo_mismatch: false,
      currency,
      total_amount_minor: total,
      idempotency_key: demoId('idem'),
      paid_at: null,
      expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      created_at: now,
      updated_at: now,
    };

    const orderItems: OrderItem[] = items.map((i) => ({
      id: demoId('oi'),
      order_id: orderId,
      product_id: i.productId,
      product_name_snapshot: i.productName,
      quantity: i.quantity,
      unit_amount_minor: i.unitAmountMinor,
      total_amount_minor: i.unitAmountMinor * i.quantity,
      currency,
      created_at: now,
    }));

    const store = loadStore();
    store.orders.push(order);
    store.itemsByOrder[orderId] = orderItems;
    saveStore(store);

    return { order, orderItems };
  },

  /**
   * Mark an order as paid, record a payment, and return the updated order.
   */
  markOrderPaid(orderId: string, method: string): Order | null {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = 'paid';
    order.paid_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    saveStore(store);

    const payment: Payment = {
      id: demoId('pay'),
      order_id: orderId,
      provider: method.startsWith('zarinpal') ? 'zarinpal' : method.startsWith('stripe') ? 'stripe' : 'paypal',
      method,
      provider_reference: demoId('ref'),
      status: 'succeeded',
      amount_minor: order.total_amount_minor,
      currency: order.currency,
      raw_reference_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      succeeded_at: new Date().toISOString(),
    };
    const payments = loadPayments();
    payments.push(payment);
    savePayments(payments);

    return order;
  },

  /**
   * Get the product IDs for an order (used to grant entitlements).
   */
  async getOrderProductIds(orderId: string): Promise<string[]> {
    const store = loadStore();
    const items = store.itemsByOrder[orderId] ?? [];
    return items.map((i) => i.product_id);
  },
};
