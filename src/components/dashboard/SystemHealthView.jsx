import { useState, useEffect } from "react";
import { Heart, Loader2, RefreshCw, Shield, AlertTriangle, CheckCircle2, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function SystemHealthView() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const logs = await base44.entities.SystemHealth.list('-created_date', 10);
    setHistory(logs);
    if (logs.length > 0 && !result) {
      try {
        setResult({
          score: logs[0].score,
          findings: JSON.parse(logs[0].findings || '[]'),
          actions_taken: JSON.parse(logs[0].actions_taken || '[]'),
          recommendations: JSON.parse(logs[0].recommendations || '[]'),
          run_type: logs[0].run_type,
          duration_ms: logs[0].duration_ms,
        });
      } catch {}
    }
    setHistoryLoading(false);
  };

  const runCheck = async (type) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('autoHealSystem', { run_type: type });
      setResult(res.data);
      loadHistory();
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreLabel = (s) => s >= 80 ? 'Healthy' : s >= 60 ? 'Needs Attention' : 'Critical';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 metallic-gold-icon" />
        <div>
          <h2 className="text-lg font-bold metallic-gold">System Health Center</h2>
          <p className="text-xs text-muted-foreground">Auto-diagnose, heal, optimize & enhance your system</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { type: 'diagnose', label: 'Diagnose', icon: Shield, desc: 'Scan for issues' },
          { type: 'heal', label: 'Auto-Heal', icon: Heart, desc: 'Fix problems automatically' },
          { type: 'optimize', label: 'Optimize', icon: Zap, desc: 'Improve performance' },
          { type: 'enhance', label: 'Enhance', icon: Brain, desc: 'AI suggestions' },
          { type: 'maintain', label: 'Maintain', icon: RefreshCw, desc: 'Routine maintenance' },
        ].map(action => (
          <Button
            key={action.type}
            onClick={() => runCheck(action.type)}
            disabled={loading}
            variant="outline"
            className="glass-card text-xs h-auto py-2 px-3 flex-col items-start gap-0.5"
          >
            <div className="flex items-center gap-1.5">
              <action.icon className="w-3.5 h-3.5 metallic-gold-icon" />
              <span className="font-bold">{action.label}</span>
            </div>
            <span className="text-[9px] text-muted-foreground">{action.desc}</span>
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 glass-card rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Running system analysis...</span>
        </div>
      )}

      {result && !loading && !result.error && (
        <div className="space-y-3">
          {/* Score */}
          <div className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className={`text-4xl font-black ${scoreColor(result.score)}`}>{result.score}</div>
            <div>
              <div className={`text-sm font-bold ${scoreColor(result.score)}`}>{scoreLabel(result.score)}</div>
              <div className="text-[10px] text-muted-foreground">
                {result.run_type} run • {result.duration_ms}ms
              </div>
            </div>
          </div>

          {/* Findings */}
          {result.findings?.length > 0 && (
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" /> Findings
              </div>
              {result.findings.map((f, i) => (
                <div key={i} className="text-[11px] text-foreground/80 py-1 border-b border-white/5 last:border-0 flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Recommendations
              </div>
              {result.recommendations.map((r, i) => (
                <div key={i} className="text-[11px] text-foreground/80 py-1.5 border-b border-white/5 last:border-0 flex items-start gap-2">
                  <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* Actions taken */}
          {result.actions_taken?.length > 0 && (
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Actions Taken
              </div>
              {result.actions_taken.map((a, i) => (
                <div key={i} className="text-[11px] text-foreground/80 py-1 flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.error && !loading && (
        <div className="glass-card rounded-xl p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-2" />
          <div className="text-xs text-destructive">{result.error}</div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="text-xs font-bold text-foreground mb-2">Recent Runs</div>
          <div className="space-y-1">
            {history.map(h => (
              <div key={h.id} className="flex items-center gap-3 text-[10px] text-muted-foreground py-1.5 border-b border-white/5">
                <span className={`font-bold ${scoreColor(h.score || 0)}`}>{h.score || '—'}</span>
                <span className="capitalize">{h.run_type}</span>
                <span className={h.status === 'complete' ? 'text-green-400' : 'text-yellow-400'}>{h.status}</span>
                <span className="ml-auto">{new Date(h.created_date).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}