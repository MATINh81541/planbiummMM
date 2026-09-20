/*
 * PlanBium entitlement & download service (client-side).
 *
 * Entitlements are the authoritative source for protected download access.
 * The actual signed-URL generation happens server-side via the download edge function.
 * The client never receives permanent public URLs.
 */

import { supabase } from '@/lib/supabase-client';
import type { Entitlement, Order, OrderItem, Payment } from '@/lib/types';

export const entitlementService = {
  /** List the user's active entitlements. */
  async listEntitlements(): Promise<Entitlement[]> {
    const { data, error } = await supabase
      .from('entitlements')
      .select('*')
      .eq('status', 'active')
      .order('granted_at', { ascending: false });
    if (error) throw error;
    return (data as Entitlement[]) ?? [];
  },

  /** Check if the user has an active entitlement for a product. */
  async hasEntitlement(productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('entitlements')
      .select('id')
      .eq('product_id', productId)
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },
};

export const orderService = {
  /** List the user's orders. */
  async listOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Order[]) ?? [];
  },

  /** Get a specific order with its items (ownership checked via RLS). */
  async getOrder(orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) return { order: null, items: [] };
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (itemsErr) throw itemsErr;
    return { order: order as Order, items: (items as OrderItem[]) ?? [] };
  },

  /** Get payments for an order (ownership checked via RLS). */
  async getPayments(orderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Payment[]) ?? [];
  },
};

/**
 * Request a short-lived download URL from the download edge function.
 * The edge function verifies entitlement, logs the download, and returns a signed URL.
 */
export async function requestDownloadUrl(assetId: string): Promise<{ url: string; expiresAt: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planbium-download`;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assetId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'download_failed' }));
    throw new Error(err.error || `Download request failed (${response.status})`);
  }
  const result = await response.json();
  if (!result.url || !result.expiresAt) {
    throw new Error('Invalid download response');
  }
  return { url: result.url, expiresAt: result.expiresAt };
}
