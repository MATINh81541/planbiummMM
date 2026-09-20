/* eslint-disable */
/*
 * PlanBium payment edge function.
 *
 * Server-authoritative payment initiation and verification.
 *
 * The server must be the only place that creates authoritative paid-order state.
 * Flow for initiate:
 *   1. validate authenticated user
 *   2. load checkout session
 *   3. validate product availability
 *   4. resolve confirmed country → region → currency
 *   5. resolve current prices
 *   6. calculate total
 *   7. create order snapshot (idempotent)
 *   8. create payment attempt
 *   9. start provider adapter (redirect/redirectless)
 *
 * Flow for verify (browser return — display only, never authoritative):
 *   The server may perform an idempotent verification/fetch operation.
 *   The return page NEVER directly grants entitlement.
 *
 * Entitlement granting happens ONLY via applyVerifiedPayment(), called from
 * the webhook or this verify path after provider confirmation.
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PaymentRequestBody {
  action: 'initiate' | 'verify';
  sessionId?: string;
  methodId?: string;
  orderId?: string;
}

const LOCALE_FALLBACK = 'en';
const REGION_CURRENCY: Record<string, string> = { ir: 'IRR', eu: 'EUR', intl: 'USD' };
const REGION_METHODS: Record<string, string[]> = {
  ir: ['zarinpal-card'],
  eu: ['stripe-card', 'paypal'],
  intl: ['stripe-card', 'paypal'],
};
const PROVIDER_ADAPTER: Record<string, string> = {
  'zarinpal-card': 'zarinpal',
  'stripe-card': 'stripe',
  paypal: 'paypal',
};

function jsonError(status: number, code: string, message: string, details?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: code, message, details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * applyVerifiedPayment — the single centralized function for the atomic transition:
 *   Payment succeeded → Order paid → Entitlement granted → Receipt/email queued
 *
 * Idempotent: safe to call from webhook, verify, or retry handler.
 */
