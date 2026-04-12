import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GlassToolCard({ num, label, oldWay, aiTool, Icon, children, statusBadge, functionName, functionParams, onResult }) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    if (!functionName || running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke(functionName, functionParams || {});
      setResult(res.data);
      if (onResult) onResult(res.data);
    } catch (err) {
      setError(err.message || 'Function failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={cn(
      "group relative rounded-2xl border border-white/10 transition-all duration-300 overflow-hidden",
      "bg-card/40 backdrop-blur-xl",
      "hover:border-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]",
      expanded && "border-primary/20 shadow-[0_0_40px_rgba(212,175,55,0.1)]"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02] pointer-events-none" />

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
              {result && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
              {error && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{aiTool}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {functionName && (
            <div
              onClick={(e) => { e.stopPropagation(); handleRun(); }}
              className={cn(
                "hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-semibold cursor-pointer transition-all",
                running
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-secondary/50 border-white/5 text-muted-foreground hover:border-primary/30 hover:text-primary"
              )}
            >
              {running ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
              {running ? "Running..." : "Run"}
            </div>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="relative border-t border-white/5 p-4 space-y-4">
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

          {children && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              {children}
            </div>
          )}

          {/* Live result display */}
          {result && (
            <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-3">
              <div className="text-[9px] font-bold text-green-500 uppercase tracking-wider mb-1">Live Result</div>
              <pre className="text-[10px] text-foreground/80 leading-relaxed overflow-auto max-h-48 whitespace-pre-wrap">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-3">
              <div className="text-[9px] font-bold text-destructive uppercase tracking-wider mb-1">Error</div>
              <p className="text-[10px] text-muted-foreground">{error}</p>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={running || !functionName}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
              functionName
                ? "metallic-gold-bg text-background hover:brightness-110"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? `Running ${label}...` : `Launch ${label}`}
          </button>
        </div>
      )}
    </div>
  );
}