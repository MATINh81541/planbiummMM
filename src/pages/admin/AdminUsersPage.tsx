/*
 * PlanBium admin users page.
 * Lists user profiles with role.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { adminService } from '@/lib/services/admin-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

interface AdminUser {
  user_id: string;
  display_name: string | null;
  preferred_locale: string | null;
  billing_country: string | null;
  role: string;
  created_at: string;
}

export function AdminUsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await adminService.listUsers();
        setUsers((result.users as AdminUser[]) ?? []);
      } catch { setUsers([]); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Container size="xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('admin.users.title')}</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <GlassCard className="overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-300/30">
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.entitlements.user')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.users.role')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">Locale</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">Country</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-gray-200/20 last:border-0">
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs" dir="ltr">{u.user_id.substring(0, 8)}...</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'admin' ? 'bg-blueberry-100/60 text-blueberry-700' : 'bg-gray-100/60 text-gray-500'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.preferred_locale ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{u.billing_country ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </Container>
  );
}
