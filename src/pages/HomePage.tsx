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
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        // Small delay to ensure layout is ready
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
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
