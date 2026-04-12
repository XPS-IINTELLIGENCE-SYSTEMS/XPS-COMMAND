import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Play, Loader2 } from "lucide-react";

export default function GlassToolCard({ num, label, oldWay, aiTool, Icon, children, statusBadge }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "group relative rounded-2xl border border-white/10 transition-all duration-300 overflow-hidden",
      "bg-card/40 backdrop-blur-xl",
      "hover:border-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]",
      expanded && "border-primary/20 shadow-[0_0_40px_rgba(212,175,55,0.1)]"
    )}>
      {/* Glassmorphic shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02] pointer-events-none" />

      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold text-primary/80 w-7 flex-shrink-0">{num}</span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
            <Icon className="w-4 h-4 metallic-silver-icon group-hover:text-primary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{label}</span>
              {statusBadge && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{statusBadge}</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{aiTool}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 border border-white/5 text-[9px] text-muted-foreground">
            <Play className="w-2.5 h-2.5" /> Run
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="relative border-t border-white/5 p-4 space-y-4">
          {/* Old vs New comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-3">
              <div className="text-[9px] font-bold text-destructive/70 uppercase tracking-wider mb-1">Old School</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{oldWay}</p>
            </div>
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
              <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">AI Powered</div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{aiTool}</p>
            </div>
          </div>

          {/* Tool module content (charts, forms, etc.) */}
          {children && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              {children}
            </div>
          )}

          {/* Action button */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl metallic-gold-bg text-background text-xs font-bold hover:brightness-110 transition-all">
            <Play className="w-3.5 h-3.5" /> Launch {label}
          </button>
        </div>
      )}
    </div>
  );
}