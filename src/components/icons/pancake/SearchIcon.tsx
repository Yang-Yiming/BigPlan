export function SearchIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Pancake on plate */}
      <ellipse cx="50" cy="75" rx="25" ry="7" fill="#f9c98d" stroke="#d89748" strokeWidth="2"/>

      {/* Plate */}
      <ellipse cx="50" cy="80" rx="30" ry="5" fill="none" stroke="#e7cab5" strokeWidth="2"/>

      {/* Magnifying glass */}
      <circle cx="75" cy="40" r="15" fill="none" stroke="#d89748" strokeWidth="2.5"/>
      <circle cx="75" cy="40" r="10" fill="#fef9f3" stroke="#fbd9b4" strokeWidth="2"/>
      <line x1="85" y1="50" x2="100" y2="65" stroke="#d89748" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
