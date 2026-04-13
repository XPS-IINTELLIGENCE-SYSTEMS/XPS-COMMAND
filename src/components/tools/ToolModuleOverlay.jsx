import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Glassmorphic overlay that renders a tool module in the center UI.
 * Gold title, white subheading, light gray description.
 */
export default function ToolModuleOverlay({ tool, onClose, onChatCommand }) {
  if (!tool) return null;

  const { label, description, Icon, Component, workflowColor } = tool;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl rounded-2xl animated-silver-border overflow-hidden my-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1]">
                  <Icon className="w-5 h-5" style={{ color: workflowColor || "#d4af37" }} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>{label}</h2>
                {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tool content */}
          <div className="p-5">
            {Component && <Component onChatCommand={onChatCommand} onClose={onClose} workflowColor={workflowColor} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}