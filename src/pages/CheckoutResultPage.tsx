/*
 * PlanBium checkout result page.
 *
 * Reads server state — the browser return page is display only.
 * Polls with controlled backoff when payment is pending.
 * Shows: processing, success, failed, cancelled, expired states.
 * Never grants entitlement directly — that happens server-side.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { paymentService } from '@/lib/services/payment-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 3000;

export function CheckoutResultPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order') ?? '';

  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [paymentStatus, setPaymentStatus] = useState<string>('processing');
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    if (!orderId) return;
    try {
      const result = await paymentService.verifyPayment(orderId);
      setOrderStatus(result.orderStatus);
      setPaymentStatus(result.paymentStatus);
      setLoading(false);

      if (result.paymentStatus === 'processing' || result.paymentStatus === 'initiated') {
        if (pollCount < MAX_POLLS) {
          pollRef.current = setTimeout(() => {
            setPollCount((c) => c + 1);
          }, POLL_INTERVAL_MS);
        }
      }
    } catch {
      setLoading(false);
      setPaymentStatus('failed');
    }
  }, [orderId, pollCount]);

  useEffect(() => {
    poll();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [pollCount, poll]);

  if (!orderId) {
    navigate('/dashboard/cart');
    return null;
  }

  if (loading) {
    return (
      <Container size="sm">
        <div className="py-12 flex justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" aria-hidden="true" />
        </div>
      </Container>
    );
  }

  const isProcessing = paymentStatus === 'processing' || paymentStatus === 'initiated';
  const isPaid = orderStatus === 'paid' || paymentStatus === 'succeeded';
  const isFailed = paymentStatus === 'failed';
  const isCancelled = paymentStatus === 'canceled';
  const isExpired = orderStatus === 'expired';

  return (
    <Container size="sm">
      <div className="py-8">
        <GlassCard variant="strong" className="p-8 text-center">
          {/* Processing */}
          {isProcessing && (
            <>
              <Loader2 size={48} className="mx-auto animate-spin text-gray-500 mb-4" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkoutResult.processing')}</h1>
              <p className="text-gray-500">{t('checkoutResult.processingDescription')}</p>
            </>
          )}

          {/* Success */}
          {isPaid && (
            <>
              <CheckCircle size={48} className="mx-auto text-lime-600 mb-4" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkoutResult.success')}</h1>
              <p className="text-gray-500 mb-6">{t('checkoutResult.successDescription')}</p>
              <Link to="/dashboard/purchases">
                <Button variant="primary" size="md">
                  {t('checkoutResult.viewPurchases')}
                </Button>
              </Link>
            </>
          )}

          {/* Failed */}
          {isFailed && (
            <>
              <XCircle size={48} className="mx-auto text-red-500 mb-4" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkoutResult.failed')}</h1>
              <p className="text-gray-500 mb-6">{t('checkoutResult.failedDescription')}</p>
              <Button variant="primary" size="md" onClick={() => navigate('/dashboard/cart')}>
                {t('checkoutResult.retry')}
              </Button>
            </>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <>
              <Clock size={48} className="mx-auto text-amber-500 mb-4" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkoutResult.cancelled')}</h1>
              <p className="text-gray-500 mb-6">{t('checkoutResult.cancelledDescription')}</p>
              <Button variant="secondary" size="md" onClick={() => navigate('/dashboard/cart')}>
                {t('checkoutResult.backToCart')}
              </Button>
            </>
          )}

          {/* Expired */}
          {isExpired && (
            <>
              <Clock size={48} className="mx-auto text-gray-400 mb-4" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('checkoutResult.expired')}</h1>
              <p className="text-gray-500 mb-6">{t('checkoutResult.expiredDescription')}</p>
              <Button variant="primary" size="md" onClick={() => navigate('/dashboard/cart')}>
                {t('checkout.startNew')}
              </Button>
            </>
          )}
        </GlassCard>

        {/* Polling indicator */}
        {isProcessing && pollCount > 0 && (
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <RefreshCw size={12} className="animate-spin" aria-hidden="true" />
            {pollCount} / {MAX_POLLS}
          </p>
        )}
      </div>
    </Container>
  );
}
