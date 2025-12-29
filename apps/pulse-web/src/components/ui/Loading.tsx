interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'cosmic';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={`${sizeClasses[size]} border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin`}
          />
        );

      case 'dots':
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-cyan-500 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} bg-cyan-500/20 rounded-full animate-ping absolute`}
            />
            <div
              className={`${sizeClasses[size]} bg-cyan-500 rounded-full`}
            />
          </div>
        );

      case 'cosmic':
        return (
          <div className="relative">
            {/* Outer ring */}
            <div
              className={`${sizeClasses[size]} border-2 border-purple-500/30 rounded-full animate-spin`}
              style={{ animationDuration: '3s' }}
            />
            {/* Inner ring */}
            <div
              className={`absolute inset-1 border-2 border-cyan-500/50 rounded-full animate-spin`}
              style={{ animationDuration: '2s', animationDirection: 'reverse' }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderLoader()}
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700 animate-pulse';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton width={60} />
      </div>
      <Skeleton width="40%" height={32} className="mb-2" />
      <Skeleton width="60%" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-slate-700 bg-slate-800/50">
        <Skeleton width="20%" />
        <Skeleton width="30%" />
        <Skeleton width="25%" />
        <Skeleton width="15%" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-slate-700/50">
          <Skeleton width="20%" />
          <Skeleton width="30%" />
          <Skeleton width="25%" />
          <Skeleton width="15%" />
        </div>
      ))}
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={300} />
        </div>
        <Skeleton width={120} height={40} variant="rectangular" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <Skeleton width="40%" height={24} className="mb-4" />
          <Skeleton lines={4} />
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <Skeleton width="40%" height={24} className="mb-4" />
          <Skeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
