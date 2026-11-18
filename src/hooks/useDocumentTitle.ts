/*
 * Sets the browser tab title from a translation key, formatted as
 * "{page title} | PlanBium". Falls back to "PlanBium" when the key is missing.
 */

import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n/locale-context';
import type { TranslationKey } from '@/lib/i18n/translations';

export function useDocumentTitle(titleKey: TranslationKey): void {
  const { t } = useLocale();

  useEffect(() => {
    const page = t(titleKey);
    document.title = page ? `${page} | PlanBium` : 'PlanBium';
  }, [t, titleKey]);
}
