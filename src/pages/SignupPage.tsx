/*
 * PlanBium sign-up page.
 *
 * Real sign-up form with validation, loading state, error toasts,
 * show/hide password, and demo account quick-access.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { useAuth, AuthError } from '@/lib/auth/auth-context';
import { appConfig } from '@/lib/config/env';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupPage() {
  const { t } = useLocale();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingProductId, clearPending } = usePendingPurchase();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; email?: string; password?: string }>({});

  function validate(): boolean {
    const e: { displayName?: string; email?: string; password?: string } = {};
    if (!displayName.trim() || displayName.trim().length < 2) {
      e.displayName = 'auth.error.displayNameTooShort';
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      e.email = 'auth.error.invalidEmail';
    }
    if (password.length < 6) {
      e.password = 'auth.error.passwordTooShort';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      showToast('success', t('auth.signupSuccess'));
      if (pendingProductId) {
        clearPending();
        navigate('/dashboard/checkout', { replace: true });
      } else {
        const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
        navigate(from ?? '/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof AuthError) {
        showToast('error', t(err.messageKey as never));
      } else {
        showToast('error', t('auth.signupFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    try {
      await signUp('demo@planbium.ir', 'demo123', 'Demo User');
      showToast('success', t('auth.signupSuccess'));
      navigate('/dashboard', { replace: true });
    } catch {
      showToast('error', t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {t('auth.signup.title')}
        </h1>
        <p className="mt-2 text-gray-500">{t('auth.signup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.displayName')}
          </label>
          <input
            id="signup-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('auth.displayNamePlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors"
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{t(errors.displayName as never)}</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.email')}
          </label>
          <input
            id="signup-email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{t(errors.email as never)}</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 pe-11 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{t(errors.password as never)}</p>
          )}
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
          <UserPlus size={18} className="rtl:rotate-180" />
          {loading ? t('auth.signingUp') : t('auth.signUp')}
        </Button>
      </form>

      {appConfig.isDemo && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">{t('auth.orContinueWith')}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <Button variant="secondary" size="md" className="w-full" onClick={handleDemoLogin} disabled={loading}>
            {t('auth.demoLogin')}
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-lime-700 hover:text-lime-800 transition-colors">
          {t('auth.loginLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
