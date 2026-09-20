/*
 * PlanBium unified auth page.
 * Email + 6-digit OTP authentication.
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

  const nextPath = safeRedirectPath(
    new URLSearchParams(location.search).get('next')
  );

  useEffect(() => {
    if (loading || !user) return;

    if (pendingProductId) {
      navigate('/dashboard/cart', { replace: true });
    } else {
      navigate(nextPath ?? '/dashboard', { replace: true });
    }
  }, [user, loading, pendingProductId, nextPath, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t('auth.loginFailed'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: mode === 'signup',
        },
      });

      if (otpError) {
        throw otpError;
      }

      setEmail(normalizedEmail);
      setOtp('');
      setStep('otp');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setInfo(t('auth.otpSent'));
    } catch (err) {
      console.error('OTP send error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(
        mode === 'login'
          ? `${t('auth.loginFailed')} (${message})`
          : `${t('auth.signupFailed')} (${message})`
      );
    } finally {
      setSubmitting(false);
    }
  }, [email, mode, t]);

  const verifyOtp = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.replace(/\D/g, '');

    if (normalizedOtp.length !== 6) {
      setError(t('auth.otpInvalid'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const { data, error: verifyError } =
        await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: normalizedOtp,
          type: 'email',
        });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);

        if (
          verifyError.message.toLowerCase().includes('expired')
        ) {
          setError(t('auth.otpExpired'));
        } else {
          setError(`${t('auth.otpInvalid')} (${verifyError.message})`);
        }

        return;
      }

      if (!data.session) {
        setError(t('auth.otpInvalid'));
        return;
      }

      // Successful authentication.
      // useAuth() will receive the new session and redirect automatically.
    } catch (err) {
      console.error('OTP verification error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`${t('auth.otpInvalid')} (${message})`);
    } finally {
      setSubmitting(false);
    }
  }, [email, otp, t]);

  const handleGoogleAuth = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });

      if (googleError) {
        throw googleError;
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError(t('auth.loginFailed'));
      setSubmitting(false);
    }
  }, [t]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (step === 'email') {
      void sendOtp();
    } else {
      void verifyOtp();
    }
  }

  const isLogin = mode === 'login';

  const title = isLogin
    ? t('auth.login.title')
    : t('auth.signup.title');

  const subtitle = isLogin
    ? t('auth.login.subtitle')
    : t('auth.signup.subtitle');

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          {subtitle}
        </p>
      </div>

      {step === 'email' && (
        <>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2
                size={20}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : null}

            {isLogin
              ? t('auth.googleLogin')
              : t('auth.googleSignup')}
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300/50" />

            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {t('auth.orContinueWith')}
            </span>

            <div className="h-px flex-1 bg-gray-300/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t('auth.email')}
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  id="email"
                  type="email"
                  required
                  dir="ltr"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 pe-4 ps-10 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {info && (
              <p className="text-sm text-lime-700">
                {info}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />

                  {t('auth.sendingOtp')}
                </>
              ) : (
                <>
                  {t('auth.sendOtp')}

                  <ArrowRight
                    size={18}
                    className="rtl:rotate-180"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin
              ? t('auth.noAccount')
              : t('auth.haveAccount')}{' '}

            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-semibold text-gray-900 hover:underline"
            >
              {isLogin
                ? t('auth.signupLink')
                : t('auth.loginLink')}
            </Link>
          </p>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError(null);
                setInfo(null);
              }}
              className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <ArrowLeft
                size={16}
                className="rtl:rotate-180"
                aria-hidden="true"
              />

              {t('common.back')}
            </button>
          </div>

          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.otpSubtitle')}
            </p>

            <p
              dir="ltr"
              className="mt-1 font-medium text-gray-900"
            >
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t('auth.otpSubtitle')}
              </label>

              <input
                id="otp"
                type="text"
                required
                dir="ltr"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                placeholder={t('auth.otpPlaceholder')}
                className="w-full rounded-xl border border-gray-300/60 bg-white/40 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 placeholder:text-base placeholder:tracking-normal placeholder:text-gray-300 transition-colors focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={submitting || otp.length !== 6}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />

                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.verifyOtp')
              )}
            </Button>

            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-sm text-gray-400">
                  {t('auth.resendIn')} {cooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={submitting}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 disabled:opacity-50"
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