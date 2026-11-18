#!/usr/bin/env npx tsx
/*
 * i18n completeness check.
 *
 * Fails when any locale dictionary is missing keys defined in TranslationKey.
 * Usage: npm run i18n:check
 */

import { translations } from '../src/lib/i18n/translations';
import { supportedLocaleCodes } from '../src/lib/config/locales';

// Extract all keys present in the English dictionary — English is the source of truth
// for the full key set since TranslationKey is a union type we can't easily enumerate at runtime.
// The English dict is a Partial<Record<TranslationKey, string>> so it should have every key.
const enDict = translations.en;
if (!enDict) {
  console.error('English dictionary not found.');
  process.exit(1);
}

const allKeys = Object.keys(enDict).sort();
const locales = supportedLocaleCodes;

let totalMissing = 0;

for (const locale of locales) {
  if (locale === 'en') continue;
  const dict = translations[locale];
  if (!dict) {
    console.error(`Locale "${locale}" has no dictionary at all.`);
    totalMissing += allKeys.length;
    continue;
  }

  const missing = allKeys.filter((key) => !(key in dict));

  if (missing.length > 0) {
    console.error(`\n[${locale}] ${missing.length} missing key(s):`);
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
    totalMissing += missing.length;
  } else {
    console.log(`[${locale}] 0 missing keys — OK`);
  }
}

if (totalMissing > 0) {
  console.error(`\n${totalMissing} total missing key(s) across all locales.`);
  process.exit(1);
} else {
  console.log('\nAll locales have all keys. No missing keys.');
  process.exit(0);
}
