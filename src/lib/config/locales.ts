/*
 * PlanBium locale registry.
 *
 * Centralized locale configuration — the single source of truth for supported locales.
 * The frontend (Prompt 2) will consume this system. Do not implement translation
 * decisions in random components.
 */

export type LocaleCode = 'en' | 'fa' | 'ar' | 'zh-Hans' | 'nl' | 'es';

export type TextDirection = 'ltr' | 'rtl';

export interface LocaleConfig {
  code: LocaleCode;
  label: string;
  direction: TextDirection;
  intlLocale: string;
  fontMetadata: {
    family: string;
    scale: number;
  };
  numberingSystem: string;
}

export const locales: Record<LocaleCode, LocaleConfig> = {
  en: {
    code: 'en',
    label: 'English',
    direction: 'ltr',
    intlLocale: 'en-US',
    fontMetadata: { family: 'Inter', scale: 1 },
    numberingSystem: 'latn',
  },
  fa: {
    code: 'fa',
    label: 'فارسی',
    direction: 'rtl',
    intlLocale: 'fa-IR',
    fontMetadata: { family: 'Vazirmatn', scale: 1 },
    numberingSystem: 'arabext',
  },
  ar: {
    code: 'ar',
    label: 'العربية',
    direction: 'rtl',
    intlLocale: 'ar-SA',
    fontMetadata: { family: 'Noto Sans Arabic', scale: 1 },
    numberingSystem: 'arab',
  },
  'zh-Hans': {
    code: 'zh-Hans',
    label: '简体中文',
    direction: 'ltr',
    intlLocale: 'zh-Hans',
    fontMetadata: { family: 'Noto Sans SC', scale: 1 },
    numberingSystem: 'latn',
  },
  nl: {
    code: 'nl',
    label: 'Nederlands',
    direction: 'ltr',
    intlLocale: 'nl-NL',
    fontMetadata: { family: 'Inter', scale: 1 },
    numberingSystem: 'latn',
  },
  es: {
    code: 'es',
    label: 'Español',
    direction: 'ltr',
    intlLocale: 'es-ES',
    fontMetadata: { family: 'Inter', scale: 1 },
    numberingSystem: 'latn',
  },
};

export const localeList: LocaleConfig[] = Object.values(locales);

export const supportedLocaleCodes: LocaleCode[] = localeList.map((l) => l.code);

export const fallbackLocale: LocaleCode = 'en';

export function isLocaleCode(value: string): value is LocaleCode {
  return value in locales;
}

export function getLocale(code: string): LocaleConfig | undefined {
  return isLocaleCode(code) ? locales[code] : undefined;
}
