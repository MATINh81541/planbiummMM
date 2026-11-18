/*
 * PlanBium cart service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo cart adapter
 * (localStorage-backed). When "false", keeps the existing throw-on-use
 * behavior for a real backend to replace.
 */

import type { Cart, CartItem } from '@/lib/types';
import { appConfig } from '@/lib/config/env';
import { demoCart } from './demo/cart';

const emptyService = {
  async getOrCreateCart(): Promise<Cart> {
    throw new Error('backend_unavailable');
  },
  async getCartWithItems(): Promise<{ cart: Cart | null; items: CartItem[] }> {
    return { cart: null, items: [] };
  },
  async addItem(_productId: string, _quantity = 1): Promise<CartItem> {
    throw new Error('backend_unavailable');
  },
  async updateItemQuantity(_itemId: string, _quantity: number): Promise<void> {
    throw new Error('backend_unavailable');
  },
  async removeItem(_itemId: string): Promise<void> {
    throw new Error('backend_unavailable');
  },
  async clearCart(): Promise<void> {
    throw new Error('backend_unavailable');
  },
  async abandonCart(): Promise<void> {
    throw new Error('backend_unavailable');
  },
};

export const cartService = appConfig.isDemo ? demoCart : emptyService;
