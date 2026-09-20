/*
 * PlanBium floating Liquid Glass header.
 *
 * Navigation: Home, Pricing, About, FAQ, Login/Signup.
 * About/FAQ use smooth-scroll to homepage sections with header offset.
 * Active page is clearly indicated with elegance.
 */

import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BrandLogo } from '@/components/BrandLogo';

export function Header() {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const scrollToSection = useCallback((hash: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for homepage to mount before scrolling
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname, navigate]);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection('#about');
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection('#faq');
  };

  type NavItem = { to: string; label: string } | { label: string; onClick: (e: React.MouseEvent) => void };

  const navItems: NavItem[] = [
    { to: '/', label: t('nav.home') },
    { to: '/pricing', label: t('nav.pricing') },
    { label: t('nav.about'), onClick: handleAboutClick },
    { label: t('nav.faq'), onClick: handleFaqClick },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <Container size="xl">
        <nav className="glass-surface rounded-glass-lg px-4 py-3 sm:px-6 sm:py-3.5" aria-label="Main navigation">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
              <BrandLogo size="compact" />
              <span className="hidden sm:inline">PlanBium</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) =>
                'to' in item ? (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive(item.to)
                        ? 'bg-gray-100/80 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100/50 hover:text-gray-900"
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">{t('nav.signup')}</Button>
                </Link>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex md:hidden items-center justify-center rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100/80"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? t('nav.close') : t('nav.menu')}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="mt-3 space-y-1 border-t border-gray-200/50 pt-3 md:hidden animate-fade-in">
              {navItems.map((item) =>
                'to' in item ? (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-gray-100/80 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100/50'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="block w-full text-start rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100/50 transition-colors"
                  >
                    {item.label}
                  </button>
                ),
              )}
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">{t('nav.signup')}</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
}
