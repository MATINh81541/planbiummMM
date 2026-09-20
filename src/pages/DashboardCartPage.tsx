/*
 * PlanBium dashboard cart page.
 *
 * Uses the real server-backed cart via cartService.
 * Displays product, localized name, price, currency, quantity, totals.
 * Pending purchase restoration: if a pending product exists (from guest pricing flow),
 * it's added to the cart on mount and the pending state is cleared.
 * Duplicate purchase protection: checks entitlements before adding.
 */

import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuth } from '@/lib/auth/auth-context';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { cartService } from '@/lib/services/cart-service';
import { catalogService } from '@/lib/services/catalog-service';
import { entitlementService } from '@/lib/services/entitlement-service';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { CartItem, Product, ProductTranslation, Price } from '@/lib/types';

interface CartDisplayItem {
  cartItem: CartItem;
  product: Product;
  translation: ProductTranslation | null;
  price: Price | null;
  owned: boolean;
}

export function DashboardCartPage() {
  const { t, locale, formatCurrency } = useLocale();
  const { user } = useAuth();
  const { pendingProductId, clearPending } = usePendingPurchase();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { items: cartItems } = await cartService.getCartWithItems();

      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Enrich with product data, translations, prices, and ownership
      const enriched: CartDisplayItem[] = await Promise.all(
        cartItems.map(async (ci) => {
          // Fetch product directly by ID
          const { data: prod } = await supabase
            .from('products')
            .select('*')
            .eq('id', ci.product_id)
            .maybeSingle();

          const p = prod as Product | null;
          const translation = p ? await catalogService.getBestTranslation(p.id, locale) : null;
          const prices = p ? await catalogService.getPrices(p.id) : [];
          const owned = await entitlementService.hasEntitlement(ci.product_id);

          return {
            cartItem: ci,
            product: p ?? { id: ci.product_id, slug: '', status: 'archived', metadata: {}, created_at: '', updated_at: '' },
            translation,
            price: prices[0] ?? null,
            owned,
          };
        }),
      );

      setItems(enriched);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // Pending purchase restoration on mount
  useEffect(() => {
    if (!pendingProductId || !user) return;
    setRestoring(true);
    (async () => {
      try {
        // Check if already owned (duplicate purchase protection)
        const owned = await entitlementService.hasEntitlement(pendingProductId);
        if (!owned) {
          await cartService.addItem(pendingProductId);
        }
        clearPending();
      } catch {
        // Non-fatal — the user can still browse
      } finally {
        setRestoring(false);
      }
    })();
  }, [pendingProductId, user, clearPending]);

  // Load cart after potential restoration
  useEffect(() => {
    if (!restoring) {
      loadCart();
    }
  }, [loadCart, restoring]);

  async function handleRemove(itemId: string) {
    setRemovingId(itemId);
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  }

  const totalMinor = items.reduce((sum, item) => {
    if (!item.price || item.owned) return sum;
    return sum + item.price.amount_minor * item.cartItem.quantity;
  }, 0);
  const currency = items.find((i) => i.price)?.price?.currency ?? 'USD';

  if (loading || restoring) {
    return (
      <Container size="lg">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-400" aria-hidden="true" />
          <span className="ms-3 text-gray-500">{t('cart.loading')}</span>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="md">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-gray-200/50 text-gray-400 mb-5">
            <ShoppingCart size={32} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h1>
          <p className="text-gray-500 mb-6">{t('cart.emptyDescription')}</p>
          <Link to="/dashboard/pricing">
            <Button variant="primary" size="md">
              {t('cart.browsePlanners')}
              <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{t('cart.title')}</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <GlassCard key={item.cartItem.id} className="p-5 flex items-center gap-4">
            {/* Product info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.translation?.name ?? item.product.slug}
                </h3>
                {item.owned && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 bg-lime-100/60 rounded-full px-2 py-0.5">
                    <CheckCircle size={12} aria-hidden="true" />
                    {t('purchases.purchased')}
                  </span>
                )}
              </div>
              {item.translation?.tagline && (
                <p className="text-sm text-gray-500 truncate">{item.translation.tagline}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-end">
              {item.price && !item.owned ? (
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.price.amount_minor, item.price.currency)}
                </p>
              ) : item.owned ? (
                <p className="text-sm text-gray-400">{t('purchases.purchased')}</p>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
              <p className="text-xs text-gray-400">{t('pricing.perPeriod')}</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemove(item.cartItem.id)}
              disabled={removingId === item.cartItem.id}
              className="flex-shrink-0 rounded-xl p-2 text-gray-400 hover:bg-red-50/40 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label={t('cart.remove')}
            >
              {removingId === item.cartItem.id ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={18} aria-hidden="true" />
              )}
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Total + checkout */}
      {!items.every((i) => i.owned) && (
        <GlassCard variant="strong" className="mt-6 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('cart.total')}</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {formatCurrency(totalMinor, currency)}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/checkout')}>
            {t('cart.checkout')}
            <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
          </Button>
        </GlassCard>
      )}
    </Container>
  );
}

// Helper: fetch product by ID directly from Supabase
import { supabase } from '@/lib/supabase-client';
