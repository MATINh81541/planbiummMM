import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/lib/i18n/locale-context';

const letters = 'PlanBium'.split('');

export function Hero() {
  const { t } = useLocale();

  const [visibleLetters, setVisibleLetters] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updateMotion = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotion();

    mediaQuery.addEventListener?.('change', updateMotion);

    return () => {
      mediaQuery.removeEventListener?.('change', updateMotion);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleLetters(letters.length);
      return;
    }

    setVisibleLetters(0);

    const timers: number[] = [];

    letters.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleLetters(index + 1);
      }, 250 + index * 150);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 pb-20 pt-32 sm:px-8"
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(190,255,70,0.55), transparent 32%), radial-gradient(circle at 88% 22%, rgba(175,255,75,0.38), transparent 30%), radial-gradient(circle at 55% 88%, rgba(215,255,170,0.48), transparent 36%), linear-gradient(135deg, #f7fff0 0%, #ffffff 48%, #efffdc 100%)',
      }}
    >
      {/* Background shapes */}
      <div
        className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: 'rgba(170,255,60,0.28)',
          animation: reducedMotion
            ? 'none'
            : 'planbium-safe-float 18s ease-in-out infinite',
        }}
      />

      <div
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: 'rgba(185,255,85,0.22)',
          animation: reducedMotion
            ? 'none'
            : 'planbium-safe-float-reverse 21s ease-in-out infinite',
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: 'rgba(220,255,175,0.32)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center text-center">

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-black/80 bg-white/35 px-5 py-2.5 text-sm font-semibold text-black backdrop-blur-xl"
          style={{
            opacity: 1,
          }}
        >
          <Sparkles
            size={16}
            className="text-lime-700"
            aria-hidden="true"
          />

          <span>{t('brand.tagline')}</span>
        </div>

        {/* PlanBium */}
        <div className="relative z-20 w-full overflow-visible">
          <h1
  aria-label="PlanBium"
  dir="ltr"
  className="mx-auto flex w-fit select-none items-center justify-center whitespace-nowrap font-black text-black"
  style={{
    direction: 'ltr',
    unicodeBidi: 'isolate',
    fontSize: 'clamp(3.8rem, 15vw, 11rem)',
    lineHeight: 0.88,
    letterSpacing: '-0.08em',
  }}
>
  {letters.map((letter, index) => {
    const isVisible = index < visibleLetters;

    return (
      <span
        key={`${letter}-${index}`}
        dir="ltr"
        style={{
          display: 'inline-block',
          direction: 'ltr',
          unicodeBidi: 'isolate',
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? 'translateY(0) scale(1)'
            : 'translateY(-80px) scale(1.18)',
          filter: isVisible
            ? 'blur(0px)'
            : 'blur(12px)',
          transition: reducedMotion
            ? 'none'
            : 'opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1), filter 700ms cubic-bezier(0.16,1,0.3,1)',
          transformOrigin: '50% 80%',
        }}
      >
        {letter}
      </span>
    );
  })}
</h1>
        </div>

        {/* Accent */}
        <div
          className="mt-7 h-[3px] w-[min(260px,55vw)] rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,0,0,0.8), transparent)',
          }}
        />

        {/* Slogan */}
        <p
          className="mx-auto mt-7 max-w-3xl text-balance text-xl font-bold leading-relaxed text-black sm:text-2xl md:text-3xl"
          style={{
            opacity: visibleLetters === letters.length ? 1 : 0,
            transform:
              visibleLetters === letters.length
                ? 'translateY(0)'
                : 'translateY(18px)',
            transition:
              'opacity 700ms ease, transform 700ms ease',
          }}
        >
          {t('hero.slogan')}
        </p>

        {/* Subtitle */}
        <p
          className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-black/70 sm:text-lg"
          style={{
            opacity: visibleLetters === letters.length ? 1 : 0,
            transform:
              visibleLetters === letters.length
                ? 'translateY(0)'
                : 'translateY(18px)',
            transition:
              'opacity 700ms ease 120ms, transform 700ms ease 120ms',
          }}
        >
          {t('hero.subtitle')}
        </p>

        {/* Buttons */}
        <div
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          style={{
            opacity: visibleLetters === letters.length ? 1 : 0,
            transform:
              visibleLetters === letters.length
                ? 'translateY(0)'
                : 'translateY(18px)',
            transition:
              'opacity 700ms ease 240ms, transform 700ms ease 240ms',
          }}
        >
          <Link
            to="/pricing"
            className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full border-2 border-black bg-black px-6 py-4 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-1"
          >
            {t('hero.ctaPrimary')}
            <ArrowRight
              size={19}
              className="rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>

          <a
            href="#about"
            className="inline-flex min-w-[190px] items-center justify-center rounded-full border-2 border-black/70 bg-white/30 px-6 py-4 text-sm font-bold text-black backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1"
          >
            {t('hero.ctaSecondary')}
          </a>
        </div>

        {/* Scroll hint */}
        <div
          className="mt-14 flex flex-col items-center gap-2"
          style={{
            opacity: visibleLetters === letters.length ? 1 : 0,
            transition: 'opacity 700ms ease 400ms',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">
            {t('hero.scrollHint')}
          </span>

          <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-black/50 p-1">
            <div
              className="h-2 w-1 rounded-full bg-black/60"
              style={{
                transform: reducedMotion
                  ? 'translateY(0)'
                  : 'translateY(3px)',
                transition: 'transform 1.4s ease-in-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Safe global keyframes injected outside JSX style parsing */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes planbium-safe-float {
              0%, 100% {
                transform: translate3d(0, 0, 0) scale(1);
              }
              50% {
                transform: translate3d(18px, -14px, 0) scale(1.04);
              }
            }

            @keyframes planbium-safe-float-reverse {
              0%, 100% {
                transform: translate3d(0, 0, 0) scale(1);
              }
              50% {
                transform: translate3d(-20px, 16px, 0) scale(0.96);
              }
            }
          `,
        }}
      />
    </section>
  );
}