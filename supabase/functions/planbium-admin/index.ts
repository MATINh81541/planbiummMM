/*
 * PlanBium admin edge function.
 *
 * Server-enforced admin authorization for commerce operations.
 * Checks authentication + role === 'admin' on every request.
 *
 * Actions:
 *   list_products, archive_product, activate_product
 *   list_orders, get_order
 *   list_payments
 *   list_entitlements, revoke_entitlement
 *   list_users
 *   create_product, update_product
 *   create_price, update_price
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkAdmin(supabase: ReturnType<typeof createClient>, token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { user: null, isAdmin: false };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  return { user, isAdmin: profile?.role === 'admin' };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { user, isAdmin } = await checkAdmin(supabase, token);

    if (!user) return jsonError(401, 'unauthorized', 'Authentication required');
    if (!isAdmin) return jsonError(403, 'forbidden', 'Admin access required');

    const body = await req.json();
    const { action } = body;

    // ---- PRODUCTS ----
    if (action === 'list_products') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return jsonError(500, 'internal_error', 'Failed to load products');
      return jsonResponse({ products: data });
    }

    if (action === 'archive_product') {
      const { productId } = body;
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) return jsonError(500, 'internal_error', 'Failed to archive product');
      return jsonResponse({ success: true });
    }

    if (action === 'activate_product') {
      const { productId } = body;
      const { error } = await supabase
        .from('products')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) return jsonError(500, 'internal_error', 'Failed to activate product');
      return jsonResponse({ success: true });
    }

    if (action === 'create_product') {
      const { slug, metadata } = body;
      if (!slug) return jsonError(400, 'validation_error', 'slug is required');
      const { data, error } = await supabase
        .from('products')
        .insert({ slug, status: 'draft', metadata: metadata ?? {} })
        .select()
        .single();
      if (error) return jsonError(500, 'internal_error', 'Failed to create product');
      return jsonResponse({ product: data });
    }

    // ---- ORDERS ----
    if (action === 'list_orders') {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) return jsonError(500, 'internal_error', 'Failed to load orders');
      return jsonResponse({ orders: data });
    }

    if (action === 'get_order') {
      const { orderId } = body;
      const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      const { data: payments } = await supabase.from('payments').select('*').eq('order_id', orderId);
      const { data: entitlements } = await supabase.from('entitlements').select('*').eq('order_id', orderId);
      return jsonResponse({ order, items: items ?? [], payments: payments ?? [], entitlements: entitlements ?? [] });
    }

    // ---- PAYMENTS ----
    if (action === 'list_payments') {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) return jsonError(500, 'internal_error', 'Failed to load payments');
      return jsonResponse({ payments: data });
    }

    // ---- ENTITLEMENTS ----
    if (action === 'list_entitlements') {
      const { data, error } = await supabase
        .from('entitlements')
        .select('*')
        .order('granted_at', { ascending: false })
        .limit(100);
      if (error) return jsonError(500, 'internal_error', 'Failed to load entitlements');
      return jsonResponse({ entitlements: data });
    }

    if (action === 'revoke_entitlement') {
      const { entitlementId } = body;
      const { error } = await supabase
        .from('entitlements')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', entitlementId);
      if (error) return jsonError(500, 'internal_error', 'Failed to revoke entitlement');
      return jsonResponse({ success: true });
    }

    // ---- USERS ----
    if (action === 'list_users') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) return jsonError(500, 'internal_error', 'Failed to load users');
      return jsonResponse({ users: data });
    }

    return jsonError(400, 'validation_error', `Unknown action: ${action}`);
  } catch (err) {
    return jsonError(500, 'internal_error', err.message || 'Unexpected error');
  }
});
