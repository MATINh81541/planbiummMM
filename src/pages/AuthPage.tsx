/*
 * PlanBium unified auth page.
 *
 * Handles: login, signup, and OTP verification flows.
 * Routes: /login and /signup both render this component.
 *
 * Email OTP flow:
 *   email → request OTP → OTP input → verify → session → destination
 *
 * Google OAuth flow:
 *   click → provider redirect → callback → session → destination
 *
 * Only displays methods that are actually configured (Google button shown
 * only if OAuth is available — we attempt the call and handle errors gracefully).
 *
 * Post-auth destination rules:
 *   - Pending purchase → /dashboard/cart (restores selected product)
 *   - Valid ?next= param → that path
 *   - No pending → /dashboard
 */

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale } from '@/lib/i18n/locale-context';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';

type AuthMode = 'login' | 'signup';
type AuthStep = 'email' | 'otp';

const RESEND_COOLDOWN_SECONDS = 30;

function safeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { t } = useLocale();
  const { user, loading } = useAuth();
  const { pendingProductId } = usePendingPurchase();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const nextPath = safeRedirectPath(new URLSearchParams(location.search).get('next'));

  // Redirect authenticated users away
  useEffect(() => {
    if (loading || !user) return;
    if (pendingProductId) {
      navigate('/dashboard/cart', { replace: true });
    } else {
      navigate(nextPath ?? '/dashboard', { replace: true });
    }
  }, [user, loading, pendingProductId, nextPath, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: mode === 'signup' },
      });
      if (otpError) throw otpError;
      setStep('otp');
      setInfo(t('auth.otpSent'));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError(mode === 'login' ? t('auth.loginFailed') : t('auth.signupFailed'));
    } finally {
      setSubmitting(false);
    }
  }, [email, mode, t]);

  const verifyOtp = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (verifyError) {
        if (verifyError.message.includes('expired')) {
          setError(t('auth.otpExpired'));
        } else {
          setError(t('auth.otpInvalid'));
        }
        return;
      }
      // Success — onAuthStateChange will fire and the redirect effect handles navigation
      // Clear pending purchase only after cart restoration (handled in cart page)
    } catch {
      setError(t('auth.otpInvalid'));
    } finally {
      setSubmitting(false);
    }
  }, [email, otp, t]);

  const handleGoogleAuth = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (googleError) throw googleError;
      // Browser redirects away — no need to setSubmitting(false)
    } catch {
      setError(t('auth.loginFailed'));
      setSubmitting(false);
    }
  }, [t]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === 'email') {
      sendOtp();
    } else {
      verifyOtp();
    }
  }

  const isLogin = mode === 'login';
  const title = isLogin ? t('auth.login.title') : t('auth.signup.title');
  const subtitle = isLogin ? t('auth.login.subtitle') : t('auth.signup.subtitle');

  return (
    <AuthShell>
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>

      {step === 'email' && (
        <>
          {/* Google OAuth */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            ) : null}
            {isLogin ? t('auth.googleLogin') : t('auth.googleSignup')}
          </Button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300/50" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t('auth.orContinueWith')}
            </span>
            <div className="h-px flex-1 bg-gray-300/50" />
          </div>

          {/* Email OTP form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 ps-10 pe-4 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-lime-700">{info}</p>}

            <Button type="submit" variant="primary" size="md" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  {t('auth.sendingOtp')}
                </>
              ) : (
                <>
                  {t('auth.sendOtp')}
                  <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          {/* Switch login/signup */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-semibold text-gray-900 hover:underline"
            >
              {isLogin ? t('auth.signupLink') : t('auth.loginLink')}
            </Link>
          </p>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="mb-6 text-center">
            <button
              onClick={() => { setStep('email'); setError(null); setInfo(null); }}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
              {t('common.back')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.otpSubtitle')}
              </label>
              <input
                id="otp"
                type="text"
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={t('auth.otpPlaceholder')}
                className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 px-4 text-center text-2xl tracking-[0.5em] text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-base focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" variant="primary" size="md" className="w-full" disabled={submitting || otp.length < 6}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.verifyOtp')
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-sm text-gray-400">
                  {t('auth.resendIn')} {cooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t('auth.resendOtp')}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </AuthShell>
  );
}
