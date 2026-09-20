/*
# PlanBium: carts, cart_items, checkout_sessions

## Purpose
Establishes cart and checkout-session tables so the browser is never the source
of truth for cart ownership or checkout totals.

## New Tables

### carts
- `id` (uuid, pk).
- `user_id` (uuid, fk -> auth.users, default auth.uid()).
- `status` (text) — 'active' or 'abandoned'.
- Only one active cart per user (partial unique index on user_id WHERE status='active').
- `created_at`, `updated_at`.

### cart_items
- `id` (uuid, pk).
- `cart_id` (uuid, fk -> carts).
- `product_id` (uuid, fk -> products).
- `quantity` (integer, default 1) — digital planners default to 1.
- Unique (cart_id, product_id) prevents duplicate rows for the same product.
- `created_at`, `updated_at`.

### checkout_sessions
- `id` (uuid, pk).
- `user_id` (uuid, fk -> auth.users, default auth.uid()).
- `cart_hash` (text) — hash of cart contents at session creation for tamper detection.
- `billing_country` (text) — explicitly confirmed country; NULL until confirmed.
- `region_id` (text) — resolved payment region id (e.g. 'ir', 'eu', 'intl').
- `observed_ip_country` (text) — server-detected IP country hint.
- `currency` (text) — resolved currency code.
- `status` (text) — 'active','needs_country','expired','completed','cancelled'.
- `expires_at` (timestamptz) — checkout session expiry.
- `created_at`, `updated_at`.

## Indexes
- carts.user_id (+ partial unique on user_id WHERE status='active').
- cart_items.cart_id, cart_items(cart_id, product_id) unique.
- checkout_sessions.user_id, checkout_sessions.status.

## RLS & Policies
- carts: owner-scoped CRUD (authenticated, auth.uid() = user_id).
- cart_items: owner-scoped via parent cart membership check.
- checkout_sessions: owner-scoped read/update; inserts server-side (authenticated with ownership check).

## Important Notes
1. Cart stores product references only — NOT price snapshots. Prices are resolved server-side at checkout.
2. Digital planners default to quantity 1.
3. Ownership is checked server-side AND via RLS. UUID secrecy is never authorization.
4. checkout_sessions.billing_country is NULL until the user explicitly confirms it during checkout.
*/

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','abandoned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS carts_user_active_uniq
  ON carts (user_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS carts_user_idx ON carts (user_id);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_carts" ON carts;
CREATE POLICY "select_own_carts" ON carts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_carts" ON carts;
CREATE POLICY "insert_own_carts" ON carts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_carts" ON carts;
CREATE POLICY "update_own_carts" ON carts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_carts" ON carts;
CREATE POLICY "delete_own_carts" ON carts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_uniq
  ON cart_items (cart_id, product_id);

CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items (cart_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cart_items" ON cart_items;
CREATE POLICY "select_own_cart_items" ON cart_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_cart_items" ON cart_items;
CREATE POLICY "insert_own_cart_items" ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_cart_items" ON cart_items;
CREATE POLICY "update_own_cart_items" ON cart_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_cart_items" ON cart_items;
CREATE POLICY "delete_own_cart_items" ON cart_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- ============================================================
-- CHECKOUT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_hash text,
  billing_country text,
  region_id text,
  observed_ip_country text,
  currency text,
  status text NOT NULL DEFAULT 'needs_country' CHECK (status IN ('active','needs_country','expired','completed','cancelled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checkout_sessions_user_idx ON checkout_sessions (user_id);
CREATE INDEX IF NOT EXISTS checkout_sessions_status_idx ON checkout_sessions (status);

ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_checkout_sessions" ON checkout_sessions;
CREATE POLICY "select_own_checkout_sessions" ON checkout_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_checkout_sessions" ON checkout_sessions;
CREATE POLICY "insert_own_checkout_sessions" ON checkout_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_checkout_sessions" ON checkout_sessions;
CREATE POLICY "update_own_checkout_sessions" ON checkout_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_checkout_sessions" ON checkout_sessions;
CREATE POLICY "delete_own_checkout_sessions" ON checkout_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
