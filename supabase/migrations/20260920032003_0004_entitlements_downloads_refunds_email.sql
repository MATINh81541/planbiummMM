/*
# PlanBium: entitlements, download_log, refunds, email_outbox

## Purpose
Establishes the post-purchase lifecycle: entitlements (access rights), download
audit log, refunds, and a transactional email outbox for reliable async sending.

## New Tables

### entitlements
- `id` (uuid, pk).
- `user_id` (uuid, fk -> auth.users).
- `product_id` (uuid, fk -> products).
- `order_id` (uuid, fk -> orders).
- `status` (text) — 'active' or 'revoked'.
- `granted_at`, `revoked_at` (timestamptz).
- `metadata` (jsonb).
- Unique on (user_id, product_id) WHERE status = 'active' — no duplicate active entitlements.

### download_log
- `id` (uuid, pk).
- `user_id` (uuid, fk -> auth.users).
- `entitlement_id` (uuid, fk -> entitlements).
- `asset_id` (uuid, fk -> product_assets).
- `ip_hash` (text) — privacy-conscious hash, not raw IP.
- `user_agent_summary` (text) — truncated/summarized UA.
- `created_at` (timestamptz).

### refunds
- `id` (uuid, pk).
- `order_id` (uuid, fk -> orders).
- `payment_id` (uuid, fk -> payments).
- `amount_minor` (integer).
- `currency` (text).
- `reason` (text).
- `status` (text) — 'pending','completed','failed'.
- `provider_reference` (text).
- `created_at`, `completed_at`.

### email_outbox
- `id` (uuid, pk).
- `user_id` (uuid, nullable, fk -> auth.users).
- `email_type` (text) — 'receipt','order_confirmation','refund_notice', etc.
- `recipient` (text) — email address.
- `locale` (text) — locale for localized email content.
- `payload` (jsonb) — template variables.
- `status` (text) — 'pending','sending','sent','failed'.
- `attempts` (integer, default 0).
- `last_error` (text).
- `scheduled_at`, `sent_at`, `created_at`.

## Indexes
- entitlements(user_id, product_id) + partial unique on active.
- download_log.user_id, download_log.entitlement_id.
- refunds.order_id.
- email_outbox.status, email_outbox.scheduled_at.

## RLS & Policies
- entitlements: owner-scoped SELECT only; no client writes (server grants/revoke).
- download_log: owner-scoped SELECT; no client writes (server logs downloads).
- refunds: owner-scoped SELECT via parent order; no client writes.
- email_outbox: no client access (server-only queue).

## Important Notes
1. Entitlements are the authoritative source for protected download access — not purchase history.
2. The unique partial index on (user_id, product_id) WHERE status='active' prevents duplicate entitlements.
3. download_log stores an IP hash, not raw IP, for privacy.
4. email_outbox is a server-only queue; transactional emails are never sent from client code.
5. Refunds belong to the existing order/payment architecture — no parallel payment system.
*/

-- ============================================================
-- ENTITLEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_product_active_uniq
  ON entitlements (user_id, product_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS entitlements_user_product_idx ON entitlements (user_id, product_id);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_entitlements" ON entitlements;
CREATE POLICY "select_own_entitlements" ON entitlements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DOWNLOAD LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS download_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_id uuid NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES product_assets(id) ON DELETE CASCADE,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS download_log_user_idx ON download_log (user_id);
CREATE INDEX IF NOT EXISTS download_log_entitlement_idx ON download_log (entitlement_id);

ALTER TABLE download_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_download_log" ON download_log;
CREATE POLICY "select_own_download_log" ON download_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REFUNDS
-- ============================================================
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount_minor integer NOT NULL CHECK (amount_minor >= 0),
  currency text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  provider_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS refunds_order_idx ON refunds (order_id);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_refunds" ON refunds;
CREATE POLICY "select_own_refunds" ON refunds FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid()));

-- ============================================================
-- EMAIL OUTBOX
-- ============================================================
CREATE TABLE IF NOT EXISTS email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type text NOT NULL,
  recipient text NOT NULL,
  locale text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_outbox_status_scheduled_idx ON email_outbox (status, scheduled_at);

ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

-- No client policies: email_outbox is a server-only queue.
