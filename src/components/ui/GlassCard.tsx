import { type HTMLAttributes, type ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'strong';
  highlight?: boolean;
}

export function GlassCard({ children, variant = 'default', highlight = false, className = '', ...props }: GlassCardProps) {
  const surfaceClass = variant === 'strong' ? 'glass-surface-strong' : 'glass-surface';
  const highlightClass = highlight ? 'glass-highlight' : '';
  return (
    <div
      className={`${surfaceClass} ${highlightClass} rounded-glass-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
