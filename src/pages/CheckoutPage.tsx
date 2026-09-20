/*
 * PlanBium checkout page.
 *
 * Server-authoritative checkout via the planbium-checkout edge function.
 * Flow: create session → confirm billing country → show prices/methods → pay.
 * The client never sends prices, currency, or totals — only billing country.
 * Changing language NEVER changes payment region (enforced server-side).
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CreditCard, Globe, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { checkoutService } from '@/lib/services/checkout-service';
import { paymentService, type PaymentInitResponse } from '@/lib/services/payment-service';
import { getCountryConfig } from '@/lib/config/countries';
import type { CheckoutResponse } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const SUPPORTED_COUNTRIES = ['IR', 'NL', 'ES', 'CN', 'US', 'GB', 'CA', 'AU', 'SA', 'AE', 'EG', 'IQ'];

const METHOD_LABELS: Record<string, string> = {
  'zarinpal-card': 'Zarinpal (Card)',
  'stripe-card': 'Credit / Debit Card',
  paypal: 'PayPal',
};

export function CheckoutPage() {
  const { t, formatCurrency } = useLocale();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [changingCountry, setChangingCountry] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Create checkout session on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await checkoutService.createCheckout();
        setCheckout(result);
        if (result.status === 'needs_country' && result.billingCountry) {
          setSelectedCountry(result.billingCountry);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Checkout failed';
        if (msg.includes('cart_empty') || msg.includes('cart_not_found')) {
          navigate('/dashboard/cart');
          return;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleConfirmCountry = useCallback(async () => {
    if (!checkout?.sessionId || !selectedCountry) return;
    setChangingCountry(true);
    setError(null);
    try {
      const result = await checkoutService.confirmCountry(checkout.sessionId, selectedCountry);
      setCheckout(result);
      setSelectedMethod('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update country');
    } finally {
      setChangingCountry(false);
    }
  }, [checkout?.sessionId, selectedCountry]);

  const handlePay = useCallback(async () => {
    if (!checkout?.sessionId || !selectedMethod) return;
    setPaying(true);
    setPayError(null);
    try {
      const result: PaymentInitResponse = await paymentService.initiatePayment(
        checkout.sessionId,
        selectedMethod,
      );
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        navigate(`/dashboard/checkout/result?order=${result.orderId}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      if (msg.includes('provider_unavailable')) {
        setPayError(t('error.provider_unavailable'));
      } else if (msg.includes('price_changed')) {
        setPayError(t('error.price_changed'));
        // Re-fetch checkout state
        if (checkout?.sessionId) {
          const refreshed = await checkoutService.getCheckout(checkout.sessionId);
          setCheckout(refreshed);
        }
      } else if (msg.includes('method_not_allowed')) {
        setPayError(t('error.method_not_allowed'));
      } else {
        setPayError(msg);
      }
    } finally {
      setPaying(false);
    }
  }, [checkout?.sessionId, selectedMethod, navigate, t]);

  // Loading state
  if (loading) {
    return (
      <Container size="md">
        <div className="py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-48 w-full mb-4 rounded-glass" />
          <Skeleton className="h-32 w-full rounded-glass" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md">
        <div className="py-8">
          <GlassCard className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto text-red-500 mb-3" aria-hidden="true" />
            <p className="text-gray-700 mb-4">{error}</p>
            <Button variant="primary" size="md" onClick={() => navigate('/dashboard/cart')}>
              {t('checkoutResult.backToCart')}
            </Button>
          </GlassCard>
        </div>
      </Container>
    );
  }

  if (!checkout) return null;

  const needsCountry = checkout.status === 'needs_country';
  const isReady = checkout.status === 'ready';
  const isExpired = checkout.status === 'expired';
  const hasUnavailable = checkout.unavailableProducts.length > 0;
  const hasMethods = checkout.allowedMethods.length > 0;
  const canPay = isReady && hasMethods && selectedMethod && !hasUnavailable;

  if (isExpired) {
    return (
      <Container size="md">
        <div className="py-8">
          <GlassCard className="p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkout.expired')}</h1>
            <p className="text-gray-500 mb-4">{t('checkout.expiredDescription')}</p>
            <Button variant="primary" size="md" onClick={() => navigate('/dashboard/cart')}>
              {t('checkout.startNew')}
            </Button>
          </GlassCard>
        </div>
      </Container>
    );
  }

  return (
    <Container size="md">
      <div className="py-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('checkout.title')}</h1>

        <div className="space-y-4">
          {/* Billing Country */}
          <GlassCard variant="strong" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-gray-600" aria-hidden="true" />
              <h2 className="text-lg font-bold text-gray-900">{t('checkout.billingCountry')}</h2>
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={changingCountry}
              className="w-full rounded-xl border border-gray-300/60 bg-white/40 py-3 px-4 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors disabled:opacity-50"
            >
              <option value="">{t('checkout.selectCountry')}</option>
              {SUPPORTED_COUNTRIES.map((code) => (
                <option key={code} value={code}>{code} — {getCountryConfig(code).defaultLocale}</option>
              ))}
            </select>

            {needsCountry && selectedCountry && (
              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                onClick={handleConfirmCountry}
                disabled={changingCountry}
              >
                {changingCountry ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    {t('checkout.changingCountry')}
                  </>
                ) : (
                  <>
                    {t('checkout.confirmCountry')}
                    <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}

            {!needsCountry && checkout.billingCountry && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCountry(checkout.billingCountry ?? '');
                    // Allow re-confirmation by switching back to needs_country display
                    setCheckout({ ...checkout, status: 'needs_country' });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" />
                  {t('common.back')}
                </button>
                <span className="text-sm text-gray-600">
                  {checkout.billingCountry} → {checkout.region} → {checkout.currency}
                </span>
              </div>
            )}
          </GlassCard>

          {/* Order Summary + Payment Methods (only when country confirmed) */}
          {!needsCountry && isReady && (
            <>
              {/* Order Summary */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>
                <div className="space-y-2">
                  {checkout.pricedLines.map((line) => (
                    <div key={line.product_id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-200/30 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{line.product_name}</p>
                        <p className="text-xs text-gray-400">× {line.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(line.total_amount_minor, line.currency)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-300/30 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{t('checkout.total')}</span>
                  <span className="text-xl font-extrabold text-gray-900">
                    {checkout.total !== null ? formatCurrency(checkout.total, checkout.currency ?? 'USD') : '—'}
                  </span>
                </div>
              </GlassCard>

              {/* Unavailable products warning */}
              {hasUnavailable && (
                <GlassCard className="p-4 border-l-4 border-l-amber-400">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-gray-700">{t('checkout.unavailableWarning')}</p>
                  </div>
                </GlassCard>
              )}

              {/* Payment Methods */}
              {!hasUnavailable && (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={20} className="text-gray-600" aria-hidden="true" />
                    <h2 className="text-lg font-bold text-gray-900">{t('checkout.paymentMethod')}</h2>
                  </div>

                  {hasMethods ? (
                    <div className="space-y-2">
                      {checkout.allowedMethods.map((methodId) => (
                        <button
                          key={methodId}
                          onClick={() => setSelectedMethod(methodId)}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start transition-all ${
                            selectedMethod === methodId
                              ? 'bg-gray-900/10 ring-2 ring-gray-400/40 shadow-soft'
                              : 'bg-white/20 hover:bg-white/30'
                          }`}
                          aria-pressed={selectedMethod === methodId}
                        >
                          <span className={`flex h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                            selectedMethod === methodId ? 'border-gray-700 bg-gray-700' : 'border-gray-300'
                          }`}>
                            {selectedMethod === methodId && (
                              <span className="h-2 w-2 rounded-full bg-white m-auto" />
                            )}
                          </span>
                          <span className="font-medium text-gray-800">
                            {METHOD_LABELS[methodId] ?? methodId}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="font-medium text-gray-700">{t('checkout.noMethods')}</p>
                      <p className="text-sm text-gray-400 mt-1">{t('checkout.noMethodsDescription')}</p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Pay button */}
              {canPay && (
                <GlassCard variant="strong" className="p-6">
                  {payError && (
                    <div className="mb-4 glass-surface rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} aria-hidden="true" />
                      {payError}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                    <Lock size={14} aria-hidden="true" />
                    {t('checkout.continueToPay')}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePay}
                    disabled={paying}
                  >
                    {paying ? (
                      <>
                        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                        {t('checkout.paying')}
                      </>
                    ) : (
                      <>
                        {t('checkout.pay')}
                        {checkout.total !== null ? ` ${formatCurrency(checkout.total, checkout.currency ?? 'USD')}` : ''}
                        <ArrowRight size={20} className="rtl:rotate-180" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
