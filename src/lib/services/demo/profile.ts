/*
 * Demo profile adapter.
 *
 * Seeds a demo user on first access and persists profile edits
 * to localStorage.
 */

import type { Profile } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { demoGet, demoSet, DEMO_USER_ID, DEMO_CREATED_AT } from './shared';

const KEY = 'profile';

const SEED_PROFILE: Profile = {
  user_id: DEMO_USER_ID,
  display_name: 'Demo User',
  preferred_locale: null,
  billing_country: 'IR',
  dashboard_theme: 'gray',
  role: 'user',
  created_at: DEMO_CREATED_AT,
  updated_at: DEMO_CREATED_AT,
};

function loadProfile(): Profile {
  return demoGet<Profile>(KEY, SEED_PROFILE);
}

export const demoProfile = {
  async getProfile(): Promise<Profile | null> {
    return loadProfile();
  },

  async ensureProfile(): Promise<Profile> {
    const p = loadProfile();
    demoSet(KEY, p);
    return p;
  },

  async updateProfile(updates: {
    display_name?: string | null;
    preferred_locale?: LocaleCode | null;
    billing_country?: string | null;
    dashboard_theme?: string | null;
  }): Promise<Profile> {
    const current = loadProfile();
    const updated: Profile = {
      ...current,
      display_name: updates.display_name !== undefined ? updates.display_name : current.display_name,
      preferred_locale: updates.preferred_locale !== undefined ? updates.preferred_locale : current.preferred_locale,
      billing_country: updates.billing_country !== undefined ? updates.billing_country : current.billing_country,
      dashboard_theme: updates.dashboard_theme !== undefined ? updates.dashboard_theme : current.dashboard_theme,
      updated_at: new Date().toISOString(),
    };
    demoSet(KEY, updated);
    return updated;
  },
};
