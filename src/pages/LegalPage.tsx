/*
 * PlanBium legal page (terms, privacy, refunds, cookies).
 * Renders sectioned legal content with fixed last-updated dates.
 *
 * <!-- REVIEW WITH A LEGAL ADVISOR BEFORE LAUNCH -->
 */

import { FileText } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocale } from '@/lib/i18n/locale-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { legalDocuments, type LegalType } from '@/lib/legal-content';

interface LegalPageProps {
  type: LegalType;
}

export function LegalPage({ type }: LegalPageProps) {
  const { t, formatDate } = useLocale();
  const doc = legalDocuments[type];

  const titleKey = `legal.${type}.title` as const;
  const pageTitleKey =
    type === 'terms'
      ? 'page.title.terms'
      : type === 'privacy'
        ? 'page.title.privacy'
        : type === 'refunds'
          ? 'page.title.refunds'
          : 'page.title.cookies';

  useDocumentTitle(pageTitleKey);

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
              {t('legal.lastUpdated')}: {formatDate(doc.lastUpdated)}
            </p>
          </div>

          <div className="space-y-6">
            {doc.sections.map((section, i) => (
              <GlassCard key={i} variant="default" className="p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {t(section.headingKey as never)}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((pkey, j) => (
                    <p key={j} className="text-gray-600 leading-relaxed text-pretty">
                      {t(pkey as never)}
                    </p>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* <!-- REVIEW WITH A LEGAL ADVISOR BEFORE LAUNCH --> */}
        </Container>
      </div>
    </>
  );
}
