/*
# PlanBium: orders, order_items, payments, payment_events

## Purpose
Establishes the authoritative order, payment-attempt, and payment-event tables.
An Order is the purchase transaction; a Payment is a specific attempt to pay it.
An Order becomes "paid" ONLY when a verified successful Payment exists — never
from a browser redirect.

## New Tables

### orders
- `id` (uuid, pk).
- `user_id` (uuid, fk -> auth.users).
- `status` (text) — 'pending','paid','refunded','cancelled','expired'.
- `billing_country` (text) — explicitly confirmed billing country.
- `payment_region_id` (text) — resolved payment region.
- `observed_ip_country` (text) — server-detected IP country hint.
- `geo_mismatch` (boolean) — true when observed != billing.
- `currency` (text).
- `total_amount_minor` (integer) — server-calculated total.
- `idempotency_key` (text, unique) — prevents duplicate order creation.
- `paid_at`, `expires_at`, `created_at`, `updated_at`.

### order_items
- `id` (uuid, pk).
- `order_id` (uuid, fk -> orders).
- `product_id` (uuid, fk -> products).
- `product_name_snapshot` (text) — name at time of purchase.
- `quantity` (integer).
- `unit_amount_minor` (integer) — snapshot price per unit.
- `total_amount_minor` (integer) — snapshot line total.
- `currency` (text).
- `created_at`.

### payments
- `id` (uuid, pk).
- `order_id` (uuid, fk -> orders).
- `provider` (text) — 'zarinpal' etc.
- `method` (text).
- `provider_reference` (text) — provider's transaction/authority reference.
- `status` (text) — 'initiated','processing','succeeded','failed','canceled','expired','refunded','disputed'.
- `amount_minor` (integer).
- `currency` (text).
- `raw_reference_metadata` (jsonb) — safe provider metadata only.
- `created_at`, `updated_at`, `succeeded_at`.

### payment_events
- `id` (uuid, pk).
- `provider` (text).
- `external_event_id` (text) — provider's unique event id.
- `payment_id` (uuid, nullable, fk -> payments).
- `order_id` (uuid, nullable, fk -> orders).
- `event_type` (text).
- `payload_hash` (text) — hash of raw payload for dedup/debugging.
- `received_at`, `processed_at`.
- `processing_status` (text) — 'pending','processed','failed','duplicate'.
- `metadata` (jsonb).
- Unique on (provider, external_event_id) for idempotent replay protection.

## Indexes
- orders.user_id, orders.status, orders.idempotency_key (unique).
- order_items.order_id.
- payments.order_id, payments.provider_reference.
- payment_events.external_event_id (unique per provider), payment_events.payment_id, payment_events.order_id.

## RLS & Policies
- orders: owner-scoped SELECT only; no client INSERT/UPDATE/DELETE (server-side only).
- order_items: owner-scoped SELECT via parent order; no client writes.
- payments: owner-scoped SELECT via parent order; no client writes.
- payment_events: no client read/write (server-only audit trail).

## Important Notes
1. Orders are created server-side only. The client never inserts into orders.
2. order_items stores purchase-time snapshots so historical orders remain auditable.
3. payment_events.external_event_id uniqueness prevents duplicate webhook processing.
4. geo_mismatch is recorded but does not auto-block — provider rules decide.
5. idempotency_key on orders prevents duplicate order creation from retries.
*/

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','refunded','cancelled','expired')),
  billing_country text,
  payment_region_id text,
  observed_ip_country text,
  geo_mismatch boolean NOT NULL DEFAULT false,
  currency text NOT NULL,
  total_amount_minor integer NOT NULL CHECK (total_amount_minor >= 0),
  idempotency_key text UNIQUE NOT NULL,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name_snapshot text NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 1),
  unit_amount_minor integer NOT NULL CHECK (unit_amount_minor >= 0),
  total_amount_minor integer NOT NULL CHECK (total_amount_minor >= 0),
  currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  method text NOT NULL DEFAULT 'card',
  provider_reference text,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated','processing','succeeded','failed','canceled','expired','refunded','disputed')),
  amount_minor integer NOT NULL CHECK (amount_minor >= 0),
  currency text NOT NULL,
  raw_reference_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  succeeded_at timestamptz
);

CREATE INDEX IF NOT EXISTS payments_order_idx ON payments (order_id);
CREATE INDEX IF NOT EXISTS payments_provider_ref_idx ON payments (provider, provider_reference);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));

-- ============================================================
-- PAYMENT EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  external_event_id text,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload_hash text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending','processed','failed','duplicate')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_ext_uniq
  ON payment_events (provider, external_event_id);

CREATE INDEX IF NOT EXISTS payment_events_payment_idx ON payment_events (payment_id);
CREATE INDEX IF NOT EXISTS payment_events_order_idx ON payment_events (order_id);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- No client policies: payment_events is a server-only audit trail.
