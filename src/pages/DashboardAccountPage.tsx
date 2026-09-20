/*
 * PlanBium dashboard account page.
 *
 * User can edit: display name, preferred locale, billing country, dashboard theme.
 * Role is NOT editable here (server-side only).
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Save, CheckCircle, Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useDashboardTheme, type DashboardTheme } from '@/lib/dashboard-theme';
import { profileService } from '@/lib/services/profile-service';
import { localeList } from '@/lib/config/locales';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';

export function DashboardAccountPage() {
  const { t, locale, setLocale } = useLocale();
  const { user } = useAuth();
  const { setTheme } = useDashboardTheme();

  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [preferredLocale, setPreferredLocale] = useState<LocaleCode | ''>('');
  const [billingCountry, setBillingCountry] = useState('');
  const [dashboardTheme, setDashboardTheme] = useState<string>('gray');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await profileService.getProfile();
        if (p) {
          setProfile(p);
          setDisplayName(p.display_name ?? '');
          setPreferredLocale((p.preferred_locale as LocaleCode) ?? '');
          setBillingCountry(p.billing_country ?? '');
          setDashboardTheme(p.dashboard_theme ?? 'gray');
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await profileService.updateProfile({
        display_name: displayName || null,
        preferred_locale: preferredLocale || null,
        billing_country: billingCountry.toUpperCase() || null,
        dashboard_theme: dashboardTheme,
      });
      setProfile(updated);

      // Apply locale change immediately
      if (preferredLocale && preferredLocale !== locale) {
        setLocale(preferredLocale);
      }

      // Apply theme change
      if (dashboardTheme === 'gray' || dashboardTheme === 'lime' || dashboardTheme === 'blueberry') {
        setTheme(dashboardTheme as DashboardTheme);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t('account.error'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Container size="md">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-400" aria-hidden="true" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="md">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('account.title')}</h1>

      <GlassCard variant="strong" className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              dir="ltr"
              className="w-full rounded-xl border border-gray-200/60 bg-gray-100/40 py-3 px-4 text-gray-500"
            />
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 px-4 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
            />
          </div>

          {/* Preferred locale */}
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.preferredLocale')}
            </label>
            <select
              id="locale"
              value={preferredLocale}
              onChange={(e) => setPreferredLocale(e.target.value as LocaleCode | '')}
              className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 px-4 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
            >
              <option value="">{t('language.select')}</option>
              {localeList.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Billing country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.billingCountry')}
            </label>
            <input
              id="country"
              type="text"
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value.toUpperCase().substring(0, 2))}
              placeholder="ISO 3166-1 alpha-2 (e.g. NL, IR, US)"
              dir="ltr"
              className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
            />
          </div>

          {/* Dashboard theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.dashboardTheme')}
            </label>
            <div className="flex gap-3">
              {(['gray', 'lime', 'blueberry'] as const).map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setDashboardTheme(th)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                    dashboardTheme === th
                      ? 'bg-white/50 shadow-soft ring-2 ring-gray-400/40'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-pressed={dashboardTheme === th}
                >
                  <span className={`h-4 w-4 rounded-full ${
                    th === 'gray' ? 'bg-gray-400' : th === 'lime' ? 'bg-lime-400' : 'bg-blueberry-400'
                  }`} />
                  {th === 'gray' ? t('dashboard.theme.gray') : th === 'lime' ? t('dashboard.theme.lime') : t('dashboard.theme.blueberry')}
                </button>
              ))}
            </div>
          </div>

          {/* Error / success */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-lime-700 flex items-center gap-1.5">
              <CheckCircle size={16} aria-hidden="true" />
              {t('account.saved')}
            </p>
          )}

          {/* Save */}
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                {t('account.saving')}
              </>
            ) : (
              <>
                <Save size={18} aria-hidden="true" />
                {t('account.save')}
              </>
            )}
          </Button>
        </form>
      </GlassCard>
    </Container>
  );
}
