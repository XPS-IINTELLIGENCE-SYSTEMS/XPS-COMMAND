import { useState } from "react";
import { Play, Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, XCircle, Wrench, Shield, Zap, TrendingUp, Activity } from "lucide-react";

const STATUS_ICON = {
  pass: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  fail: <XCircle className="w-4 h-4 text-red-500" />,
};
const STATUS_COLOR = { pass: "#22c55e", warning: "#f59e0b", fail: "#ef4444" };

export default function SimulationCard({ workflow, result, simulating, onSimulate, onAutoFix }) {
  const [expanded, setExpanded] = useState(false);

  let stepCount = 0;
  try { stepCount = JSON.parse(workflow.steps || "[]").length; } catch {}

  return (
    <div className={`glass-card rounded-xl overflow-hidden ${result ? `border-l-4` : ""}`} style={result ? { borderLeftColor: STATUS_COLOR[result.status] || "#6b7280" } : {}}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => result && setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{workflow.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-secondary text-muted-foreground">{workflow.category || "Custom"}</span>
            <span className="text-[9px] text-muted-foreground">{stepCount} steps</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{workflow.description || "No description"}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {result && (
            <div className="flex items-center gap-1.5">
              {STATUS_ICON[result.status]}
              <span className={`text-sm font-black ${result.score >= 80 ? "text-green-400" : result.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {result.score}
              </span>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSimulate(); }}
            disabled={simulating}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold hover:bg-purple-500/20 disabled:opacity-50"
          >
            {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
            {simulating ? "Testing..." : result ? "Re-Test" : "Simulate"}
          </button>
          {result && <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />}
        </div>
      </div>

      {expanded && result && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {/* Score + Risk */}
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-muted-foreground" /> Risk: <span className={result.risk_level === "low" ? "text-green-400" : result.risk_level === "medium" ? "text-yellow-400" : "text-red-400"}>{result.risk_level}</span></span>
            {result.estimated_roi && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-400" /> ROI: {result.estimated_roi}</span>}
          </div>

          {/* Step results */}
          {result.step_results?.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block mb-1">Step-by-Step Results</span>
              <div className="space-y-1">
                {result.step_results.map((sr, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px]">
                    {sr.status === "pass" ? <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" /> :
                     sr.status === "warning" ? <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" /> :
                     <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <span className="font-bold text-foreground">{sr.step}</span>
                      <p className="text-muted-foreground">{sr.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {result.issues?.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-red-400 block mb-1">⚠️ Issues Found</span>
              {result.issues.map((issue, i) => (
                <p key={i} className="text-[10px] text-red-400/80 ml-2">• {issue}</p>
              ))}
            </div>
          )}

          {/* Fixes */}
          {result.fixes?.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-green-400 block mb-1">🔧 Recommended Fixes</span>
              {result.fixes.map((fix, i) => (
                <p key={i} className="text-[10px] text-foreground/70 ml-2">• {fix}</p>
              ))}
            </div>
          )}

          {/* Enhancements */}
          {result.enhancements?.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-primary block mb-1">⚡ Enhancements</span>
              {result.enhancements.map((e, i) => (
                <p key={i} className="text-[10px] text-foreground/70 ml-2">• {e}</p>
              ))}
            </div>
          )}

          {/* Missing steps */}
          {result.missing_steps?.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-blue-400 block mb-1">➕ Missing Steps</span>
              {result.missing_steps.map((ms, i) => (
                <p key={i} className="text-[10px] text-foreground/70 ml-2">• {ms}</p>
              ))}
            </div>
          )}

          {/* Auto-fix button */}
          {(result.fixes?.length > 0 || result.missing_steps?.length > 0) && (
            <button
              onClick={onAutoFix}
              disabled={simulating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold hover:brightness-110 disabled:opacity-50 w-full justify-center"
            >
              <Wrench className="w-3.5 h-3.5" />
              Auto-Fix, Harden & Re-Validate
            </button>
          )}
        </div>
      )}
    </div>
  );
}