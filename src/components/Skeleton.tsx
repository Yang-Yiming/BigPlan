/**
 * 骨架屏组件
 * 用于在内容加载时显示占位符
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// 任务卡片骨架屏
export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="24px" />
          <Skeleton width="40%" height="16px" />
        </div>
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
      <Skeleton width="100%" height="60px" />
      <div className="flex items-center gap-2">
        <Skeleton width="80px" height="24px" />
        <Skeleton width="80px" height="24px" />
      </div>
    </div>
  );
}

// 任务列表骨架屏
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

// KISS 表单骨架屏
export function KissFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {['Keep', 'Improve', 'Start', 'Stop'].map((section) => (
        <div key={section} className="space-y-2">
          <Skeleton width="100px" height="20px" />
          <Skeleton width="100%" height="100px" />
        </div>
      ))}
      <div className="flex gap-3">
        <Skeleton width="120px" height="40px" />
        <Skeleton width="120px" height="40px" />
      </div>
    </div>
  );
}

// 评论列表骨架屏
export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="60px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}
