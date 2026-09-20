/*
 * PlanBium structured error codes.
 *
 * The frontend translates these codes into user-facing messages.
 * Do not hardcode user-facing English error paragraphs deep inside services.
 */

export type ErrorCode =
  | 'country_not_confirmed'
  | 'method_not_allowed'
  | 'product_unavailable_in_region'
  | 'price_changed'
  | 'provider_unavailable'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'checkout_expired'
  | 'payment_pending'
  | 'payment_failed'
  | 'invalid_payment'
  | 'entitlement_required'
  | 'cart_empty'
  | 'cart_not_found'
  | 'order_not_found'
  | 'order_already_paid'
  | 'order_expired'
  | 'idempotency_conflict'
  | 'validation_error'
  | 'rate_limited'
  | 'region_not_resolved'
  | 'currency_not_supported'
  | 'asset_not_found'
  | 'download_limit_exceeded'
  | 'webhook_signature_invalid'
  | 'webhook_event_duplicate'
  | 'internal_error';

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export function apiError(code: ErrorCode, message: string, details?: Record<string, unknown>): ApiError {
  return { code, message, details };
}
