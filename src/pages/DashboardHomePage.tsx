/*
 * PlanBium dashboard home.
 *
 * Shows a welcome message and quick links.
 */

import { Link } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuth } from '@/lib/auth/auth-context';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

export function DashboardHomePage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const quickLinks = [
    { to: '/dashboard/pricing', label: t('dashboard.nav.pricing'), icon: LayoutGrid },
    { to: '/dashboard/cart', label: t('dashboard.nav.cart'), icon: ShoppingCart },
    { to: '/dashboard/purchases', label: t('dashboard.nav.purchases'), icon: Package },
  ];

  return (
    <Container size="lg">
      <div className="py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
          {t('dashboard.welcome')}, {user?.email?.split('@')[0] ?? ''}
        </h1>
        <p className="text-gray-500 mb-8">{t('dashboard.title')}</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <GlassCard
                highlight
                className="p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200/50 text-gray-600">
                  <link.icon size={24} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{link.label}</p>
                </div>
                <ArrowRight size={20} className="text-gray-400 rtl:rotate-180" aria-hidden="true" />
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
