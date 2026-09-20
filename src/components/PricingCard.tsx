/*
 * PlanBium pricing card.
 * Liquid Glass, rounded, premium, readable, soft depth.
 * Shows product name, localized description, features, price, and Continue CTA.
 */

import { ArrowRight, Check, Star } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Product, Price, ProductTranslation } from '@/lib/types';

interface PricingCardProps {
  product: Product;
  translation: ProductTranslation | null;
  price: Price | null;
  isPopular?: boolean;
  onSelect: (productId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  product,
  translation,
  price,
  isPopular = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  const { t, formatCurrency } = useLocale();

  const name = translation?.name ?? product.slug;
  const tagline = translation?.tagline ?? '';
  const description = translation?.description ?? '';
  const features: string[] = translation?.features ?? [];

  const formattedPrice = price
    ? formatCurrency(price.amount_minor, price.currency)
    : '—';

  return (
    <GlassCard
      highlight={isPopular}
      className={`relative flex flex-col p-6 sm:p-7 transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1.5 ${
        isPopular ? 'ring-2 ring-blueberry-400/50' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
          <Badge variant="blueberry" className="shadow-soft">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            {t('pricing.popular')}
          </Badge>
        </div>
      )}

      {/* Name + tagline */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        {tagline && <p className="mt-1 text-sm text-gray-500 font-medium">{tagline}</p>}
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900">{formattedPrice}</span>
          <span className="text-sm text-gray-400">{t('pricing.perPeriod')}</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="mb-5 text-sm text-gray-600 leading-relaxed text-pretty">{description}</p>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-6 flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('pricing.features')}
          </p>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="flex flex-shrink-0 h-5 w-5 items-center justify-center rounded-full bg-lime-100 text-lime-700 mt-0.5">
                  <Check size={12} aria-hidden="true" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <Button
        variant={isPopular ? 'primary' : 'secondary'}
        size="md"
        className="w-full"
        onClick={() => onSelect(product.id)}
        disabled={isLoading}
      >
        {t('pricing.continue')}
        <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
      </Button>
    </GlassCard>
  );
}
