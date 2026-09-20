/*
 * PlanBium FAQ section with accordion interaction.
 * Slow, smooth, subtle. Keyboard accessible. Localized content.
 */

import { useLocale } from '@/lib/i18n/locale-context';
import { Container } from '@/components/ui/Container';
import { Accordion } from '@/components/ui/Accordion';

export function FAQSection() {
  const { t } = useLocale();

  const faqItems = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ];

  return (
    <section id="faq" className="relative px-4 py-24 scroll-mt-24">
      <Container size="md">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {t('faq.subtitle')}
          </p>
        </div>

        <Accordion items={faqItems} />
      </Container>
    </section>
  );
}
