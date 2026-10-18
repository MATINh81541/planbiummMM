/*
 * PlanBium admin service — temporary demo mode.
 *
 * Supabase and the admin edge function have been removed. All admin
 * operations throw a clear "backend_unavailable" error. Admin pages catch
 * these and render empty tables (their existing error/empty handling).
 * Reimplement against the custom backend when ready.
 */

async function callAdmin(_action: string, _extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  throw new Error('backend_unavailable');
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
