/*
 * PlanBium admin entitlements page.
 * List entitlements, revoke access (server-authorized).
 */

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Ban } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { adminService } from '@/lib/services/admin-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

interface AdminEntitlement {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  status: string;
  granted_at: string;
}

export function AdminEntitlementsPage() {
  const { t } = useLocale();
  const [entitlements, setEntitlements] = useState<AdminEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.listEntitlements();
      setEntitlements((result.entitlements as AdminEntitlement[]) ?? []);
    } catch { setEntitlements([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRevoke(id: string) {
    setActionId(id);
    try { await adminService.revokeEntitlement(id); await load(); } finally { setActionId(null); }
  }

  return (
    <Container size="xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('admin.entitlements.title')}</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <GlassCard className="overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-300/30">
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.entitlements.user')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.entitlements.product')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.entitlements.status')}</th>
                <th className="text-end py-3 px-4 font-semibold text-gray-700">{t('admin.products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((e) => (
                <tr key={e.id} className="border-b border-gray-200/20 last:border-0">
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs" dir="ltr">{e.user_id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs" dir="ltr">{e.product_id.substring(0, 8)}...</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      e.status === 'active' ? 'bg-lime-100/60 text-lime-700' : 'bg-gray-100/60 text-gray-500'
                    }`}>{e.status}</span>
                  </td>
                  <td className="py-3 px-4 text-end">
                    {e.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleRevoke(e.id)} disabled={actionId === e.id}>
                        {actionId === e.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                        {t('admin.entitlements.revoke')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </Container>
  );
}
