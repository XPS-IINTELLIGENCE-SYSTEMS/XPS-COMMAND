import KnowledgeAdminPanel from "./KnowledgeAdminPanel";
import ScrapeMonitor from "./ScrapeMonitor";

export default function KnowledgeView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            KNOWLEDGE ENGINE
          </h1>
          <p className="text-sm text-white/40 mt-1">Continuously learning intelligence system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScrapeMonitor />
          <KnowledgeAdminPanel />
        </div>
      </div>
    </div>
  );
}