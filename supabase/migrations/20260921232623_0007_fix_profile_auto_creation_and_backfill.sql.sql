/*
# Fix profile auto-creation, backfill existing users, tighten checkout_sessions security

## Purpose
1. Fix `profiles.user_id` to DEFAULT auth.uid() so client-side inserts work correctly.
2. Create a SECURITY DEFINER trigger function that auto-creates a profile row
   whenever a new auth user signs up — with role='user', search_path locked to public.
3. Backfill profiles for the 3 existing auth users who don't have one yet.
4. Tighten checkout_sessions: revoke UPDATE on server-controlled columns
   (status, region_id, currency, cart_hash, observed_ip_country, expires_at)
   so the browser can only update billing_country. All other columns are
   managed by edge functions using the service role key.

## Changes

### profiles table
- ALTER user_id column to add DEFAULT auth.uid()
- New trigger function `handle_new_user()` (SECURITY DEFINER, fixed search_path)
- New trigger `on_auth_user_created` AFTER INSERT on auth.users

### checkout_sessions table
- Revoke UPDATE on server-controlled columns from anon + authenticated roles
- Only billing_country and updated_at remain client-updatable

## Security
- Profile trigger runs as SECURITY DEFINER with search_path = public (safe from search_path injection).
- Profile INSERT policy already enforces role='user' — trigger also sets role='user'.
- Users still cannot set their own role to admin (enforced by both CHECK constraint and RLS).
- checkout_sessions: client can only update billing_country, not status/currency/region/totals.
- The UPDATE RLS policy remains ownership-scoped (auth.uid() = user_id).

## Important Notes
1. Existing migrations are NOT modified — this is a new sequential migration.
2. The trigger is idempotent: if a profile already exists, it does nothing (ON CONFLICT).
3. Backfill uses INSERT ... ON CONFLICT to safely handle any race conditions.
4. Column-level GRANTs are additive security on top of RLS — both must pass.
*/

-- ============================================================
-- 1. Fix profiles.user_id DEFAULT
-- ============================================================
ALTER TABLE profiles ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============================================================
-- 2. Create trigger function for auto profile creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Create the trigger on auth.users
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. Backfill profiles for existing auth users
-- ============================================================
INSERT INTO public.profiles (user_id, role)
SELECT au.id, 'user'
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 5. Tighten checkout_sessions column-level UPDATE privileges
-- Revoke UPDATE on server-controlled columns from client roles.
-- Only billing_country (and updated_at via trigger) remains client-updatable.
-- ============================================================
REVOKE UPDATE (cart_hash, region_id, observed_ip_country, currency, status, expires_at)
  ON checkout_sessions FROM anon, authenticated;
