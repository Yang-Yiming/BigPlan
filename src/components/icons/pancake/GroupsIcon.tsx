export function GroupsIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Three pancakes as "people" */}
      <ellipse cx="35" cy="55" rx="15" ry="5" fill="#f9c98d" stroke="#d89748" strokeWidth="2"/>
      <ellipse cx="60" cy="45" rx="18" ry="6" fill="#f5b563" stroke="#d89748" strokeWidth="2"/>
      <ellipse cx="85" cy="55" rx="15" ry="5" fill="#f9c98d" stroke="#d89748" strokeWidth="2"/>

      {/* Faces on pancakes */}
      <circle cx="30" cy="53" r="1.5" fill="#d89748"/>
      <circle cx="40" cy="53" r="1.5" fill="#d89748"/>
      <circle cx="55" cy="43" r="1.5" fill="#d89748"/>
      <circle cx="65" cy="43" r="1.5" fill="#d89748"/>
      <circle cx="80" cy="53" r="1.5" fill="#d89748"/>
      <circle cx="90" cy="53" r="1.5" fill="#d89748"/>

      {/* Connecting arc (friends) */}
      <path d="M30 70 Q60 65 90 70" stroke="#fde047" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
