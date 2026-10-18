/*
 * PlanBium cart service — temporary demo mode.
 *
 * Supabase has been removed. The cart service exposes the same interface but
 * returns empty cart state. Mutations throw a clear "backend unavailable"
 * error rather than pretending to succeed — no fake cart items, no fake
 * persistence. Reimplement against the custom backend when ready.
 */

import type { Cart, CartItem } from '@/lib/types';

export const cartService = {
  /** Get or create the user's active cart. Unavailable in demo mode. */
  async getOrCreateCart(): Promise<Cart> {
    throw new Error('backend_unavailable');
  },

  /** Get the active cart with its items. Empty in demo mode. */
  async getCartWithItems(): Promise<{ cart: Cart | null; items: CartItem[] }> {
    return { cart: null, items: [] };
  },

  /** Add a product to the cart. Unavailable in demo mode. */
  async addItem(_productId: string, _quantity = 1): Promise<CartItem> {
    throw new Error('backend_unavailable');
  },

  /** Update item quantity. Unavailable in demo mode. */
  async updateItemQuantity(_itemId: string, _quantity: number): Promise<void> {
    throw new Error('backend_unavailable');
  },

  /** Remove an item from the cart. Unavailable in demo mode. */
  async removeItem(_itemId: string): Promise<void> {
    throw new Error('backend_unavailable');
  },

  /** Clear all items from the cart. Unavailable in demo mode. */
  async clearCart(): Promise<void> {
    throw new Error('backend_unavailable');
  },

  /** Abandon the active cart. Unavailable in demo mode. */
  async abandonCart(): Promise<void> {
    throw new Error('backend_unavailable');
  },
};
