export function ReflectionIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Journal/notebook */}
      <rect x="35" y="25" width="50" height="65" rx="4" fill="#fef9f3" stroke="#d89748" strokeWidth="2"/>

      {/* Spiral binding */}
      <circle cx="40" cy="35" r="2" fill="none" stroke="#d89748" strokeWidth="1.5"/>
      <circle cx="40" cy="45" r="2" fill="none" stroke="#d89748" strokeWidth="1.5"/>
      <circle cx="40" cy="55" r="2" fill="none" stroke="#d89748" strokeWidth="1.5"/>

      {/* Pancake doodle inside */}
      <ellipse cx="60" cy="50" rx="12" ry="4" fill="#fbd9b4" stroke="#d89748" strokeWidth="1.5"/>
      <circle cx="57" cy="49" r="1" fill="#d89748"/>
      <circle cx="63" cy="49" r="1" fill="#d89748"/>

      {/* Text lines */}
      <line x1="50" y1="65" x2="75" y2="65" stroke="#e7cab5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="72" x2="70" y2="72" stroke="#e7cab5" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
