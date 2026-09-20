/*
 * PlanBium language selector.
 *
 * Clean, elegant dropdown consistent with Liquid Glass.
 * Keyboard accessible, touch-friendly.
 * Manual selection persists via LocaleProvider.
 * Changing language NEVER changes payment region.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { localeList } from '@/lib/config/locales';

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  const current = localeList.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t('language.select')}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
      >
        <Globe size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{current?.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="glass-surface-strong absolute end-0 top-full mt-2 min-w-[180px] rounded-glass p-2 shadow-glass-lg animate-fade-in">
          <ul role="listbox" className="space-y-1">
            {localeList.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={l.code === locale}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    l.code === locale
                      ? 'bg-lime-100 font-semibold text-lime-700'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <span>{l.label}</span>
                  {l.code === locale && <Check size={16} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
