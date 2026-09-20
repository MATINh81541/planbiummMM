/* eslint-disable */
/*
 * PlanBium checkout edge function.
 *
 * Server-authoritative checkout: re-derives cart contents, product availability,
 * prices, currency, and allowed payment methods. The client never sends prices,
 * currency, or totals — only billing country and session references.
 *
 * Actions:
 *   create         — create a new checkout session from the user's active cart
 *   confirm_country — set billing country on a session and resolve region/currency
 *   get            — get current checkout state
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheckoutRequestBody {
  action: 'create' | 'confirm_country' | 'get';
  sessionId?: string;
  billingCountry?: string;
}

const VALID_COUNTRY_RE = /^[A-Z]{2}$/;

// Inline minimal config (edge functions cannot share code with the frontend)
const LOCALE_FALLBACK = 'en';
const COUNTRY_TO_REGION: Record<string, { locale: string; region: string }> = {
  IR: { locale: 'fa', region: 'ir' },
  NL: { locale: 'nl', region: 'eu' },
  ES: { locale: 'es', region: 'eu' },
  CN: { locale: 'zh-Hans', region: 'intl' },
  US: { locale: 'en', region: 'intl' },
  GB: { locale: 'en', region: 'eu' },
};
const FALLBACK_REGION = 'intl';

const REGION_CURRENCY: Record<string, string> = {
  ir: 'IRR',
  eu: 'EUR',
  intl: 'USD',
};

const REGION_METHODS: Record<string, string[]> = {
  ir: ['zarinpal-card'],
  eu: ['stripe-card', 'paypal'],
  intl: ['stripe-card', 'paypal'],
};

function resolveRegion(country: string | null): string {
  if (!country) return FALLBACK_REGION;
  return COUNTRY_TO_REGION[country]?.region ?? FALLBACK_REGION;
}

function resolveCurrency(region: string): string {
  return REGION_CURRENCY[region] ?? 'USD';
}

function resolveMethods(region: string, _currency: string): string[] {
  return REGION_METHODS[region] ?? [];
}

function jsonError(status: number, code: string, message: string, details?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: code, message, details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

    // Extract user from JWT
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonError(401, 'unauthorized', 'Authentication required');
    }

    const body: CheckoutRequestBody = await req.json();
    const { action } = body;

    // Get observed IP country from trusted header (e.g. CF-IPCountry)
    const observedIpCountry = req.headers.get('CF-IPCountry')
      ?? req.headers.get('X-IPCountry')
      ?? null;

    // ---- ACTION: create ----
    if (action === 'create') {
      // Load user's active cart
      const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (cartErr) return jsonError(500, 'internal_error', 'Failed to load cart');
      if (!cart) return jsonError(400, 'cart_not_found', 'No active cart found');

      // Load cart items
      const { data: items, error: itemsErr } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

      if (itemsErr) return jsonError(500, 'internal_error', 'Failed to load cart items');
      if (!items || items.length === 0) {
        return jsonError(400, 'cart_empty', 'Cart is empty');
      }

      // Compute cart hash for tamper detection
      const cartHash = createHash('sha256')
        .update(items.map((i: any) => `${i.product_id}:${i.quantity}`).sort().join('|'))
        .digest('hex');

      // Create checkout session
      const { data: session, error: sessionErr } = await supabase
        .from('checkout_sessions')
        .insert({
          user_id: user.id,
          cart_hash: cartHash,
          observed_ip_country: observedIpCountry,
          status: 'needs_country',
        })
        .select()
        .single();

      if (sessionErr) return jsonError(500, 'internal_error', 'Failed to create checkout session');

      return new Response(JSON.stringify({
        status: 'needs_country',
        billingCountry: null,
        region: null,
        currency: null,
        pricedLines: [],
        total: null,
        allowedMethods: [],
        unavailableProducts: [],
        sessionId: session.id,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ---- ACTION: confirm_country ----
    if (action === 'confirm_country') {
      const { sessionId, billingCountry } = body;
      if (!sessionId) return jsonError(400, 'validation_error', 'sessionId is required');
      if (!billingCountry || !VALID_COUNTRY_RE.test(billingCountry)) {
        return jsonError(400, 'validation_error', 'Valid billingCountry (ISO 3166-1 alpha-2) is required');
      }

      // Load and verify checkout session ownership
      const { data: session, error: sessionErr } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (sessionErr || !session) {
        return jsonError(404, 'not_found', 'Checkout session not found');
      }

      if (session.status === 'expired' || new Date(session.expires_at) < new Date()) {
        return jsonError(400, 'checkout_expired', 'Checkout session has expired');
      }

      // Resolve region and currency from billing country
      const region = resolveRegion(billingCountry);
      const currency = resolveCurrency(region);
      const methods = resolveMethods(region, currency);

      // Re-derive cart contents and prices server-side
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

      // Verify cart hash (tamper detection)
      const currentHash = createHash('sha256')
        .update(items.map((i: any) => `${i.product_id}:${i.quantity}`).sort().join('|'))
        .digest('hex');

      if (session.cart_hash && session.cart_hash !== currentHash) {
        // Cart changed since session creation — update hash
        await supabase.from('checkout_sessions').update({ cart_hash: currentHash }).eq('id', session.id);
      }

      // Resolve prices and availability for each item
      const pricedLines: any[] = [];
      const unavailableProducts: string[] = [];
      let total = 0;

      for (const item of items) {
        // Check product is active
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

        // Get active price in target currency
        const { data: price } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', item.product_id)
          .eq('currency', currency)
          .eq('active', true)
          .maybeSingle();

        if (!price) {
          unavailableProducts.push(item.product_id);
          continue;
        }

        // Get product name snapshot (English fallback)
        const { data: translation } = await supabase
          .from('product_translations')
          .select('name')
          .eq('product_id', item.product_id)
          .in('locale', [LOCALE_FALLBACK])
          .maybeSingle();

        const lineTotal = price.amount_minor * item.quantity;
        total += lineTotal;

        pricedLines.push({
          product_id: item.product_id,
          product_name: translation?.name ?? product.slug,
          quantity: item.quantity,
          unit_amount_minor: price.amount_minor,
          total_amount_minor: lineTotal,
          currency,
        });
      }

      // Update checkout session
      await supabase.from('checkout_sessions').update({
        billing_country: billingCountry,
        region_id: region,
        currency,
        status: pricedLines.length > 0 ? 'active' : 'needs_country',
      }).eq('id', session.id);

      const status = unavailableProducts.length > 0 && pricedLines.length === 0
        ? 'unavailable'
        : 'ready';

      return new Response(JSON.stringify({
        status,
        billingCountry,
        region,
        currency,
        pricedLines,
        total: pricedLines.length > 0 ? total : null,
        allowedMethods: methods,
        unavailableProducts,
        sessionId: session.id,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ---- ACTION: get ----
    if (action === 'get') {
      const { sessionId } = body;
      if (!sessionId) return jsonError(400, 'validation_error', 'sessionId is required');

      const { data: session, error: sessionErr } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (sessionErr || !session) {
        return jsonError(404, 'not_found', 'Checkout session not found');
      }

      if (new Date(session.expires_at) < new Date() && session.status === 'active') {
        await supabase.from('checkout_sessions').update({ status: 'expired' }).eq('id', session.id);
        return jsonError(400, 'checkout_expired', 'Checkout session has expired');
      }

      return new Response(JSON.stringify({
        status: session.status === 'needs_country' ? 'needs_country' : session.status,
        billingCountry: session.billing_country,
        region: session.region_id,
        currency: session.currency,
        pricedLines: [],
        total: null,
        allowedMethods: session.region_id ? resolveMethods(session.region_id, session.currency ?? 'USD') : [],
        unavailableProducts: [],
        sessionId: session.id,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return jsonError(400, 'validation_error', `Unknown action: ${action}`);
  } catch (err) {
    return jsonError(500, 'internal_error', err.message || 'Unexpected error');
  }
});
