import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield, Activity, Wrench, Heart, Zap, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, RefreshCw, Loader2,
  ChevronDown, ChevronUp, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PHASE_ICONS = {
  audit: Activity,
  diagnose: AlertTriangle,
  fix: Wrench,
  heal: Heart,
  harden: Shield,
};

export default function SystemGuardianDashboard() {
  const [healthHistory, setHealthHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [health, acts] = await Promise.all([
      base44.entities.SystemHealth.list('-created_date', 30).catch(() => []),
      base44.entities.AgentActivity.filter({ agent_name: 'System Guardian' }, '-created_date', 20).catch(() => []),
    ]);
    setHealthHistory(health);
    setActivities(acts);
    setLoading(false);
  };

  const runGuardian = async () => {
    setRunning(true);
    await base44.functions.invoke('systemGuardian', {}).catch(() => {});
    await loadData();
    setRunning(false);
  };

  const latestHealth = healthHistory[0];
  const latestScore = latestHealth?.score || 0;
  const scoreColor = latestScore >= 90 ? 'text-green-400' : latestScore >= 70 ? 'text-yellow-400' : latestScore >= 50 ? 'text-orange-400' : 'text-red-400';
  const scoreBg = latestScore >= 90 ? 'bg-green-500/10' : latestScore >= 70 ? 'bg-yellow-500/10' : latestScore >= 50 ? 'bg-orange-500/10' : 'bg-red-500/10';

  // Calculate stats
  const totalFixes = activities.reduce((sum, a) => {
    try { const d = JSON.parse(a.details || '{}'); return sum + (d.fixes || 0); } catch { return sum; }
  }, 0);
  const totalHeals = activities.reduce((sum, a) => {
    try { const d = JSON.parse(a.details || '{}'); return sum + (d.heals || 0); } catch { return sum; }
  }, 0);
  const avgHealth = healthHistory.length > 0
    ? Math.round(healthHistory.reduce((sum, h) => sum + (h.score || 0), 0) / healthHistory.length)
    : 0;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold metallic-gold flex items-center gap-2">
            <Shield className="w-6 h-6 metallic-gold-icon" />
            System Guardian
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Autonomous audit → diagnose → fix → heal → harden</p>
        </div>
        <Button onClick={runGuardian} disabled={running} className="metallic-gold-bg text-background gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {running ? 'Running...' : 'Run Guardian Now'}
        </Button>
      </div>

      {/* Health Score + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`glass-card rounded-xl p-4 text-center ${scoreBg}`}>
          <div className={`text-3xl font-black ${scoreColor}`}>{latestScore}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">Current Health</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-blue-400">{totalFixes}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Total Fixes</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-green-400">{totalHeals}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Total Heals</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-purple-400">{avgHealth}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">Avg Health</div>
        </div>
      </div>

      {/* Health Timeline */}
      <div className="glass-card rounded-xl p-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 metallic-gold-icon" />
          Health Timeline
        </h2>
        <div className="flex items-end gap-1 h-24 overflow-x-auto">
          {healthHistory.slice(0, 30).reverse().map((h, i) => {
            const pct = h.score || 0;
            const color = pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';
            return (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[20px]">
                <div className={`w-4 rounded-t ${color}`} style={{ height: `${Math.max(4, pct)}%` }} title={`${pct}%`} />
                <span className="text-[7px] text-muted-foreground">{pct}</span>
              </div>
            );
          })}
          {healthHistory.length === 0 && (
            <div className="w-full text-center text-xs text-muted-foreground py-8">No health data yet. Run the Guardian to start tracking.</div>
          )}
        </div>
      </div>

      {/* Recent Guardian Runs */}
      <div className="glass-card rounded-xl p-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 metallic-gold-icon" />
          Guardian Activity Log
        </h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {activities.map((act) => {
            let details = {};
            try { details = JSON.parse(act.details || '{}'); } catch {}
            const isExpanded = expanded === act.id;

            return (
              <div key={act.id} className="border border-border rounded-lg p-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(isExpanded ? null : act.id)}>
                  <div className="flex items-center gap-2 min-w-0">
                    {act.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : act.status === 'approval_required' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-[11px] text-foreground truncate">{act.action}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] text-muted-foreground">
                      {act.created_date ? new Date(act.created_date).toLocaleString() : ''}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div><span className="text-muted-foreground">Health:</span> <span className="font-bold">{details.health_after || 'N/A'}%</span></div>
                    <div><span className="text-muted-foreground">Fixes:</span> <span className="font-bold">{details.fixes || 0}</span></div>
                    <div><span className="text-muted-foreground">Heals:</span> <span className="font-bold">{details.heals || 0}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <span className="font-bold">{details.duration_ms ? `${(details.duration_ms / 1000).toFixed(1)}s` : 'N/A'}</span></div>
                    {details.needs_human && (
                      <div className="col-span-full">
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-[9px]">⚠️ Human Intervention Needed</Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-6">No guardian runs yet</div>
          )}
        </div>
      </div>
    </div>
  );
}