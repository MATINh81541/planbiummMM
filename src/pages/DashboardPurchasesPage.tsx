/*
 * PlanBium dashboard purchases page.
 *
 * Shows the user's orders and entitlements.
 * Orders come from the server-backed orders table (RLS-scoped to user).
 * Download links go through the download edge function (entitlement-checked).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { orderService, entitlementService, requestDownloadUrl } from '@/lib/services/entitlement-service';
import { supabase } from '@/lib/supabase-client';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { Order, OrderItem, Entitlement } from '@/lib/types';

interface PurchaseDisplay {
  order: Order;
  items: OrderItem[];
  entitlements: Entitlement[];
}

export function DashboardPurchasesPage() {
  const { t, formatCurrency } = useLocale();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseDisplay[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const orders = await orderService.listOrders();
        const enriched: PurchaseDisplay[] = await Promise.all(
          orders.map(async (order) => {
            const { items } = await orderService.getOrder(order.id);
            const entitlements = await entitlementService.listEntitlements();
            const orderEntitlements = entitlements.filter((e) => e.order_id === order.id);
            return { order, items: items ?? [], entitlements: orderEntitlements };
          }),
        );
        setPurchases(enriched);
      } catch {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDownload(entitlementId: string, productId: string) {
    setDownloadingId(entitlementId);
    setDownloadError(null);
    try {
      // Get the active asset for this product
      const { data: assets } = await supabase
        .from('product_assets')
        .select('id')
        .eq('product_id', productId)
        .eq('active', true)
        .eq('asset_type', 'planner')
        .limit(1);

      if (!assets || assets.length === 0) {
        setDownloadError('File not available yet.');
        return;
      }

      const { url } = await requestDownloadUrl(assets[0].id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
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
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-400" aria-hidden="true" />
        </div>
      </Container>
    );
  }

  if (purchases.length === 0) {
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
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('purchases.title')}</h1>

      {downloadError && (
        <div className="mb-4 glass-surface rounded-glass px-4 py-3 text-sm text-red-600">
          {downloadError}
        </div>
      )}

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <GlassCard key={purchase.order.id} className="p-6">
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-gray-400">{t('purchases.orderId')}</p>
                <p className="font-mono text-sm text-gray-700" dir="ltr">
                  {purchase.order.id.substring(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('purchases.date')}</p>
                <p className="text-sm text-gray-700">
                  {new Date(purchase.order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('purchases.status')}</p>
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                  purchase.order.status === 'paid'
                    ? 'bg-lime-100/60 text-lime-700'
                    : purchase.order.status === 'pending'
                      ? 'bg-amber-100/60 text-amber-700'
                      : 'bg-gray-100/60 text-gray-600'
                }`}>
                  {statusLabel(purchase.order.status)}
                </span>
              </div>
              <div className="text-end">
                <p className="text-sm text-gray-400">{t('purchases.total')}</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(purchase.order.total_amount_minor, purchase.order.currency)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-300/30 pt-4 space-y-2">
              {purchase.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.product_name_snapshot}</p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.unit_amount_minor, item.currency)} × {item.quantity}
                    </p>
                  </div>
                  {/* Download button — only for paid orders */}
                  {purchase.order.status === 'paid' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const ent = purchase.entitlements.find((e) => e.product_id === item.product_id);
                        if (ent) handleDownload(ent.id, ent.product_id);
                      }}
                      disabled={downloadingId === purchase.entitlements.find((e) => e.product_id === item.product_id)?.id}
                    >
                      {downloadingId === purchase.entitlements.find((e) => e.product_id === item.product_id)?.id ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Download size={16} aria-hidden="true" />
                      )}
                      {t('purchases.download')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </Container>
  );
}
