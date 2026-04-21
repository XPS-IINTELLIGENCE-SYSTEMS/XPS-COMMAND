import { motion } from "framer-motion";
import { Zap, Activity, Brain, Layers } from "lucide-react";

/**
 * Floating metric pills that overlay the top of the 3D scene.
 */

const METRICS = [
  { key: "active_leads", label: "Active Leads", icon: Zap, color: "#d4af37" },
  { key: "pipeline_value", label: "Pipeline", icon: Layers, color: "#6366f1", format: "currency" },
  { key: "ai_actions", label: "AI Actions", icon: Brain, color: "#22c55e" },
  { key: "win_rate", label: "Win Rate", icon: Activity, color: "#06b6d4", format: "percent" },
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
    <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-wrap gap-2 sm:gap-3">
      {METRICS.map((m, i) => {
        const Icon = m.icon;
        const val = data[m.key] ?? 0;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md pointer-events-auto"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${m.color}30`,
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 leading-none">{m.label}</span>
              <span className="text-[13px] font-bold text-white leading-tight">{formatValue(val, m.format)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}