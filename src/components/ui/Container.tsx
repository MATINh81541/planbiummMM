import { type ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

export function Container({ children, size = 'lg', className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}
