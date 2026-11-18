/*
 * PlanBium entitlement & download service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo adapter
 * (localStorage-backed entitlements, generated download URLs).
 * When "false", keeps the existing empty/throw behavior.
 */

import type { Entitlement, Order, OrderItem, Payment } from '@/lib/types';
import { appConfig } from '@/lib/config/env';
import { demoEntitlements, generateDownloadUrl } from './demo/entitlements';
import { demoOrders } from './demo/orders';

const emptyEntitlementService = {
  async listEntitlements(): Promise<Entitlement[]> {
    return [];
  },
  async hasEntitlement(_productId: string): Promise<boolean> {
    return false;
  },
};

const emptyOrderService = {
  async listOrders(): Promise<Order[]> {
    return [];
  },
  async getOrder(_orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
    return { order: null, items: [] };
  },
  async getPayments(_orderId: string): Promise<Payment[]> {
    return [];
  },
};

async function emptyRequestDownloadUrl(_assetId: string): Promise<{ url: string; expiresAt: string }> {
  throw new Error('backend_unavailable');
}

export const entitlementService = appConfig.isDemo ? demoEntitlements : emptyEntitlementService;
export const orderService = appConfig.isDemo ? demoOrders : emptyOrderService;

export async function requestDownloadUrl(entitlementId: string): Promise<{ url: string; expiresAt: string }> {
  if (appConfig.isDemo) {
    return generateDownloadUrl(entitlementId);
  }
  return emptyRequestDownloadUrl(entitlementId);
}
