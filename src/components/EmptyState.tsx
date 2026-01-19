/**
 * 空状态组件
 * 用于在没有数据时显示友好的提示信息
 */

import {
  TasksIcon,
  CommentsIcon,
  GroupsIcon,
  SearchIcon,
  ReflectionIcon,
  LockIcon,
} from './icons/pancake';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`bg-vanilla-50 rounded-2xl border border-maple-200 p-12 text-center animate-fade-in ${className}`}>
      {icon && (
        <div className="flex justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-vanilla-900 tracking-tight mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-br from-vanilla-600 to-vanilla-700 hover:from-vanilla-700 hover:to-vanilla-800 text-white rounded-xl transition-all duration-200 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98] tracking-tight"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// 煎饼主题的空状态图标
export const EmptyStateIcons = {
  Tasks: <TasksIcon />,
  Comments: <CommentsIcon />,
  Groups: <GroupsIcon />,
  Search: <SearchIcon />,
  Reflection: <ReflectionIcon />,
  Lock: <LockIcon />,
};
