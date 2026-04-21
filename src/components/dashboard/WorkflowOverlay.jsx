import { motion } from "framer-motion";
import { Zap, Users, FileText, Target, TrendingUp, CheckCircle2 } from "lucide-react";

/**
 * Floating HTML overlay on top of the 3D scene — shows
 * interactive pipeline stage badges with live stats.
 */

const STAGES = [
  { key: "discover", label: "Discover", icon: Users, color: "#d4af37", glow: "rgba(212,175,55,0.4)" },
  { key: "qualify", label: "Qualify", icon: Target, color: "#22c55e", glow: "rgba(34,197,94,0.4)" },
  { key: "propose", label: "Propose", icon: FileText, color: "#6366f1", glow: "rgba(99,102,241,0.4)" },
  { key: "close", label: "Close", icon: TrendingUp, color: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
  { key: "deliver", label: "Deliver", icon: CheckCircle2, color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
];

export default function WorkflowOverlay({ stats = {}, onStageClick }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-6 px-4">
      <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const count = stats[stage.key] || 0;
          return (
            <motion.button
              key={stage.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5, type: "spring" }}
              onClick={() => onStageClick?.(stage.key)}
              className="relative group flex flex-col items-center gap-1.5"
            >
              {/* Connector line to next stage */}
              {i < STAGES.length - 1 && (
                <div
                  className="absolute top-5 left-full w-3 sm:w-5 h-px hidden sm:block"
                  style={{ background: `linear-gradient(90deg, ${stage.color}60, ${STAGES[i + 1].color}60)` }}
                />
              )}

              {/* Node */}
              <div
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}40)`,
                  border: `1px solid ${stage.color}50`,
                  boxShadow: `0 0 20px ${stage.glow}, inset 0 1px 0 ${stage.color}30`,
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stage.color }} />

                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: `1px solid ${stage.color}` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                />

                {/* Count badge */}
                {count > 0 && (
                  <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-background"
                    style={{ background: stage.color }}
                  >
                    {count > 99 ? "99+" : count}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] font-medium text-white/70 group-hover:text-white transition-colors">
                {stage.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}