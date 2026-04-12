export default function WorkflowSection({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-base md:text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>{title}</h2>
        {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}