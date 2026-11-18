/*
 * PlanBium dashboard account page.
 *
 * Top summary card shows the signed-in user's real data: avatar initial,
 * display name, email (read-only), member-since date, and stats (paid orders
 * and owned products). The editable form below supports display name,
 * billing country (searchable select), preferred language, and theme.
 * Language and theme changes apply immediately to the whole UI.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, LogOut, Search, Check, ChevronDown, AlertTriangle, Package, ShoppingBag } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useDashboardTheme, type DashboardTheme } from '@/lib/dashboard-theme';
import { profileService } from '@/lib/services/profile-service';
import { orderService, entitlementService } from '@/lib/services/entitlement-service';
import { localeList, isLocaleCode, type LocaleCode } from '@/lib/config/locales';
import { countryRegistry } from '@/lib/config/countries';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/components/ui/Toast';
import type { Profile } from '@/lib/types';

type ThemeOption = DashboardTheme | 'system';

interface CountryEntry {
  code: string;
  name: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  IR: 'Iran',
  NL: 'Netherlands',
  ES: 'Spain',
  CN: 'China',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  EG: 'Egypt',
  IQ: 'Iraq',
};

const COUNTRY_LIST: CountryEntry[] = Object.keys(countryRegistry)
  .map((code) => ({ code, name: COUNTRY_NAMES[code] ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function DashboardAccountPage() {
  const { t, locale, setLocale, formatDate } = useLocale();
  const { user, signOut } = useAuth();
  const { theme: currentDashboardTheme, setTheme: setDashboardTheme } = useDashboardTheme();
  const navigate = useNavigate();
  useDocumentTitle('page.title.account');
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [preferredLocale, setPreferredLocale] = useState<LocaleCode | ''>('');
  const [billingCountry, setBillingCountry] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('gray');

  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const [paidOrderCount, setPaidOrderCount] = useState(0);
  const [ownedProductCount, setOwnedProductCount] = useState(0);

  // Snapshot of initial values to detect dirty state
  const initialSnapshot = useRef({ displayName: '', preferredLocale: '', billingCountry: '', selectedTheme: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, orders, entitlements] = await Promise.all([
        profileService.getProfile(),
        orderService.listOrders(),
        entitlementService.listEntitlements(),
      ]);

      if (p) {
        setProfile(p);
        setDisplayName(p.display_name ?? '');
        setPreferredLocale(p.preferred_locale && isLocaleCode(p.preferred_locale) ? p.preferred_locale : '');
        setBillingCountry(p.billing_country ?? '');
        const storedTheme = (p.dashboard_theme as ThemeOption) ?? 'gray';
        setSelectedTheme(storedTheme);
        initialSnapshot.current = {
          displayName: p.display_name ?? '',
          preferredLocale: p.preferred_locale ?? '',
          billingCountry: p.billing_country ?? '',
          selectedTheme: storedTheme,
        };
      }

      setPaidOrderCount(orders.filter((o) => o.order.status === 'paid').length);
      setOwnedProductCount(entitlements.length);
    } catch {
      showToast('error', t('toast.profileLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep the form's theme in sync with the dashboard sidebar theme changes,
  // but only when the form's theme matches the snapshot (not user-dirtied).
  useEffect(() => {
    if (
      (currentDashboardTheme === 'gray' || currentDashboardTheme === 'lime' || currentDashboardTheme === 'blueberry') &&
      selectedTheme === initialSnapshot.current.selectedTheme
    ) {
      setSelectedTheme(currentDashboardTheme);
      initialSnapshot.current.selectedTheme = currentDashboardTheme;
    }
  }, [currentDashboardTheme, selectedTheme]);

  const isDirty = useMemo(() => {
    return (
      displayName !== initialSnapshot.current.displayName ||
      preferredLocale !== initialSnapshot.current.preferredLocale ||
      billingCountry !== initialSnapshot.current.billingCountry ||
      selectedTheme !== initialSnapshot.current.selectedTheme
    );
  }, [displayName, preferredLocale, billingCountry, selectedTheme]);

  function validateDisplayName(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      setDisplayNameError(t('account.displayNameError'));
      return false;
    }
    setDisplayNameError(null);
    return true;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!validateDisplayName(displayName)) return;
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        display_name: displayName.trim() || null,
        preferred_locale: preferredLocale || null,
        billing_country: billingCountry || null,
        dashboard_theme: selectedTheme,
      });
      setProfile(updated);

      // Apply locale change immediately
      if (preferredLocale && preferredLocale !== locale) {
        setLocale(preferredLocale);
      }

      // Apply theme change immediately
      if (selectedTheme === 'gray' || selectedTheme === 'lime' || selectedTheme === 'blueberry') {
        setDashboardTheme(selectedTheme);
      }

      // Update dirty snapshot so the button disables again
      initialSnapshot.current = {
        displayName: displayName.trim(),
        preferredLocale: preferredLocale || '',
        billingCountry,
        selectedTheme,
      };

      showToast('success', t('toast.profileSaved'));
    } catch {
      showToast('error', t('toast.profileSaveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const avatarInitial = (profile?.display_name ?? user?.email ?? '?')[0]?.toUpperCase() ?? '?';

  if (loading) {
    return (
      <Container size="md">
        <div className="mb-6">
          <div className="h-8 w-48 rounded-glass bg-gray-200/50 animate-pulse" />
        </div>
        <GlassCard variant="strong" className="p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200/60" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-gray-200/60 rounded" />
              <div className="h-4 w-56 bg-gray-200/40 rounded" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6 animate-pulse space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200/50 rounded mb-2" />
              <div className="h-12 w-full bg-gray-200/40 rounded-xl" />
            </div>
          ))}
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container size="md">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('account.title')}</h1>

      {/* Summary card */}
      <GlassCard variant="strong" className="p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-500 text-white text-2xl font-bold shadow-soft">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {profile?.display_name || user?.email?.split('@')[0] || '—'}
              </h2>
              <p className="text-sm text-gray-500 truncate" dir="ltr">{user?.email}</p>
              {profile && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('account.memberSince')} {formatDate(profile.created_at)}
                </p>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut size={16} className="rtl:rotate-180" aria-hidden="true" />
            {t('account.signOut')}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="glass-surface rounded-glass p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-glass bg-lime-100/50 text-lime-600">
              <ShoppingBag size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{paidOrderCount}</p>
              <p className="text-xs text-gray-500">{t('account.paidOrders')}</p>
            </div>
          </div>
          <div className="glass-surface rounded-glass p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-glass bg-blueberry-100/50 text-blueberry-600">
              <Package size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ownedProductCount}</p>
              <p className="text-xs text-gray-500">{t('account.ownedProducts')}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Editable profile form */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('account.profileSection')}</h2>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              dir="ltr"
              className="w-full rounded-xl border border-gray-200/60 bg-gray-100/40 py-3 ps-4 pe-4 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">{t('account.emailReadOnly')}</p>
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
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (displayNameError) validateDisplayName(e.target.value);
              }}
              onBlur={() => validateDisplayName(displayName)}
              className={`w-full rounded-xl border bg-white/40 py-3 ps-4 pe-4 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                displayNameError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                  : 'border-gray-300/60 focus:border-gray-500 focus:ring-gray-400/20'
              }`}
            />
            {displayNameError && <p className="text-xs text-red-600 mt-1">{displayNameError}</p>}
          </div>

          {/* Preferred language */}
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.preferredLocale')}
            </label>
            <select
              id="locale"
              value={preferredLocale}
              onChange={(e) => setPreferredLocale(e.target.value as LocaleCode | '')}
              className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 ps-4 pe-4 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
            >
              <option value="">{t('language.select')}</option>
              {localeList.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Billing country — searchable select */}
          <CountrySelect
            value={billingCountry}
            onChange={setBillingCountry}
            placeholder={t('account.countryPlaceholder')}
            noResults={t('account.countryNoResults')}
          />

          {/* Theme — light/dark/system (maps to dashboard themes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('account.dashboardTheme')}
            </label>
            <div className="flex gap-3">
              {(['gray', 'lime', 'blueberry'] as const).map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setSelectedTheme(th)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                    selectedTheme === th
                      ? 'bg-white/50 shadow-soft ring-2 ring-gray-400/40'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-pressed={selectedTheme === th}
                >
                  <span className={`h-4 w-4 rounded-full ${
                    th === 'gray' ? 'bg-gray-400' : th === 'lime' ? 'bg-lime-400' : 'bg-blueberry-400'
                  }`} />
                  {th === 'gray' ? t('dashboard.theme.gray') : th === 'lime' ? t('dashboard.theme.lime') : t('dashboard.theme.blueberry')}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <Button type="submit" variant="primary" size="md" disabled={saving || !isDirty || !!displayNameError}>
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

      {/* Danger zone */}
      <GlassCard className="p-6 border border-red-200/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-glass bg-red-100/50 text-red-500">
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{t('account.dangerZone')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('account.dangerZoneDescription')}</p>
            <Button variant="secondary" size="sm" disabled className="!border-red-200 !text-red-400">
              {t('account.deleteAccount')}
            </Button>
            <p className="text-xs text-gray-400 mt-2">{t('account.deleteAccountSoon')}</p>
          </div>
        </div>
      </GlassCard>
    </Container>
  );
}

/*
 * Searchable country select.
 * Renders a dropdown with a search input and a list of known countries.
 * Stores the ISO 3166-1 alpha-2 code.
 */
function CountrySelect({
  value,
  onChange,
  placeholder,
  noResults,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  noResults: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_LIST;
    return COUNTRY_LIST.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = COUNTRY_LIST.find((c) => c.code === value);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t('account.billingCountry')}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-300/60 bg-white/40 py-3 ps-4 pe-4 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? `${selected.name} (${selected.code})` : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full glass-surface rounded-glass shadow-glass overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200/30">
            <div className="relative">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full rounded-lg border border-gray-200/60 bg-white/60 py-2 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">{noResults}</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors text-start"
                  role="option"
                  aria-selected={c.code === value}
                >
                  <span>{c.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono" dir="ltr">{c.code}</span>
                    {c.code === value && <Check size={14} className="text-lime-600" aria-hidden="true" />}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
