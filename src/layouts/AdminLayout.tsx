/*
 * PlanBium admin layout.
 * Horizontal glass nav for admin sections.
 */

import { type ReactNode, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, CreditCard, KeyRound, Users, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale } from '@/lib/i18n/locale-context';
import { FluidBackground } from '@/components/FluidBackground';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BrandLogo } from '@/components/BrandLogo';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useLocale();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/admin/products', label: t('admin.nav.products'), icon: Package },
    { to: '/admin/orders', label: t('admin.nav.orders'), icon: ShoppingBag },
    { to: '/admin/payments', label: t('admin.nav.payments'), icon: CreditCard },
    { to: '/admin/entitlements', label: t('admin.nav.entitlements'), icon: KeyRound },
    { to: '/admin/users', label: t('admin.nav.users'), icon: Users },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <FluidBackground variant="gray" />

      <div className="fixed top-3 inset-x-0 z-50 px-3">
        <div className="mx-auto max-w-7xl">
          <div className="glass-surface rounded-glass px-4 py-3 flex items-center justify-between gap-4">
            <Link to="/admin/products" className="flex items-center gap-2 text-base font-extrabold tracking-tight text-gray-900">
              <BrandLogo size="compact" />
              PlanBium <span className="text-xs text-gray-400 font-normal ms-1">Admin</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.to) ? 'bg-gray-900/10 text-gray-900' : 'text-gray-600 hover:bg-gray-100/50'
                  }`}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Link to="/dashboard" className="hidden sm:inline-flex text-sm text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="hidden sm:inline-flex text-sm text-gray-500 hover:text-red-500"
              >
                {t('dashboard.nav.logout')}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden rounded-xl p-2 text-gray-700"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="glass-surface mt-1 rounded-glass p-3 md:hidden animate-fade-in">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.to) ? 'bg-gray-900/10 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="pt-20 px-4 pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </>
  );
}
