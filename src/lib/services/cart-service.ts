/*
 * PlanBium cart service (client-side).
 *
 * Cart ownership is checked server-side via RLS.
 * Cart stores product references only — NOT price snapshots.
 * Prices are resolved server-side at checkout.
 */

import { supabase } from '@/lib/supabase-client';
import type { Cart, CartItem } from '@/lib/types';

async function getActiveCart(): Promise<Cart | null> {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data as Cart | null;
}

export const cartService = {
  /** Get or create the user's active cart. */
  async getOrCreateCart(): Promise<Cart> {
    const existing = await getActiveCart();
    if (existing) return existing;
    const { data, error } = await supabase
      .from('carts')
      .insert({ status: 'active' })
      .select()
      .single();
    if (error) throw error;
    return data as Cart;
  },

  /** Get the active cart with its items. */
  async getCartWithItems(): Promise<{ cart: Cart | null; items: CartItem[] }> {
    const cart = await getActiveCart();
    if (!cart) return { cart: null, items: [] };
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { cart, items: (data as CartItem[]) ?? [] };
  },

  /** Add a product to the cart (quantity defaults to 1 for digital planners). */
  async addItem(productId: string, quantity = 1): Promise<CartItem> {
    const cart = await this.getOrCreateCart();
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({ cart_id: cart.id, product_id: productId, quantity }, { onConflict: 'cart_id,product_id' })
      .select()
      .single();
    if (error) throw error;
    return data as CartItem;
  },

  /** Update item quantity. */
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity < 1) {
      await this.removeItem(itemId);
      return;
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
    if (error) throw error;
  },

  /** Remove an item from the cart. */
  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) throw error;
  },

  /** Clear all items from the cart. */
  async clearCart(): Promise<void> {
    const cart = await getActiveCart();
    if (!cart) return;
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (error) throw error;
  },

  /** Abandon the active cart. */
  async abandonCart(): Promise<void> {
    const cart = await getActiveCart();
    if (!cart) return;
    const { error } = await supabase.from('carts').update({ status: 'abandoned' }).eq('id', cart.id);
    if (error) throw error;
  },
};
