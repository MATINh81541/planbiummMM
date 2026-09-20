/*
 * PlanBium admin service (client-side).
 *
 * Calls the planbium-admin edge function.
 * Admin authorization is server-enforced — the edge function checks role === 'admin'.
 */

import { supabase } from '@/lib/supabase-client';

async function callAdmin(action: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planbium-admin`;
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
    body: JSON.stringify({ action, ...extra }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'admin_request_failed' }));
    throw new Error(err.error || `Admin request failed (${response.status})`);
  }
  return response.json();
}

export const adminService = {
  listProducts: () => callAdmin('list_products'),
  archiveProduct: (productId: string) => callAdmin('archive_product', { productId }),
  activateProduct: (productId: string) => callAdmin('activate_product', { productId }),
  createProduct: (slug: string, metadata?: Record<string, unknown>) =>
    callAdmin('create_product', { slug, metadata }),
  listOrders: () => callAdmin('list_orders'),
  getOrder: (orderId: string) => callAdmin('get_order', { orderId }),
  listPayments: () => callAdmin('list_payments'),
  listEntitlements: () => callAdmin('list_entitlements'),
  revokeEntitlement: (entitlementId: string) => callAdmin('revoke_entitlement', { entitlementId }),
  listUsers: () => callAdmin('list_users'),
};
