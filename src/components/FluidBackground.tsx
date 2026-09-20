/*
 * PlanBium fluid background.
 *
 * Creates a fluid abstract composition with organic gradients and floating shapes.
 * Three variants: lime (homepage), blueberry (pricing), gray (auth).
 *
 * Color balance target: ~40% accent influence, ~60% white/neutral.
 * Uses CSS transforms + opacity for GPU-friendly motion.
 * Respects prefers-reduced-motion (handled in CSS).
 */

import { useMemo } from 'react';

type Variant = 'lime' | 'blueberry' | 'gray';

export type FluidBackgroundVariant = Variant;

interface FluidBackgroundProps {
  variant?: Variant;
}

const palettes = {
  lime: {
    base: 'from-lime-100 via-lime-50 to-lime-200',
    overlay: 'from-lime-200/30 via-transparent to-lime-100/40',
    shapes: [
      'bg-lime-300/50',
      'bg-lime-400/35',
      'bg-lime-200/50',
      'bg-lime-500/20',
      'bg-lime-300/40',
    ],
  },
  blueberry: {
    base: 'from-blueberry-100 via-blueberry-50 to-blueberry-200',
    overlay: 'from-blueberry-200/30 via-transparent to-blueberry-100/40',
    shapes: [
      'bg-blueberry-300/50',
      'bg-blueberry-400/35',
      'bg-blueberry-200/50',
      'bg-blueberry-500/20',
      'bg-blueberry-300/40',
    ],
  },
  gray: {
    base: 'from-gray-100 via-gray-50 to-gray-200',
    overlay: 'from-gray-200/30 via-transparent to-gray-100/40',
    shapes: [
      'bg-gray-300/50',
      'bg-gray-400/30',
      'bg-gray-200/50',
      'bg-gray-500/15',
      'bg-gray-300/40',
    ],
  },
};

export function FluidBackground({ variant = 'lime' }: FluidBackgroundProps) {
  const palette = palettes[variant];

  const shapes = useMemo(
    () => [
      { class: `top-[-10%] start-[5%] w-[550px] h-[550px] rounded-full ${palette.shapes[0]}`, anim: 'animate-float-slow' },
      { class: `top-[15%] end-[-8%] w-[480px] h-[480px] rounded-full ${palette.shapes[1]}`, anim: 'animate-float-medium' },
      { class: `top-[40%] start-[8%] w-[400px] h-[400px] rounded-[40%_60%_60%_40%/40%_50%_60%_50%] ${palette.shapes[2]}`, anim: 'animate-float-fast' },
      { class: `bottom-[-5%] end-[10%] w-[500px] h-[500px] rounded-full ${palette.shapes[3]}`, anim: 'animate-float-slow' },
      { class: `top-[55%] start-[35%] w-[380px] h-[380px] rounded-[50%_50%_40%_60%/60%_40%_50%_50%] ${palette.shapes[4]}`, anim: 'animate-float-medium' },
      { class: `bottom-[20%] start-[30%] w-[320px] h-[320px] rounded-full ${palette.shapes[0]}`, anim: 'animate-float-fast' },
    ],
    [palette],
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient — strong color presence */}
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.base}`} />

      {/* Color overlay for additional depth */}
      <div className={`absolute inset-0 bg-gradient-to-t ${palette.overlay}`} />

      {/* Soft white veils to maintain ~60% neutral balance */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-white/20 to-white/25" />

      {/* Floating organic shapes — large and visible */}
      {shapes.map((shape, i) => (
        <div
          key={i}
          className={`absolute ${shape.class} ${shape.anim} blur-3xl`}
          style={{ animationDelay: `${i * 1.2}s` }}
          aria-hidden="true"
        />
      ))}

      {/* Subtle grain overlay for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
