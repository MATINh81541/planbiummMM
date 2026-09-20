const LOGO_SRC = '/assets/logo/photo_2026-09-20_10-50-15.jpg';

interface BrandLogoProps {
  size?: 'compact' | 'default' | 'large';
  className?: string;
}

const sizeClasses = {
  compact: 'h-10 w-10',
  default: 'h-14 w-14',
  large: 'h-24 w-24',
} as const;

export function BrandLogo({ size = 'default', className = '' }: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="PlanBium"
      className={`shrink-0 rounded-xl object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}
