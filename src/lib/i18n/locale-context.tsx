/*
 * PlanBium locale context.
 *
 * Connects the frontend to the centralized locale system from Prompt 1.
 * - Manual selection persists (localStorage) and overrides automatic country-based default.
 * - Changing language NEVER changes payment region, currency, or provider.
 * - Sets document lang + dir to avoid language/RTL flashes.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fallbackLocale, getLocale, isLocaleCode, locales, type LocaleCode, type LocaleConfig } from '@/lib/config/locales';
import { translate, type TranslationKey } from '@/lib/i18n/translations';

const STORAGE_KEY = 'planbium.locale';

interface LocaleContextValue {
  locale: LocaleCode;
  config: LocaleConfig;
  direction: 'ltr' | 'rtl';
  setLocale: (code: LocaleCode) => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (amountMinor: number, currency: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): LocaleCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocaleCode(stored)) return stored;
  } catch {
    // localStorage might not be available
  }
  // No country detection on client — the backend resolves country server-side.
  // Default to English until the user selects a language.
  return fallbackLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const config = useMemo(() => getLocale(locale) ?? locales[fallbackLocale], [locale]);
  const direction = config.direction;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);

  const formatCurrency = useCallback(
    (amountMinor: number, currency: string) => {
      try {
        const fractionDigits = currency === 'IRR' ? 0 : 2;
        const amount = amountMinor / Math.pow(10, fractionDigits);
        return new Intl.NumberFormat(config.intlLocale, {
          style: 'currency',
          currency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(amount);
      } catch {
        return `${amountMinor} ${currency}`;
      }
    },
    [config.intlLocale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, config, direction, setLocale, t, formatCurrency }),
    [locale, config, direction, setLocale, t, formatCurrency],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
