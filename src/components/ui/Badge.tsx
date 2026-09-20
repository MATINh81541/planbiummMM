import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'lime' | 'blueberry' | 'gray';
  className?: string;
}

const variantClasses = {
  lime: 'bg-lime-100 text-lime-700 border-lime-200',
  blueberry: 'bg-blueberry-100 text-blueberry-700 border-blueberry-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
