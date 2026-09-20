/*
 * PlanBium dashboard layout.
 *
 * Vertical Liquid Glass sidebar navigation.
 * Desktop: sidebar on inline-start (left for LTR, right for RTL).
 * Mobile: horizontal glass nav bar.
 *
 * Navigation: Pricing, Cart, My Purchases, Account, Log out.
 * Theme selector integrated.
 */

import { type ReactNode, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Package, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale } from '@/lib/i18n/locale-context';
import { useDashboardTheme, type DashboardTheme } from '@/lib/dashboard-theme';
import { FluidBackground } from '@/components/FluidBackground';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BrandLogo } from '@/components/BrandLogo';
import { profileService } from '@/lib/services/profile-service';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useLocale();
  const { user, signOut } = useAuth();
  const { theme, setTheme, fluidVariant } = useDashboardTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { to: '/dashboard/pricing', label: t('dashboard.nav.pricing'), icon: LayoutGrid },
    { to: '/dashboard/cart', label: t('dashboard.nav.cart'), icon: ShoppingCart },
    { to: '/dashboard/purchases', label: t('dashboard.nav.purchases'), icon: Package },
    { to: '/dashboard/account', label: t('dashboard.nav.account'), icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  async function handleThemeChange(newTheme: DashboardTheme) {
    setTheme(newTheme);
    try {
      await profileService.updateProfile({ dashboard_theme: newTheme });
    } catch {
      // Profile update may fail — theme still persists locally
    }
  }

  const themeOptions: { value: DashboardTheme; label: string; color: string }[] = [
    { value: 'gray', label: t('dashboard.theme.gray'), color: 'bg-gray-400' },
    { value: 'lime', label: t('dashboard.theme.lime'), color: 'bg-lime-400' },
    { value: 'blueberry', label: t('dashboard.theme.blueberry'), color: 'bg-blueberry-400' },
  ];

  return (
    <>
      <FluidBackground variant={fluidVariant} />

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 p-4 sticky top-0 h-screen">
          <div className="glass-surface rounded-glass-lg flex flex-col flex-1 p-4">
            {/* Brand */}
            <Link to="/dashboard" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900 mb-6 px-2">
              <BrandLogo size="compact" />
              PlanBium
            </Link>

            {/* Nav */}
            <nav className="flex-1 space-y-1" aria-label="Dashboard navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-gray-900/10 text-gray-900 shadow-soft'
                      : 'text-gray-600 hover:bg-gray-900/5 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Theme selector */}
            <div className="mt-4 pt-4 border-t border-gray-300/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('dashboard.theme.label')}
              </p>
              <div className="flex gap-2 px-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-2 transition-all ${
                      theme === opt.value ? 'bg-white/40 shadow-soft' : 'hover:bg-white/20'
                    }`}
                    aria-label={opt.label}
                    aria-pressed={theme === opt.value}
                  >
                    <span className={`h-4 w-4 rounded-full ${opt.color}`} />
                    <span className="text-[10px] font-medium text-gray-600">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User + logout */}
            <div className="mt-4 pt-4 border-t border-gray-300/30">
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
                  {(user?.email ?? '?')[0].toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 truncate" dir="ltr">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50/40 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} className="rtl:rotate-180" aria-hidden="true" />
                {t('dashboard.nav.logout')}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed top-0 inset-x-0 z-40 md:hidden">
          <div className="glass-surface m-2 rounded-glass px-4 py-3 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-base font-extrabold tracking-tight text-gray-900">
              <BrandLogo size="compact" />
              PlanBium
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="rounded-xl p-2 text-gray-700 hover:bg-gray-100/60"
                aria-expanded={mobileNavOpen}
                aria-label={t('nav.menu')}
              >
                {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="glass-surface m-2 mt-1 rounded-glass p-3 animate-fade-in">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.to) ? 'bg-gray-900/10 text-gray-900' : 'text-gray-600 hover:bg-gray-900/5'
                  }`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-300/30">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2 ${theme === opt.value ? 'bg-white/40' : ''}`}
                    aria-pressed={theme === opt.value}
                  >
                    <span className={`h-4 w-4 rounded-full ${opt.color}`} />
                    <span className="text-[10px] text-gray-600">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/40 mt-2 transition-colors"
              >
                <LogOut size={18} className="rtl:rotate-180" aria-hidden="true" />
                {t('dashboard.nav.logout')}
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 pt-16 md:pt-4">
          {/* Desktop top bar with language selector */}
          <div className="hidden md:flex justify-end mb-4">
            <LanguageSelector />
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
