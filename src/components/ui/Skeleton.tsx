interface SkeletonProps {
  className?: string;
  rounded?: 'default' | 'lg' | 'full';
}

const roundedClasses = {
  default: 'rounded-lg',
  lg: 'rounded-glass',
  full: 'rounded-full',
};

export function Skeleton({ className = '', rounded = 'default' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${roundedClasses[rounded]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-surface rounded-glass-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-10 w-full rounded-glass" />
    </div>
  );
}