async function applyVerifiedPayment(
  supabase: ReturnType<typeof createClient>,
  paymentId: string,
  providerReference: string,
  providerMetadata: Record<string, unknown>,
): Promise<{ orderStatus: string; paymentStatus: string }> {
  // Load payment
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();

  if (payErr || !payment) {
    throw new Error('Payment not found');
  }

  // Already succeeded — idempotent return
  if (payment.status === 'succeeded') {
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', payment.order_id)
      .maybeSingle();
    return { orderStatus: order?.status ?? 'pending', paymentStatus: 'succeeded' };
  }

  // Update payment to succeeded
  const { error: updatePayErr } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      provider_reference: providerReference,
      raw_reference_metadata: providerMetadata,
      succeeded_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (updatePayErr) throw updatePayErr;

  // Load order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', payment.order_id)
    .maybeSingle();

  if (orderErr || !order) throw new Error('Order not found');

  // Mark order as paid (only if currently pending)
  if (order.status === 'pending') {
    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending');

    if (updateOrderErr) throw updateOrderErr;
  }

  // Load order items
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  // Grant entitlements (idempotent via unique constraint on user_id+product_id WHERE active)
  for (const item of items ?? []) {
    const { error: entErr } = await supabase
      .from('entitlements')
      .insert({
        user_id: order.user_id,
        product_id: item.product_id,
        order_id: order.id,
        status: 'active',
      })
      .select();

    // Unique constraint violation means entitlement already exists — safe to ignore
    if (entErr && entErr.code !== '23505') throw entErr;
  }

  // Queue receipt email
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_locale')
    .eq('user_id', order.user_id)
    .maybeSingle();

  // Get user email from auth
  const { data: { user } } = await supabase.auth.admin.getUserById(order.user_id);

  if (user?.email) {
    await supabase.from('email_outbox').insert({
      user_id: order.user_id,
      email_type: 'receipt',
      recipient: user.email,
      locale: profile?.preferred_locale ?? LOCALE_FALLBACK,
      payload: { orderId: order.id, total: order.total_amount_minor, currency: order.currency },
      status: 'pending',
    });
  }

  // Mark checkout session as completed
  await supabase
    .from('checkout_sessions')
    .update({ status: 'completed' })
    .eq('user_id', order.user_id)
    .in('status', ['active', 'needs_country']);

  return { orderStatus: 'paid', paymentStatus: 'succeeded' };
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonError(401, 'unauthorized', 'Authentication required');
    }

    const body: PaymentRequestBody = await req.json();
    const { action } = body;

    // ---- ACTION: initiate ----
    if (action === 'initiate') {
      const { sessionId, methodId } = body;
      if (!sessionId) return jsonError(400, 'validation_error', 'sessionId is required');
      if (!methodId) return jsonError(400, 'validation_error', 'methodId is required');

      // Load and verify checkout session
      const { data: session, error: sessionErr } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (sessionErr || !session) {
        return jsonError(404, 'not_found', 'Checkout session not found');
      }

      if (session.status !== 'active' || new Date(session.expires_at) < new Date()) {
        return jsonError(400, 'checkout_expired', 'Checkout session is not active');
      }

      if (!session.billing_country || !session.region_id || !session.currency) {
        return jsonError(400, 'country_not_confirmed', 'Billing country must be confirmed first');
      }

      // Validate method is allowed for region
      const allowedMethods = REGION_METHODS[session.region_id] ?? [];
      if (!allowedMethods.includes(methodId)) {
        return jsonError(400, 'method_not_allowed', 'Payment method not available in this region');
      }

      const provider = PROVIDER_ADAPTER[methodId] ?? methodId;

      // Check provider is configured/enabled
      const providerEnabledKey = `${provider.toUpperCase().replace(/-/g, '_')}_ENABLED`;
      const isProviderEnabled = Deno.env.get(providerEnabledKey) === 'true';
      if (!isProviderEnabled) {
        return jsonError(400, 'provider_unavailable', `Provider ${provider} is not configured`);
      }

      // Re-derive cart and prices (server authority — never trust client)
      const { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!cart) return jsonError(400, 'cart_not_found', 'No active cart found');

      const { data: items } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

      if (!items || items.length === 0) {
        return jsonError(400, 'cart_empty', 'Cart is empty');
      }

      // Verify cart hash matches session
      const currentHash = createHash('sha256')
        .update(items.map((i: any) => `${i.product_id}:${i.quantity}`).sort().join('|'))
        .digest('hex');

      if (session.cart_hash && session.cart_hash !== currentHash) {
        return jsonError(400, 'price_changed', 'Cart contents have changed. Please restart checkout.');
      }

      // Resolve prices and build order items
      const orderItems: any[] = [];
      let total = 0;
      const unavailableProducts: string[] = [];

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .eq('status', 'active')
          .maybeSingle();

        if (!product) {
          unavailableProducts.push(item.product_id);
          continue;
        }

        const { data: price } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', item.product_id)
          .eq('currency', session.currency)
          .eq('active', true)
          .maybeSingle();

        if (!price) {
          unavailableProducts.push(item.product_id);
          continue;
        }

        const { data: translation } = await supabase
          .from('product_translations')
          .select('name')
          .eq('product_id', item.product_id)
          .eq('locale', LOCALE_FALLBACK)
          .maybeSingle();

        const lineTotal = price.amount_minor * item.quantity;
        total += lineTotal;

        orderItems.push({
          product_id: item.product_id,
          product_name_snapshot: translation?.name ?? product.slug,
          quantity: item.quantity,
          unit_amount_minor: price.amount_minor,
          total_amount_minor: lineTotal,
          currency: session.currency,
        });
      }

      if (orderItems.length === 0) {
        return jsonError(400, 'product_unavailable_in_region', 'No products available in this region');
      }

      // Compute geo mismatch
      const observedIpCountry = session.observed_ip_country;
      const geoMismatch = observedIpCountry && session.billing_country
        ? observedIpCountry.toUpperCase() !== session.billing_country.toUpperCase()
        : false;

      // Idempotency key: session + cart hash + method (prevents duplicate orders)
      const idempotencyKey = createHash('sha256')
        .update(`${session.id}:${currentHash}:${methodId}`)
        .digest('hex');

      // Check for existing order with this idempotency key
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      let orderId: string;

      if (existingOrder) {
        orderId = existingOrder.id;
        // If order already paid, don't create new payment
        if (existingOrder.status === 'paid') {
          return jsonError(400, 'order_already_paid', 'Order has already been paid');
        }
      } else {
        // Create order
        const { data: newOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            status: 'pending',
            billing_country: session.billing_country,
            payment_region_id: session.region_id,
            observed_ip_country: observedIpCountry,
            geo_mismatch: geoMismatch,
            currency: session.currency,
            total_amount_minor: total,
            idempotency_key: idempotencyKey,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (orderErr) {
          if (orderErr.code === '23505') {
            // Another concurrent request created the same order — load it
            const { data: concurrent } = await supabase
              .from('orders')
              .select('id')
              .eq('idempotency_key', idempotencyKey)
              .maybeSingle();
            orderId = concurrent!.id;
          } else {
            return jsonError(500, 'internal_error', 'Failed to create order');
          }
        } else {
          orderId = newOrder.id;
        }

        // Create order items
        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItems.map((oi) => ({ ...oi, order_id: orderId })));

        if (itemsErr) return jsonError(500, 'internal_error', 'Failed to create order items');
      }

      // Create payment attempt
      const { data: payment, error: payErr } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          provider,
          method: methodId,
          status: 'initiated',
          amount_minor: total,
          currency: session.currency,
        })
        .select()
        .single();

      if (payErr) return jsonError(500, 'internal_error', 'Failed to create payment');

      // Start provider adapter — architecture supports redirect model
      // For Zarinpal: create authority and return redirect URL
      // For now, return the payment reference; actual provider call happens when configured
      const redirectUrl = null; // Will be set by provider adapter when credentials exist

      return new Response(JSON.stringify({
        orderId,
        paymentId: payment.id,
        provider,
        redirectUrl,
        status: 'initiated',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ---- ACTION: verify (browser return — display only) ----
    if (action === 'verify') {
      const { orderId } = body;
      if (!orderId) return jsonError(400, 'validation_error', 'orderId is required');

      // Load order with ownership check
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (orderErr || !order) {
        return jsonError(404, 'order_not_found', 'Order not found');
      }

      // Load latest payment
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!payment) {
        return new Response(JSON.stringify({ orderStatus: order.status, paymentStatus: 'none' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If payment already succeeded, return current state (idempotent)
      if (payment.status === 'succeeded') {
        return new Response(JSON.stringify({ orderStatus: order.status, paymentStatus: 'succeeded' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If payment is initiated/processing, the browser return page is display-only.
      // The webhook is the authoritative path. If no webhook has arrived yet,
      // we may perform an idempotent server-side verification with the provider.
      // For now, return current status — do NOT grant entitlement here.
      return new Response(JSON.stringify({
        orderStatus: order.status,
        paymentStatus: payment.status,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return jsonError(400, 'validation_error', `Unknown action: ${action}`);
  } catch (err) {
    return jsonError(500, 'internal_error', err.message || 'Unexpected error');
  }
});
