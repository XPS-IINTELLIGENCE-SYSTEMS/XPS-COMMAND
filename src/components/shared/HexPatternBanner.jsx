export default function HexPatternBanner() {
  return (
    <div className="w-full h-16 md:h-20 overflow-hidden relative flex-shrink-0 pointer-events-none select-none">
      {/* Deep black base with gold hex edges */}
      <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-dark" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
            <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="0.6" />
            <path d="M28 100L0 84L0 50L28 34L56 50L56 84L28 100Z" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="0.6" />
          </pattern>
          <radialGradient id="hex-gold-glow" cx="75%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="hex-fade-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="hex-mask-dark">
            <rect width="1200" height="120" fill="url(#hex-fade-dark)" />
          </mask>
        </defs>
        <rect width="1200" height="120" fill="url(#hex-gold-glow)" />
        <rect width="1200" height="120" fill="url(#hex-dark)" mask="url(#hex-mask-dark)" />
        {/* Gold accent hexagons with glow */}
        {[160, 380, 600, 820, 1040].map((x, i) => (
          <g key={i}>
            <path
              d={`M${x} ${18 + (i % 2) * 12}L${x - 16} ${9 + (i % 2) * 12}L${x - 16} ${-7 + (i % 2) * 12}L${x} ${-16 + (i % 2) * 12}L${x + 16} ${-7 + (i % 2) * 12}L${x + 16} ${9 + (i % 2) * 12}Z`}
              fill="none"
              stroke="rgba(212,175,55,0.3)"
              strokeWidth="1"
            />
            <circle cx={x} cy={(i % 2) * 12 + 1} r="1.5" fill="rgba(212,175,55,0.4)" />
          </g>
        ))}
      </svg>
    </div>
  );
}