/*
 * PlanBium dashboard theme context.
 *
 * Three themes: gray, lime, blueberry.
 * Theme is visual only — it must NOT alter payment region, currency, provider, or business logic.
 * Persists via profileService.dashboard_theme (server-backed) with localStorage fallback.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FluidBackgroundVariant } from '@/components/FluidBackground';

export type DashboardTheme = 'gray' | 'lime' | 'blueberry';

interface DashboardThemeContextValue {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  fluidVariant: FluidBackgroundVariant;
}

const ThemeContext = createContext<DashboardThemeContextValue | null>(null);

const STORAGE_KEY = 'planbium.dashboard_theme';

const themeToFluid: Record<DashboardTheme, FluidBackgroundVariant> = {
  gray: 'gray',
  lime: 'lime',
  blueberry: 'blueberry',
};

function getInitialTheme(): DashboardTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'gray' || stored === 'lime' || stored === 'blueberry') return stored;
  } catch {
    // ignore
  }
  return 'gray';
}

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>(getInitialTheme);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-dashboard-theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    fluidVariant: themeToFluid[theme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useDashboardTheme(): DashboardThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useDashboardTheme must be used within DashboardThemeProvider');
  return ctx;
}
