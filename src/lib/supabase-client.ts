/*
 * PlanBium Supabase client singleton (browser-side).
 *
 * Uses the anon key — never the service role key.
 * Auth tokens are managed by Supabase's secure session handling, not localStorage.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { clientEnv } from '@/lib/config/env';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  supabaseInstance = createClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseInstance;
}

export const supabase = getSupabase();
