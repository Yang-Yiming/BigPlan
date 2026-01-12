/**
 * 空状态组件
 * 用于在没有数据时显示友好的提示信息
 */

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
    <div className={`bg-white rounded-lg border border-[#e4e4e7] p-12 text-center animate-fade-in ${className}`}>
      {icon && (
        <div className="flex justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-charcoal-dark tracking-tight mb-2">{title}</h3>
      {description && (
        <p className="text-secondary-600 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition-all duration-200 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98] tracking-tight"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// 预定义的空状态图标 - 使用最小化几何风格，尺寸升级到 120x120
export const EmptyStateIcons = {
  Tasks: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 外圈 */}
      <circle cx="60" cy="40" r="24" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      {/* 底部线条 */}
      <rect x="40" y="70" width="40" height="6" rx="3" fill="#e4e4e7" />
      <rect x="30" y="85" width="60" height="6" rx="3" fill="#f4f4f5" />
      <rect x="35" y="100" width="50" height="6" rx="3" fill="#f4f4f5" />
      {/* 对勾 */}
      <path
        d="M50 40L56 46L70 32"
        stroke="#a5b4fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Comments: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 对话框 */}
      <rect x="25" y="30" width="70" height="50" rx="8" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      {/* 对话框尾巴 */}
      <path d="M45 80L50 90L55 80" stroke="#e4e4e7" strokeWidth="2" strokeLinejoin="round" fill="none" />
      {/* 点点点 */}
      <circle cx="45" cy="55" r="3" fill="#a5b4fc" />
      <circle cx="60" cy="55" r="3" fill="#a5b4fc" />
      <circle cx="75" cy="55" r="3" fill="#a5b4fc" />
    </svg>
  ),
  Groups: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 三个圆圈代表用户 */}
      <circle cx="40" cy="45" r="12" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      <circle cx="60" cy="35" r="12" stroke="#a5b4fc" strokeWidth="2" fill="none" />
      <circle cx="80" cy="45" r="12" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      {/* 底部连接线 */}
      <path d="M30 70 Q45 65 60 65 Q75 65 90 70" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      <rect x="35" y="85" width="50" height="6" rx="3" fill="#f4f4f5" />
    </svg>
  ),
  Search: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 放大镜 */}
      <circle cx="50" cy="50" r="20" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="12" stroke="#a5b4fc" strokeWidth="2" fill="none" />
      <path d="M65 65L85 85" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
      {/* 装饰线条 */}
      <rect x="30" y="95" width="60" height="4" rx="2" fill="#f4f4f5" />
    </svg>
  ),
  Reflection: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 文档轮廓 */}
      <rect x="35" y="25" width="50" height="70" rx="4" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      {/* 文本线条 */}
      <rect x="45" y="40" width="30" height="4" rx="2" fill="#a5b4fc" />
      <rect x="45" y="52" width="30" height="4" rx="2" fill="#e4e4e7" />
      <rect x="45" y="64" width="20" height="4" rx="2" fill="#e4e4e7" />
      {/* 笔图标 */}
      <path d="M75 75L80 80L75 85L70 80Z" fill="#a5b4fc" />
    </svg>
  ),
  Lock: (
    <svg
      className="w-[120px] h-[120px]"
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* 锁体 */}
      <rect x="40" y="60" width="40" height="35" rx="4" stroke="#e4e4e7" strokeWidth="2" fill="none" />
      {/* 锁扣 */}
      <path d="M45 60V45C45 36.7 51.7 30 60 30C68.3 30 75 36.7 75 45V60" stroke="#a5b4fc" strokeWidth="2" fill="none" />
      {/* 钥匙孔 */}
      <circle cx="60" cy="77" r="4" fill="#a5b4fc" />
      <rect x="58" y="77" width="4" height="8" rx="2" fill="#a5b4fc" />
    </svg>
  ),
};
