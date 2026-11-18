/*
 * PlanBium dashboard purchases page.
 *
 * Two sections:
 * 1. "My Products" — entitlements joined with catalog info, each with a Download button.
 * 2. "Order History" — expandable order cards with status badges and actions.
 *
 * Orders are loaded with their items in ONE call (listOrders returns items).
 * Entitlements are loaded in ONE call. No per-order loops.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Download, Loader2, ChevronDown, ChevronUp, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { orderService, entitlementService, requestDownloadUrl } from '@/lib/services/entitlement-service';
import { catalogService } from '@/lib/services/catalog-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/components/ui/Toast';
import type { Order, OrderItem, Entitlement } from '@/lib/types';

interface MyProduct {
  entitlement: Entitlement;
  productName: string;
  productDescription: string;
}

interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export function DashboardPurchasesPage() {
  const { t, formatCurrency, formatDate, locale } = useLocale();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [myProducts, setMyProducts] = useState<MyProduct[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  useDocumentTitle('page.title.purchases');
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [orderList, entitlements] = await Promise.all([
        orderService.listOrders(),
        entitlementService.listEntitlements(),
      ]);
      setOrders(orderList);

      const products: MyProduct[] = await Promise.all(
        entitlements.map(async (ent) => {
          const translation = await catalogService.getBestTranslation(ent.product_id, locale);
          return {
            entitlement: ent,
            productName: translation?.name ?? ent.product_id,
            productDescription: translation?.tagline ?? '',
          };
        }),
      );
      setMyProducts(products);
    } catch {
      setError(true);
      showToast('error', t('toast.purchasesLoadFailed'));
      setOrders([]);
      setMyProducts([]);
    } finally {
      setLoading(false);
    }
  }, [locale, showToast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDownload(entitlementId: string) {
    setDownloadingId(entitlementId);
    try {
      const result = await requestDownloadUrl(entitlementId);
      window.open(result.url, '_blank');
    } catch {
      showToast('error', t('toast.downloadFailed'));
    } finally {
      setDownloadingId(null);
    }
  }

  function statusBadgeClass(status: string): string {
    if (status === 'paid') return 'bg-lime-100/60 text-lime-700';
    if (status === 'pending') return 'bg-amber-100/60 text-amber-700';
    if (status === 'refunded' || status === 'cancelled' || status === 'expired') return 'bg-red-100/60 text-red-600';
    return 'bg-gray-100/60 text-gray-600';
  }

  function statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: t('purchases.status.pending'),
      paid: t('purchases.status.paid'),
      refunded: t('purchases.status.refunded'),
      cancelled: t('purchases.status.cancelled'),
      expired: t('purchases.status.expired'),
    };
    return map[status] ?? status;
  }

  if (loading) {
    return (
      <Container size="lg">
        <div className="mb-8">
          <div className="h-8 w-48 rounded-glass bg-gray-200/50 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-surface rounded-glass p-6 animate-pulse">
              <div className="h-5 w-32 bg-gray-200/60 rounded mb-3" />
              <div className="h-4 w-48 bg-gray-200/40 rounded mb-6" />
              <div className="h-9 w-28 bg-gray-200/50 rounded-glass" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="glass-surface rounded-glass p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200/50 rounded" />
                <div className="h-4 w-20 bg-gray-200/40 rounded" />
              </div>
              <div className="h-px bg-gray-200/30 mb-4" />
              <div className="h-4 w-full bg-gray-200/30 rounded" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-red-100/50 text-red-500 mb-5">
            <AlertCircle size={32} aria-hidden="true" />
          </div>
          <p className="text-gray-500 mb-6">{t('toast.purchasesLoadFailed')}</p>
          <Button variant="primary" size="md" onClick={loadData}>
            {t('purchases.retry')}
          </Button>
        </div>
      </Container>
    );
  }

  const isEmpty = myProducts.length === 0 && orders.length === 0;

  if (isEmpty) {
    return (
      <Container size="md">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-gray-200/50 text-gray-400 mb-5">
            <Package size={32} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('purchases.empty')}</h1>
          <p className="text-gray-500 mb-6">{t('purchases.emptyDescription')}</p>
          <Link to="/dashboard/pricing">
            <Button variant="primary" size="md">{t('cart.browsePlanners')}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-8">{t('purchases.title')}</h1>

      {/* My Products */}
      {myProducts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('purchases.myProducts')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myProducts.map((p) => (
              <GlassCard key={p.entitlement.id} className="p-6 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-glass bg-lime-100/50 text-lime-600">
                    <Sparkles size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{p.productName}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{p.productDescription}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {t('purchases.purchased')} {formatDate(p.entitlement.granted_at)}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-auto self-start"
                  onClick={() => handleDownload(p.entitlement.id)}
                  disabled={downloadingId === p.entitlement.id}
                >
                  {downloadingId === p.entitlement.id ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Download size={16} aria-hidden="true" />
                  )}
                  {t('purchases.download')}
                </Button>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Order History */}
      {orders.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('purchases.orderHistory')}</h2>
          <div className="space-y-4">
            {orders.map(({ order, items }) => {
              const isExpanded = expandedOrderId === order.id;
              const isPending = order.status === 'pending';
              const isPaid = order.status === 'paid';
              return (
                <GlassCard key={order.id} className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{t('purchases.orderId')}</p>
                        <p className="font-mono text-sm text-gray-700" dir="ltr">
                          {order.id.substring(0, 8)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{t('purchases.date')}</p>
                        <p className="text-sm text-gray-700">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{t('purchases.status')}</p>
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{t('purchases.total')}</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.total_amount_minor, order.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/dashboard/checkout/result?order=${order.id}`)}
                        >
                          <CreditCard size={16} aria-hidden="true" />
                          {t('purchases.continuePayment')}
                        </Button>
                      )}
                      {isPaid && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        >
                          {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                          {t('purchases.viewDetails')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && isPaid && (
                    <div className="mt-4 border-t border-gray-300/30 pt-4 space-y-3">
                      {items.map((item) => {
                        const ent = myProducts.find((p) => p.entitlement.product_id === item.product_id);
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{item.product_name_snapshot}</p>
                              <p className="text-xs text-gray-400">
                                {formatCurrency(item.unit_amount_minor, item.currency)} × {item.quantity}
                              </p>
                            </div>
                            {ent && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(ent.entitlement.id)}
                                disabled={downloadingId === ent.entitlement.id}
                              >
                                {downloadingId === ent.entitlement.id ? (
                                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                ) : (
                                  <Download size={16} aria-hidden="true" />
                                )}
                                {t('purchases.download')}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </section>
      )}
    </Container>
  );
}
