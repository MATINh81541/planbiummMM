/*
 * PlanBium admin payments page.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { adminService } from '@/lib/services/admin-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

interface AdminPayment {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  provider_reference: string | null;
  status: string;
  amount_minor: number;
  currency: string;
  created_at: string;
}

export function AdminPaymentsPage() {
  const { t, formatCurrency } = useLocale();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await adminService.listPayments();
        setPayments((result.payments as AdminPayment[]) ?? []);
      } catch { setPayments([]); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Container size="xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('admin.payments.title')}</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <GlassCard className="overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-300/30">
                <th className="text-start py-3 px-4 font-semibold text-gray-700">ID</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.payments.provider')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.payments.method')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.payments.reference')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-200/20 last:border-0">
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs" dir="ltr">{p.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-gray-700">{p.provider}</td>
                  <td className="py-3 px-4 text-gray-600">{p.method}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.status === 'succeeded' ? 'bg-lime-100/60 text-lime-700' :
                      p.status === 'failed' ? 'bg-red-100/60 text-red-600' :
                      'bg-amber-100/60 text-amber-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(p.amount_minor, p.currency)}</td>
                  <td className="py-3 px-4 font-mono text-gray-400 text-xs" dir="ltr">{p.provider_reference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </Container>
  );
}
