/*
 * PlanBium shared domain types.
 *
 * These types mirror the database schema and are used by both client and server code.
 * They serve as the typed contracts that later prompts consume.
 */

export type ProductStatus = 'draft' | 'active' | 'archived';

export type CartStatus = 'active' | 'abandoned';

export type CheckoutSessionStatus = 'active' | 'needs_country' | 'expired' | 'completed' | 'cancelled';

export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled' | 'expired';

export type PaymentStatus =
  | 'initiated'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'expired'
  | 'refunded'
  | 'disputed';

export type PaymentEventProcessingStatus = 'pending' | 'processed' | 'failed' | 'duplicate';

export type EntitlementStatus = 'active' | 'revoked';

export type RefundStatus = 'pending' | 'completed' | 'failed';

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed';

export type UserRole = 'user' | 'admin';

export type AssetType = 'planner' | 'preview' | 'thumbnail' | 'extra';

// ---- Row types (mirror database columns) ----

export interface Profile {
  user_id: string;
  display_name: string | null;
  preferred_locale: string | null;
  billing_country: string | null;
  dashboard_theme: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  status: ProductStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  product_id: string;
  currency: string;
  amount_minor: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  locale: string;
  name: string;
  tagline: string | null;
  description: string | null;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductAsset {
  id: string;
  product_id: string;
  storage_path: string;
  asset_type: AssetType;
  version: string;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  status: CartStatus;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSession {
  id: string;
  user_id: string;
  cart_hash: string | null;
  billing_country: string | null;
  region_id: string | null;
  observed_ip_country: string | null;
  currency: string | null;
  status: CheckoutSessionStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  billing_country: string | null;
  payment_region_id: string | null;
  observed_ip_country: string | null;
  geo_mismatch: boolean;
  currency: string;
  total_amount_minor: number;
  idempotency_key: string;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_amount_minor: number;
  total_amount_minor: number;
  currency: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  provider_reference: string | null;
  status: PaymentStatus;
  amount_minor: number;
  currency: string;
  raw_reference_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  succeeded_at: string | null;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  external_event_id: string | null;
  payment_id: string | null;
  order_id: string | null;
  event_type: string;
  payload_hash: string | null;
  received_at: string;
  processed_at: string | null;
  processing_status: PaymentEventProcessingStatus;
  metadata: Record<string, unknown>;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  status: EntitlementStatus;
  granted_at: string;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
}

export interface DownloadLog {
  id: string;
  user_id: string;
  entitlement_id: string;
  asset_id: string;
  ip_hash: string | null;
  user_agent_summary: string | null;
  created_at: string;
}

export interface Refund {
  id: string;
  order_id: string;
  payment_id: string;
  amount_minor: number;
  currency: string;
  reason: string | null;
  status: RefundStatus;
  provider_reference: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface EmailOutbox {
  id: string;
  user_id: string | null;
  email_type: string;
  recipient: string;
  locale: string | null;
  payload: Record<string, unknown>;
  status: EmailStatus;
  attempts: number;
  last_error: string | null;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
}

// ---- Checkout contract types ----

export interface PricedLine {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_amount_minor: number;
  total_amount_minor: number;
  currency: string;
}

export type CheckoutStatus = 'ready' | 'needs_country' | 'expired' | 'unavailable';

export interface CheckoutResponse {
  status: CheckoutStatus;
  billingCountry: string | null;
  region: string | null;
  currency: string | null;
  pricedLines: PricedLine[];
  total: number | null;
  allowedMethods: string[];
  unavailableProducts: string[];
  sessionId?: string;
}
