/*
 * PlanBium auth page shell.
 *
 * Shared layout for login/signup/OTP flows.
 * Gray-dominant fluid background (~40% gray influence).
 * More transparent Liquid Glass with dark frame.
 */

import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FluidBackground } from '@/components/FluidBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { Container } from '@/components/ui/Container';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BrandLogo } from '@/components/BrandLogo';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <>
      <FluidBackground variant="gray" />

      {/* Top bar with brand + language selector */}
      <div className="fixed top-4 inset-x-0 z-50 px-4">
        <Container size="xl">
          <div className="glass-surface rounded-glass-lg px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900">
              <BrandLogo size="compact" />
              PlanBium
            </Link>
            <LanguageSelector />
          </div>
        </Container>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
        <Container size="sm">
          <GlassCard variant="strong" highlight className="p-8 sm:p-10 animate-fade-in-up">
            {children}
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
