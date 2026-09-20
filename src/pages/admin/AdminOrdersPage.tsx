/*
 * PlanBium admin orders page.
 * Lists all orders with status, user, total, region, date.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { adminService } from '@/lib/services/admin-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  billing_country: string | null;
  payment_region_id: string | null;
  currency: string;
  total_amount_minor: number;
  created_at: string;
}

export function AdminOrdersPage() {
  const { t, formatCurrency } = useLocale();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await adminService.listOrders();
        setOrders((result.orders as AdminOrder[]) ?? []);
      } catch { setOrders([]); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Container size="xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('admin.orders.title')}</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <GlassCard className="overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-300/30">
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.orderId')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.user')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.status')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.region')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.total')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.orders.date')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-200/20 last:border-0">
                  <td className="py-3 px-4 font-mono text-gray-800 text-xs" dir="ltr">{o.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs" dir="ltr">{o.user_id.substring(0, 8)}...</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      o.status === 'paid' ? 'bg-lime-100/60 text-lime-700' :
                      o.status === 'pending' ? 'bg-amber-100/60 text-amber-700' :
                      'bg-gray-100/60 text-gray-500'
                    }`}>{o.status}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{o.payment_region_id ?? '—'}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(o.total_amount_minor, o.currency)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </Container>
  );
}
