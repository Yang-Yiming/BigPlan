export function CommentsIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Pancake */}
      <ellipse cx="60" cy="65" rx="35" ry="10" fill="#f9c98d" stroke="#d89748" strokeWidth="2"/>

      {/* Smiley face on pancake */}
      <circle cx="50" cy="62" r="2" fill="#d89748"/>
      <circle cx="70" cy="62" r="2" fill="#d89748"/>
      <path d="M50 68 Q60 72 70 68" stroke="#d89748" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Speech bubbles */}
      <rect x="25" y="30" width="30" height="20" rx="6" fill="#fef9c3" stroke="#fde047" strokeWidth="2"/>
      <path d="M35 50 L40 55 L45 50" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" fill="none"/>
      <circle cx="32" cy="40" r="2" fill="#facc15"/>
      <circle cx="40" cy="40" r="2" fill="#facc15"/>
      <circle cx="48" cy="40" r="2" fill="#facc15"/>
    </svg>
  );
}
