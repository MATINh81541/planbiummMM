/*
 * PlanBium homepage.
 * Lime-dominant fluid background.
 * Structure: Header → Hero → About → FAQ → Footer (header/footer in layout).
 * Handles incoming hash navigation (#about, #faq) with header offset.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FluidBackground } from '@/components/FluidBackground';
import { Hero } from '@/components/Hero';
import { AboutSection } from '@/components/AboutSection';
import { FAQSection } from '@/components/FAQSection';

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.replace(/^#/, '');
    if (!sectionId) return;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // Element not rendered yet — retry briefly for late mounts.
      attempts += 1;
      if (attempts < 10) {
        setTimeout(tryScroll, 50);
      }
    };

    // Small initial delay to ensure layout is ready on first load.
    const timer = setTimeout(tryScroll, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [location.hash]);

  return (
    <>
      <FluidBackground variant="lime" />
      <Hero />
      <AboutSection />
      <FAQSection />
    </>
  );
}
