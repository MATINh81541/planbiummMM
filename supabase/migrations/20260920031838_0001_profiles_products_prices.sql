/*
# PlanBium: profiles, products, prices, product_translations, product_assets

## Purpose
Establishes the foundational catalog and user-profile tables for the PlanBium
digital planner commerce platform.

## New Tables

### profiles
- `user_id` (uuid, primary key, references auth.users) — one row per user, keyed by their auth identity.
- `display_name` (text) — optional display name.
- `preferred_locale` (text) — NULL means automatic locale behaviour; explicit value overrides.
- `billing_country` (text) — convenience prefill only; not authoritative for payment until confirmed at checkout.
- `dashboard_theme` (text) — visual preference; never affects payment/business rules.
- `role` (text, default 'user') — authorization role: 'user' or 'admin'.
- `created_at`, `updated_at` (timestamptz).

### products
- `id` (uuid, pk).
- `slug` (text, unique) — URL-friendly identifier.
- `status` (text) — 'draft', 'active', or 'archived'.
- `metadata` (jsonb) — extensible product metadata.
- `created_at`, `updated_at`.

### prices
- `id` (uuid, pk).
- `product_id` (uuid, fk -> products).
- `currency` (text) — ISO 4217 code (e.g. 'USD', 'EUR', 'IRR').
- `amount_minor` (integer) — price in minor units; never floating point.
- `active` (boolean, default true).
- Unique constraint on (product_id, currency) WHERE active = true.
- `created_at`, `updated_at`.

### product_translations
- `id` (uuid, pk).
- `product_id` (uuid, fk -> products).
- `locale` (text) — locale code (en, fa, ar, zh-Hans, nl, es).
- `name`, `tagline`, `description` (text).
- `features` (jsonb) — structured feature list.
- Unique (product_id, locale).
- `created_at`, `updated_at`.

### product_assets
- `id` (uuid, pk).
- `product_id` (uuid, fk -> products).
- `storage_path` (text) — path within the private storage bucket.
- `asset_type` (text) — 'planner', 'preview', etc.
- `version` (text) — version label.
- `active` (boolean, default true).
- `metadata` (jsonb).
- `created_at`, `updated_at`.

## Indexes
- profiles.user_id (pk, implicitly indexed).
- products.slug (unique index).
- prices(product_id, currency, active).
- product_translations(product_id, locale) (unique index).
- product_assets(product_id).

## RLS & Policies
- profiles: user reads/updates own row; service role manages the rest.
- products: public read for active products (anon + authenticated); writes blocked for client roles.
- prices: public read for active prices; writes blocked for client roles.
- product_translations: public read; writes blocked for client roles.
- product_assets: no public read (metadata is private — only service role); client writes blocked.

## Important Notes
1. profiles.role is editable only by the service role (admin elevation is server-side only).
2. prices.amount_minor is integer to avoid floating-point money bugs.
3. product_assets rows are NOT publicly readable; the download edge function authorizes access.
4. All catalog writes (products, prices, translations, assets) are server-side only — clients cannot insert/update/delete them.
*/

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  preferred_locale text CHECK (
    preferred_locale IS NULL
    OR preferred_locale IN ('en','fa','ar','zh-Hans','nl','es')
  ),
  billing_country text,
  dashboard_theme text DEFAULT 'system',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'user');

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = 'user');

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (status = 'active');

-- ============================================================
-- PRICES
-- ============================================================
CREATE TABLE IF NOT EXISTS prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  currency text NOT NULL,
  amount_minor integer NOT NULL CHECK (amount_minor >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS prices_product_currency_active_uniq
  ON prices (product_id, currency) WHERE active = true;

CREATE INDEX IF NOT EXISTS prices_product_currency_active_idx
  ON prices (product_id, currency, active);

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_prices" ON prices;
CREATE POLICY "public_read_active_prices" ON prices FOR SELECT
  TO anon, authenticated USING (active = true);

-- ============================================================
-- PRODUCT TRANSLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en','fa','ar','zh-Hans','nl','es')),
  name text NOT NULL,
  tagline text,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_translations_product_locale_uniq
  ON product_translations (product_id, locale);

CREATE INDEX IF NOT EXISTS product_translations_product_locale_idx
  ON product_translations (product_id, locale);

ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_translations" ON product_translations;
CREATE POLICY "public_read_product_translations" ON product_translations FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- PRODUCT ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  asset_type text NOT NULL DEFAULT 'planner' CHECK (asset_type IN ('planner','preview','thumbnail','extra')),
  version text NOT NULL DEFAULT '1',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_assets_product_idx ON product_assets (product_id);

ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;

-- No public read policy: asset metadata and paths are private.
-- Only the service role (edge functions) can read/insert/update/delete.
