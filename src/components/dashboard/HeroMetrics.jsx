import { motion } from "framer-motion";
import { Zap, Activity, Brain, Layers } from "lucide-react";

const METRICS = [
  { key: "active_leads", label: "Active Leads", icon: Zap, color: "#d4af37", accent: "#f5e6a3" },
  { key: "pipeline_value", label: "Pipeline Value", icon: Layers, color: "#6366f1", accent: "#a5b4fc", format: "currency" },
  { key: "ai_actions", label: "AI Actions Today", icon: Brain, color: "#22c55e", accent: "#86efac" },
  { key: "win_rate", label: "Win Rate", icon: Activity, color: "#06b6d4", accent: "#67e8f9", format: "percent" },
];

function formatValue(val, format) {
  if (format === "currency") {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  }
  if (format === "percent") return `${val}%`;
  return val?.toLocaleString() || "0";
}

export default function HeroMetrics({ data = {} }) {
  return (
    <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-5 sm:right-5 pointer-events-none flex flex-wrap gap-2">
      {METRICS.map((m, i) => {
        const Icon = m.icon;
        const val = data[m.key] ?? 0;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, type: "spring" }}
            className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-xl pointer-events-auto"
            style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,10,25,0.7))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${m.color}18`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${m.color}20, ${m.color}08)`,
                boxShadow: `0 0 12px ${m.color}15`,
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider font-medium text-white/35 leading-none">{m.label}</span>
              <span
                className="text-[15px] font-bold leading-tight"
                style={{
                  background: `linear-gradient(135deg, ${m.color}, ${m.accent})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatValue(val, m.format)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}