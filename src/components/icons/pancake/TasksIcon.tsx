export function TasksIcon({ className = "w-[120px] h-[120px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      {/* Stack of 3 pancakes */}
      <ellipse cx="60" cy="75" rx="28" ry="8" fill="#f9c98d" stroke="#d89748" strokeWidth="2"/>
      <ellipse cx="60" cy="60" rx="30" ry="8" fill="#f5b563" stroke="#d89748" strokeWidth="2"/>
      <ellipse cx="60" cy="45" rx="32" ry="8" fill="#fbd9b4" stroke="#d89748" strokeWidth="2"/>

      {/* Butter on top */}
      <rect x="55" y="35" width="10" height="8" rx="2" fill="#fef08a" stroke="#facc15" strokeWidth="1.5"/>

      {/* Syrup drip */}
      <path d="M60 43 Q65 50 65 55" stroke="#ca8a04" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Checkmark */}
      <path d="M40 80 L50 90 L80 60" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
