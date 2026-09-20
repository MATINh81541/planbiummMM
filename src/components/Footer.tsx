/*
 * PlanBium premium Liquid Glass footer.
 * Continuation of the header's visual language.
 */

import { Link } from 'react-router-dom';
import { useLocale } from '@/lib/i18n/locale-context';
import { Container } from '@/components/ui/Container';
import { BrandLogo } from '@/components/BrandLogo';

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 px-4 pb-6">
      <Container size="xl">
        <div className="glass-surface rounded-glass-lg px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
                <BrandLogo size="compact" />
                PlanBium
              </Link>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('nav.about')}</h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.nav.pricing')}</Link></li>
                <li><Link to="/#about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.nav.about')}</Link></li>
                <li><Link to="/#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.nav.faq')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/legal/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.legal.terms')}</Link></li>
                <li><Link to="/legal/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.legal.privacy')}</Link></li>
                <li><Link to="/legal/refunds" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('footer.legal.refunds')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('nav.contact')}</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('nav.contact')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              &copy; {year} PlanBium. {t('footer.rights')}
            </p>
            <p className="text-xs text-gray-400">
              PlanBium
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
