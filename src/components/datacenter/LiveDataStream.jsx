import { useState, useEffect } from "react";
import { ArrowRight, Database, Brain, Users, Briefcase, Send } from "lucide-react";

const STREAM_TYPES = [
  { icon: Users, label: "LEAD INGESTED", channel: "OPS_DB" },
  { icon: Brain, label: "INTEL INDEXED", channel: "INTEL_CORE" },
  { icon: Database, label: "ENRICHMENT RUN", channel: "AI_ENGINE" },
  { icon: Briefcase, label: "JOB DISCOVERED", channel: "OPS_DB" },
  { icon: Send, label: "OUTREACH SENT", channel: "OUTREACH" },
  { icon: Brain, label: "SCORE UPDATED", channel: "AI_ENGINE" },
  { icon: Database, label: "CRAWL COMPLETE", channel: "INTEL_CORE" },
  { icon: Users, label: "GC PROFILED", channel: "OPS_DB" },
];

function generateEvent(idx) {
  const type = STREAM_TYPES[idx % STREAM_TYPES.length];
  const id = `EVT-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  return { ...type, id, timestamp: Date.now(), key: `${id}-${Date.now()}` };
}

export default function LiveDataStream({ stats }) {
  const [events, setEvents] = useState(() => Array.from({ length: 8 }, (_, i) => generateEvent(i)));

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => [generateEvent(Math.floor(Math.random() * STREAM_TYPES.length)), ...prev.slice(0, 7)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[8px] font-mono text-[#d4af37]/40 tracking-[0.3em] uppercase">Live Data Stream</span>
        </div>
        <span className="text-[7px] font-mono text-white/15 tracking-wider">
          {stats.totalLeads + stats.totalIntel} TOTAL OPS
        </span>
      </div>

      <div className="space-y-1" style={{ maxHeight: 240, overflow: "hidden" }}>
        {events.map((ev, i) => {
          const Icon = ev.icon;
          const age = Math.round((Date.now() - ev.timestamp) / 1000);
          return (
            <div
              key={ev.key}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: i === 0 ? "rgba(212,175,55,0.04)" : "rgba(0,0,0,0.2)",
                border: `1px solid ${i === 0 ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)"}`,
                opacity: 1 - i * 0.07,
              }}
            >
              <Icon className="w-3 h-3 flex-shrink-0 text-[#d4af37]/50" />
              <span className="text-[9px] font-mono text-white/50 flex-1 truncate">{ev.label}</span>
              <ArrowRight className="w-2.5 h-2.5 text-white/10" />
              <span className="text-[7px] font-mono tracking-[0.15em] text-[#d4af37]/40">{ev.channel}</span>
              <span className="text-[7px] font-mono text-white/15 w-6 text-right">{age}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}