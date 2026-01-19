export function LockIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Lock body (like a pancake container) */}
      <rect x="40" y="60" width="40" height="30" rx="6" fill="#fef9f3" stroke="#d89748" strokeWidth="2"/>

      {/* Lock shackle */}
      <path d="M45 60 V45 Q45 35 60 35 Q75 35 75 45 V60" stroke="#d89748" strokeWidth="2.5" fill="none"/>

      {/* Keyhole (pancake shape) */}
      <ellipse cx="60" cy="73" rx="5" ry="2" fill="#d89748"/>
      <rect x="58" y="73" width="4" height="8" rx="2" fill="#d89748"/>
    </svg>
  );
}
