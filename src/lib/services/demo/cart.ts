/*
 * Demo cart adapter.
 *
 * Cart state persists in localStorage. Prevents adding products
 * the user already owns (checks demo entitlements).
 */

import type { Cart, CartItem } from '@/lib/types';
import { demoGet, demoSet, demoId, DEMO_USER_ID } from './shared';
import { demoEntitlements } from './entitlements';

const CART_KEY = 'cart';
const ITEMS_KEY = 'cart_items';

interface CartState {
  cart: Cart;
  items: CartItem[];
}

function loadCartState(): CartState {
  const existing = demoGet<CartState['cart'] | null>(CART_KEY, null);
  if (existing) {
    const items = demoGet<CartItem[]>(ITEMS_KEY, []);
    return { cart: existing, items };
  }
  const cart: Cart = {
    id: demoId('cart'),
    user_id: DEMO_USER_ID,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  demoSet(CART_KEY, cart);
  demoSet(ITEMS_KEY, []);
  return { cart, items: [] };
}

function saveItems(items: CartItem[]): void {
  demoSet(ITEMS_KEY, items);
}

export const demoCart = {
  async getOrCreateCart(): Promise<Cart> {
    return loadCartState().cart;
  },

  async getCartWithItems(): Promise<{ cart: Cart | null; items: CartItem[] }> {
    const state = loadCartState();
    return { cart: state.cart, items: state.items };
  },

  async addItem(productId: string, quantity = 1): Promise<CartItem> {
    const state = loadCartState();

    const owned = await demoEntitlements.hasEntitlement(productId);
    if (owned) {
      throw new Error('already_owned');
    }

    const existing = state.items.find((i) => i.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.updated_at = new Date().toISOString();
      saveItems(state.items);
      return existing;
    }

    const item: CartItem = {
      id: demoId('ci'),
      cart_id: state.cart.id,
      product_id: productId,
      quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.items.push(item);
    saveItems(state.items);
    return item;
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    const state = loadCartState();
    const item = state.items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      item.updated_at = new Date().toISOString();
      saveItems(state.items);
    }
  },

  async removeItem(itemId: string): Promise<void> {
    const state = loadCartState();
    saveItems(state.items.filter((i) => i.id !== itemId));
  },

  async clearCart(): Promise<void> {
    saveItems([]);
  },

  async abandonCart(): Promise<void> {
    saveItems([]);
  },
};
