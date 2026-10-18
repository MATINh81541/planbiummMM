/*
 * PlanBium entitlement & download service — temporary demo mode.
 *
 * Supabase has been removed. Entitlements/orders return empty lists and
 * download URL requests throw a clear "backend unavailable" error. No fake
 * entitlements or downloads are produced. Reimplement against the custom
 * backend when ready.
 */

import type { Entitlement, Order, OrderItem, Payment } from '@/lib/types';

export const entitlementService = {
  /** List the user's active entitlements. Empty in demo mode. */
  async listEntitlements(): Promise<Entitlement[]> {
    return [];
  },

  /** Check if the user has an active entitlement for a product. Never in demo mode. */
  async hasEntitlement(_productId: string): Promise<boolean> {
    return false;
  },
};

export const orderService = {
  /** List the user's orders. Empty in demo mode. */
  async listOrders(): Promise<Order[]> {
    return [];
  },

  /** Get a specific order with its items. None in demo mode. */
  async getOrder(_orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
    return { order: null, items: [] };
  },

  /** Get payments for an order. Empty in demo mode. */
  async getPayments(_orderId: string): Promise<Payment[]> {
    return [];
  },
};

/**
 * Request a short-lived download URL. Unavailable in demo mode — the backend
 * that verifies entitlement and mints signed URLs has been removed.
 */
export async function requestDownloadUrl(_assetId: string): Promise<{ url: string; expiresAt: string }> {
  throw new Error('backend_unavailable');
}
