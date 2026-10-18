/*
 * PlanBium profile service — temporary demo mode.
 *
 * Supabase has been removed. The profile service returns a demo profile for
 * reads and throws a clear "backend unavailable" error for writes — profile
 * persistence is not faked. Reimplement against the custom backend when ready.
 */

import type { Profile } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';

const DEMO_PROFILE: Profile = {
  user_id: 'demo-user',
  display_name: 'Demo User',
  preferred_locale: null,
  billing_country: null,
  dashboard_theme: 'gray',
  role: 'user',
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export const profileService = {
  /** Get the current user's profile. Returns a demo profile. */
  async getProfile(): Promise<Profile | null> {
    return DEMO_PROFILE;
  },

  /** Create a profile if it doesn't exist. Returns the demo profile. */
  async ensureProfile(): Promise<Profile> {
    return DEMO_PROFILE;
  },

  /** Update user-editable profile fields. Unavailable in demo mode. */
  async updateProfile(_updates: {
    display_name?: string | null;
    preferred_locale?: LocaleCode | null;
    billing_country?: string | null;
    dashboard_theme?: string | null;
  }): Promise<Profile> {
    throw new Error('backend_unavailable');
  },
};
