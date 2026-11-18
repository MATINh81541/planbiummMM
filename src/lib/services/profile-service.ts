/*
 * PlanBium profile service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo profile adapter
 * (localStorage-backed). When "false", keeps the existing behavior.
 */

import type { Profile } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { appConfig } from '@/lib/config/env';
import { demoProfile } from './demo/profile';

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

const emptyService = {
  async getProfile(): Promise<Profile | null> {
    return DEMO_PROFILE;
  },
  async ensureProfile(): Promise<Profile> {
    return DEMO_PROFILE;
  },
  async updateProfile(_updates: {
    display_name?: string | null;
    preferred_locale?: LocaleCode | null;
    billing_country?: string | null;
    dashboard_theme?: string | null;
  }): Promise<Profile> {
    throw new Error('backend_unavailable');
  },
};

export const profileService = appConfig.isDemo ? demoProfile : emptyService;
