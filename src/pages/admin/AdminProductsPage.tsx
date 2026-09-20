/*
 * PlanBium admin products page.
 * List, archive, activate products. Uses the same products table as customer flows.
 */

import { useEffect, useState, useCallback } from 'react';
import { Archive, CheckCircle, Loader2, Plus } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { adminService } from '@/lib/services/admin-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

interface AdminProduct {
  id: string;
  slug: string;
  status: string;
  created_at: string;
}

export function AdminProductsPage() {
  const { t } = useLocale();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.listProducts();
      setProducts((result.products as AdminProduct[]) ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleArchive(id: string) {
    setActionId(id);
    try { await adminService.archiveProduct(id); await load(); } finally { setActionId(null); }
  }

  async function handleActivate(id: string) {
    setActionId(id);
    try { await adminService.activateProduct(id); await load(); } finally { setActionId(null); }
  }

  async function handleCreate() {
    if (!newSlug.trim()) return;
    setCreating(true);
    try { await adminService.createProduct(newSlug.trim()); setNewSlug(''); await load(); } finally { setCreating(false); }
  }

  return (
    <Container size="xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('admin.products.title')}</h1>

      {/* Create new product */}
      <GlassCard className="p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="product-slug"
          dir="ltr"
          className="flex-1 rounded-xl border border-gray-300/60 bg-white/40 py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
        />
        <Button variant="primary" size="md" onClick={handleCreate} disabled={creating || !newSlug.trim()}>
          {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Create
        </Button>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <GlassCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300/30">
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.products.slug')}</th>
                <th className="text-start py-3 px-4 font-semibold text-gray-700">{t('admin.products.status')}</th>
                <th className="text-end py-3 px-4 font-semibold text-gray-700">{t('admin.products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-200/20 last:border-0">
                  <td className="py-3 px-4 font-mono text-gray-800" dir="ltr">{p.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.status === 'active' ? 'bg-lime-100/60 text-lime-700' :
                      p.status === 'archived' ? 'bg-gray-100/60 text-gray-500' :
                      'bg-amber-100/60 text-amber-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 text-end">
                    {p.status === 'active' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleArchive(p.id)} disabled={actionId === p.id}>
                        {actionId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                        {t('admin.products.archive')}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleActivate(p.id)} disabled={actionId === p.id}>
                        {actionId === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {t('admin.products.activate')}
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
