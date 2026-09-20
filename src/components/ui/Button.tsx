import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'glass';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-soft active:scale-[0.98]',
  secondary: 'bg-white/80 text-gray-900 border border-gray-200 hover:bg-white hover:shadow-soft active:scale-[0.98]',
  ghost: 'text-gray-700 hover:bg-gray-100 active:scale-[0.98]',
  glass: 'glass-surface text-gray-900 hover:shadow-glass-hover active:scale-[0.98] transition-all duration-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-glass',
  lg: 'px-8 py-4 text-lg rounded-glass',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
