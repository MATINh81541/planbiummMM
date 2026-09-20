/*
 * PlanBium download edge function.
 *
 * Secure server download service:
 *   authenticated user → entitlement check → product/asset check → download log → short-lived signed URL
 *
 * Files remain private. No permanent public URLs. Signed URL expiry ~3 minutes.
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SIGNED_URL_EXPIRY = 180; // 3 minutes
const BUCKET_NAME = 'product-assets';

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: code, message }), {
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

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonError(401, 'unauthorized', 'Authentication required');
    }

    const body = await req.json();
    const { assetId } = body;

    if (!assetId || typeof assetId !== 'string') {
      return jsonError(400, 'validation_error', 'assetId is required');
    }

    // Load asset
    const { data: asset, error: assetErr } = await supabase
      .from('product_assets')
      .select('*')
      .eq('id', assetId)
      .eq('active', true)
      .maybeSingle();

    if (assetErr || !asset) {
      return jsonError(404, 'asset_not_found', 'Asset not found or inactive');
    }

    // Check entitlement — the authoritative source for protected download access
    const { data: entitlement, error: entErr } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', asset.product_id)
      .eq('status', 'active')
      .maybeSingle();

    if (entErr || !entitlement) {
      return jsonError(403, 'entitlement_required', 'You do not have access to this product');
    }

    // Log the download (privacy-conscious: hash IP, summarize UA)
    const clientIp = req.headers.get('CF-Connecting-IP')
      ?? req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
      ?? null;
    const ipHash = clientIp ? createHash('sha256').update(clientIp).digest('hex') : null;
    const userAgent = req.headers.get('User-Agent') ?? '';
    const userAgentSummary = userAgent.length > 200 ? userAgent.substring(0, 200) : userAgent;

    await supabase.from('download_log').insert({
      user_id: user.id,
      entitlement_id: entitlement.id,
      asset_id: asset.id,
      ip_hash: ipHash,
      user_agent_summary: userAgentSummary,
    });

    // Generate short-lived signed URL
    const { data: signedUrlData, error: signedUrlErr } = await supabase
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(asset.storage_path, SIGNED_URL_EXPIRY);

    if (signedUrlErr || !signedUrlData) {
      return jsonError(500, 'internal_error', 'Failed to generate download URL');
    }

    return new Response(JSON.stringify({
      url: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return jsonError(500, 'internal_error', err.message || 'Unexpected error');
  }
});
