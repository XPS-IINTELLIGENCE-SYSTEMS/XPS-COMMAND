export default function HexPatternBanner() {
  return (
    <div className="w-full h-24 md:h-32 overflow-hidden relative flex-shrink-0 pointer-events-none select-none">
      <svg className="w-full h-full" viewBox="0 0 1200 160" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-solid" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
            <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z" fill="none" stroke="rgba(192,192,192,0.25)" strokeWidth="1" />
            <path d="M28 100L0 84L0 50L28 34L56 50L56 84L28 100Z" fill="none" stroke="rgba(192,192,192,0.25)" strokeWidth="1" />
          </pattern>
          <linearGradient id="hex-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="hex-mask">
            <rect width="1200" height="160" fill="url(#hex-fade)" />
          </mask>
        </defs>
        <rect width="1200" height="160" fill="url(#hex-solid)" mask="url(#hex-mask)" />
        {/* Accent hexagons */}
        {[120, 280, 460, 680, 840, 1020].map((x, i) => (
          <path key={i} d={`M${x} ${20 + (i % 2) * 15}L${x - 14} ${12 + (i % 2) * 15}L${x - 14} ${-4 + (i % 2) * 15}L${x} ${-12 + (i % 2) * 15}L${x + 14} ${-4 + (i % 2) * 15}L${x + 14} ${12 + (i % 2) * 15}Z`}
            fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}