/*
 * PlanBium About section.
 * Polished Liquid Glass elements, generous spacing, premium typography.
 */

import { CalendarHeart, LayoutGrid, Compass, Palette } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

export function AboutSection() {
  const { t } = useLocale();

  const items = [
    { icon: CalendarHeart, title: t('about.whatIsTitle'), body: t('about.whatIsBody') },
    { icon: LayoutGrid, title: t('about.whatItProvidesTitle'), body: t('about.whatItProvidesBody') },
    { icon: Compass, title: t('about.whyPlanningTitle'), body: t('about.whyPlanningBody') },
    { icon: Palette, title: t('about.whyBeautifulTitle'), body: t('about.whyBeautifulBody') },
  ];

  return (
    <section id="about" className="relative px-4 py-24 scroll-mt-24">
      <Container size="lg">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-500 text-pretty">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <GlassCard
              key={i}
              highlight
              className="p-8 transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1 animate-fade-in-up"
            >
              <div className="flex items-start gap-5">
                <div className="flex flex-shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-100 to-lime-200 text-lime-700">
                  <item.icon size={24} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-pretty">{item.body}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
