/*
 * PlanBium legal page (terms, privacy, refunds).
 * The visual layout is ready; finalized legal copy will be populated later.
 */

import { FileText } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocale } from '@/lib/i18n/locale-context';

type LegalType = 'terms' | 'privacy' | 'refunds';

interface LegalPageProps {
  type: LegalType;
}

export function LegalPage({ type }: LegalPageProps) {
  const { t } = useLocale();

  const titleKey =
    type === 'terms'
      ? 'legal.terms.title'
      : type === 'privacy'
        ? 'legal.privacy.title'
        : 'legal.refunds.title';

  return (
    <>
      <FluidBackground variant="lime" />
      <div className="px-4 py-12 sm:py-16">
        <Container size="md">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-glass bg-gradient-to-br from-lime-100 to-lime-200 text-lime-700 mb-4">
              <FileText size={32} aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              {t(titleKey)}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>

          <GlassCard variant="strong" className="p-8 sm:p-10">
            <p className="text-gray-600 leading-relaxed text-pretty">
              {t('legal.placeholder')}
            </p>
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
