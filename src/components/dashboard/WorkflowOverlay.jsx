import { motion } from "framer-motion";
import { Users, Target, FileText, TrendingUp, CheckCircle2 } from "lucide-react";

const STAGES = [
  { key: "discover", label: "Discover", icon: Users, color: "#d4af37", accent: "#f5e6a3" },
  { key: "qualify", label: "Qualify", icon: Target, color: "#22c55e", accent: "#86efac" },
  { key: "propose", label: "Propose", icon: FileText, color: "#6366f1", accent: "#a5b4fc" },
  { key: "close", label: "Close", icon: TrendingUp, color: "#06b6d4", accent: "#67e8f9" },
  { key: "deliver", label: "Deliver", icon: CheckCircle2, color: "#f59e0b", accent: "#fcd34d" },
];

export default function WorkflowOverlay({ stats = {}, onStageClick }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      {/* Premium frosted bar */}
      <div
        className="mx-3 sm:mx-6 mb-4 rounded-2xl pointer-events-auto overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(10,10,25,0.75) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(212,175,55,0.12)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center justify-center gap-1 sm:gap-0 px-2 sm:px-4 py-3 sm:py-4">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const count = stats[stage.key] || 0;
            return (
              <div key={stage.key} className="flex items-center">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                  onClick={() => onStageClick?.(stage.key)}
                  className="relative group flex flex-col items-center gap-1 px-2 sm:px-4 py-1"
                >
                  {/* Glow backdrop on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${stage.color}15, transparent 70%)`,
                    }}
                  />

                  {/* Icon container */}
                  <div className="relative">
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `linear-gradient(145deg, ${stage.color}15, ${stage.color}08)`,
                        border: `1px solid ${stage.color}25`,
                        boxShadow: `0 0 15px ${stage.color}10`,
                      }}
                    >
                      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-all duration-300" style={{ color: stage.color }} />
                    </div>

                    {/* Animated pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: `1px solid ${stage.color}` }}
                      animate={{ scale: [1, 1.35], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
                    />

                    {/* Count badge */}
                    {count > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold px-1"
                        style={{
                          background: `linear-gradient(135deg, ${stage.color}, ${stage.accent})`,
                          color: "#0a0a14",
                          boxShadow: `0 2px 8px ${stage.color}60`,
                        }}
                      >
                        {count > 99 ? "99+" : count}
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase text-white/40 group-hover:text-white/80 transition-colors duration-300">
                    {stage.label}
                  </span>
                </motion.button>

                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <div className="hidden sm:flex items-center px-1">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      className="w-6 md:w-10 h-px origin-left"
                      style={{
                        background: `linear-gradient(90deg, ${stage.color}40, ${STAGES[i + 1].color}40)`,
                      }}
                    />
                    <motion.div
                      className="w-1 h-1 rounded-full"
                      style={{ background: STAGES[i + 1].color }}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}