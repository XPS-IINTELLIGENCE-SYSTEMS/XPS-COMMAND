import { useState, useEffect } from "react";
import { ArrowRight, Database, Brain, Users, Briefcase, Send } from "lucide-react";

const STREAM_TYPES = [
  { icon: Users, label: "LEAD INGESTED", color: "#22c55e", channel: "ops_db" },
  { icon: Brain, label: "INTEL INDEXED", color: "#06b6d4", channel: "intel_core" },
  { icon: Database, label: "ENRICHMENT RUN", color: "#8b5cf6", channel: "ai_engine" },
  { icon: Briefcase, label: "JOB DISCOVERED", color: "#f59e0b", channel: "ops_db" },
  { icon: Send, label: "OUTREACH SENT", color: "#ec4899", channel: "outreach" },
  { icon: Brain, label: "SCORE UPDATED", color: "#d4af37", channel: "ai_engine" },
  { icon: Database, label: "CRAWL COMPLETE", color: "#ef4444", channel: "intel_core" },
  { icon: Users, label: "GC PROFILED", color: "#14b8a6", channel: "ops_db" },
];

function generateEvent(idx) {
  const type = STREAM_TYPES[idx % STREAM_TYPES.length];
  const id = `EVT-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  return { ...type, id, timestamp: new Date(), key: `${id}-${Date.now()}` };
}

export default function LiveDataStream({ stats }) {
  const [events, setEvents] = useState(() =>
    Array.from({ length: 8 }, (_, i) => generateEvent(i))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => {
        const newEvent = generateEvent(Math.floor(Math.random() * STREAM_TYPES.length));
        return [newEvent, ...prev.slice(0, 7)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-mono text-cyan-400/60 tracking-widest uppercase">Live Data Stream</span>
        </div>
        <span className="text-[8px] font-mono text-white/20">
          {stats.totalLeads + stats.totalIntel} TOTAL OPS
        </span>
      </div>

      <div className="space-y-1.5 overflow-hidden" style={{ maxHeight: 240 }}>
        {events.map((ev, i) => {
          const Icon = ev.icon;
          const age = Math.round((Date.now() - ev.timestamp) / 1000);
          return (
            <div
              key={ev.key}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: i === 0 ? `${ev.color}10` : "rgba(0,15,30,0.4)",
                border: `1px solid ${i === 0 ? ev.color + "30" : "rgba(0,180,220,0.06)"}`,
                opacity: 1 - i * 0.08,
              }}
            >
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: ev.color }} />
              <span className="text-[9px] font-mono text-white/70 flex-1 truncate">{ev.label}</span>
              <ArrowRight className="w-2.5 h-2.5 text-white/20" />
              <span className="text-[8px] font-mono tracking-wider" style={{ color: ev.color }}>{ev.channel.toUpperCase()}</span>
              <span className="text-[8px] font-mono text-white/20 w-8 text-right">{age}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}