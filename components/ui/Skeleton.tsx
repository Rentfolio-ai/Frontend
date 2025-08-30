'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} style={style} />;
}

// Property Card Skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={24} className="mb-2" />
          <Skeleton variant="text" width="80%" height={16} />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton variant="text" width="40%" height={14} className="mb-1" />
          <Skeleton variant="text" width="60%" height={20} />
        </div>
        <div>
          <Skeleton variant="text" width="40%" height={14} className="mb-1" />
          <Skeleton variant="text" width="60%" height={20} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={100} height={32} />
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="50%" height={16} className="mb-2" />
          <Skeleton variant="text" width="70%" height={32} className="mb-1" />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" width="60%" height={16} />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 p-4 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="80%" height={16} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="rounded" width={120} height={32} />
      </div>

      <div className="h-64 flex items-end justify-between space-x-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width="100%"
            height={`${Math.random() * 80 + 20}%`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} variant="text" width={40} height={12} />
        ))}
      </div>
    </div>
  );
}
