/*
 * PlanBium profile service (client-side).
 *
 * Users can read and update their own profile.
 * The `role` field is NOT client-editable — admin elevation is server-side only.
 */

import { supabase } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';

export const profileService = {
  /** Get the current user's profile. */
  async getProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  /** Create a profile if it doesn't exist (called after signup). */
  async ensureProfile(): Promise<Profile> {
    const existing = await this.getProfile();
    if (existing) return existing;
    const { data, error } = await supabase
      .from('profiles')
      .insert({ role: 'user' })
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  /** Update user-editable profile fields. Role is never set by the client. */
  async updateProfile(updates: {
    display_name?: string | null;
    preferred_locale?: LocaleCode | null;
    billing_country?: string | null;
    dashboard_theme?: string | null;
  }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },
};
