import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Crown, Play, Loader2, Shield, RefreshCcw, Mail, Brain, Zap, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  { id: "full_briefing", label: "Full Scan + Briefing", icon: Crown, desc: "Enrich, score, test, analyze, email report", color: "#d4af37" },
  { id: "enrich", label: "Enrich Leads", icon: Brain, desc: "AI-enrich 10 un-enriched leads", color: "#8b5cf6" },
  { id: "score", label: "Score Leads", icon: TrendingUp, desc: "Score 20 unscored leads", color: "#22c55e" },
  { id: "test_email", label: "Test Email", icon: Mail, desc: "Send system test email", color: "#3b82f6" },
];

export default function OrchestratorPanel({ lastLog, onRefresh }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);

  const runAction = async (action) => {
    setRunning(action);
    setResult(null);
    try {
      const res = await base44.functions.invoke('ceoMorningBriefing', { action });
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(null);
    onRefresh?.();
  };

  const health = result?.analysis?.health_score || lastLog?.health_score || 0;
  const healthColor = health >= 80 ? '#22c55e' : health >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Crown className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="text-sm font-black metallic-gold">CEO Orchestrator</h2>
            <p className="text-[9px] text-muted-foreground">Autonomous daily operations — scan, enrich, test, optimize</p>
          </div>
        </div>
        {health > 0 && (
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: healthColor }}>{health}</div>
            <div className="text-[8px] text-muted-foreground">HEALTH</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          const isRunning = running === a.id;
          return (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              disabled={running}
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: `${a.color}10`, border: `1px solid ${a.color}25` }}
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: a.color }} /> : <Icon className="w-4 h-4" style={{ color: a.color }} />}
              <span className="text-[9px] font-bold text-foreground">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Summary */}
      {result && !result.error && (
        <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-bold text-green-400">Cycle Complete</span>
            <span className="text-[9px] text-muted-foreground ml-auto">{((result.duration_ms || 0) / 1000).toFixed(1)}s</span>
          </div>
          {result.results?.actions?.map((a, i) => (
            <div key={i} className="text-[10px] text-foreground/80 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-primary" /> {a}
            </div>
          ))}
          {result.analysis?.top_priorities?.slice(0, 3).map((p, i) => (
            <div key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="text-primary font-bold">{i + 1}.</span> {p.priority}
            </div>
          ))}
          {result.results?.errors?.length > 0 && (
            <div className="text-[10px] text-destructive flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> {result.results.errors.length} error(s)
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="bg-destructive/10 rounded-lg p-2 text-[10px] text-destructive">{result.error}</div>
      )}

      {/* Last Run */}
      {lastLog && (
        <div className="text-[9px] text-muted-foreground">
          Last: {new Date(lastLog.created_date).toLocaleString()} — {lastLog.status}
        </div>
      )}
    </div>
  );
}