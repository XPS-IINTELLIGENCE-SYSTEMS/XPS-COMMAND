import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Play, Clock, Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemGuardian({ onRefresh }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [schedule, setSchedule] = useState("manual");
  const [implementing, setImplementing] = useState(null);

  const runGuardianScan = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("systemGuardian", {});
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

  const autoImplementAll = async () => {
    if (!result?.recommendations?.length) return;
    setImplementing(true);
    try {
      for (const rec of result.recommendations) {
        await base44.functions.invoke("implementRecommendation", { recommendation: rec });
      }
      onRefresh?.();
      setResult(prev => ({ ...prev, implemented: true }));
    } catch (e) {
      console.error("Implementation error:", e);
    }
    setImplementing(false);
  };

  const setupSchedule = async () => {
    if (schedule === "manual") return;
    try {
      const interval = schedule === "hourly" ? 60 : schedule === "daily" ? 1440 : 360; // minutes
      await base44.functions.invoke("setupGuardianSchedule", { interval_minutes: interval });
      alert(`✅ Guardian scheduled to run every ${schedule}`);
    } catch (e) {
      alert("Schedule setup failed: " + e.message);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-primary/20 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black metallic-gold">System Guardian</h2>
            <p className="text-[9px] text-muted-foreground">AI system health & auto-healing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1.5 text-[10px] text-foreground"
          >
            <option value="manual">Manual</option>
            <option value="6hourly">Every 6h</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
          {schedule !== "manual" && (
            <Button
              size="sm"
              variant="outline"
              onClick={setupSchedule}
              className="text-[10px] h-7"
            >
              <Clock className="w-3 h-3" /> Set
            </Button>
          )}
          <Button
            size="sm"
            onClick={runGuardianScan}
            disabled={running}
            className="metallic-gold-bg text-background text-[10px] font-bold h-7"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {running ? "Scanning..." : "Scan Now"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-3">
          {result.error ? (
            <div className="bg-destructive/10 rounded-lg p-2 text-[10px] text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {result.error}
            </div>
          ) : (
            <>
              {/* Health Summary */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-primary/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-primary">{result.system_health || 0}</div>
                  <div className="text-[8px] text-muted-foreground">System Health</div>
                </div>
                <div className="bg-yellow-500/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-yellow-500">{result.issues_found || 0}</div>
                  <div className="text-[8px] text-muted-foreground">Issues Found</div>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-blue-500">{result.recommendations?.length || 0}</div>
                  <div className="text-[8px] text-muted-foreground">Recommendations</div>
                </div>
                <div className="bg-green-500/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-green-500">{result.auto_fixes || 0}</div>
                  <div className="text-[8px] text-muted-foreground">Auto-Fixed</div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">Recommendations</h3>
                    <Button
                      size="sm"
                      onClick={autoImplementAll}
                      disabled={implementing || result.implemented}
                      className="text-[9px] h-6 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    >
                      {implementing ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin mr-1" />
                      ) : result.implemented ? (
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      ) : (
                        <Zap className="w-2.5 h-2.5 mr-1" />
                      )}
                      {result.implemented ? "Applied" : "Auto-Implement All"}
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2 text-[9px]"
                      >
                        <div className="font-bold text-yellow-400 mb-0.5">{rec.title}</div>
                        <div className="text-muted-foreground">{rec.description}</div>
                        {rec.impact && (
                          <div className="text-[8px] text-primary mt-1">Impact: {rec.impact}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {result.critical_issues?.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 space-y-1">
                  <div className="text-[9px] font-bold text-destructive">🚨 Critical Issues:</div>
                  {result.critical_issues.map((issue, i) => (
                    <div key={i} className="text-[8px] text-destructive/80">
                      • {issue}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}