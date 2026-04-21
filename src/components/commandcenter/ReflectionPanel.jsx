import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, Zap, AlertTriangle, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AGENT_TYPES = ["All", "Coordinator", "Browser", "Research", "Scraper", "Writer", "Analyst", "Coder", "Scheduler"];

const TREND_ICONS = {
  improving: { icon: TrendingUp, color: "text-green-400", label: "Improving" },
  stable: { icon: Minus, color: "text-blue-400", label: "Stable" },
  declining: { icon: TrendingDown, color: "text-red-400", label: "Declining" },
  new: { icon: Zap, color: "text-primary", label: "New" },
};

export default function ReflectionPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflecting, setReflecting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [lastResult, setLastResult] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("multiAgentCollab", { action: "collab_stats" });
    setStats(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runReflection = async () => {
    setReflecting(true);
    setLastResult(null);
    const res = await base44.functions.invoke("multiAgentCollab", {
      action: "self_reflect",
      agent_type: selectedAgent === "All" ? undefined : selectedAgent,
      trigger: "manual",
    });
    setLastResult(res.data);
    setReflecting(false);
    load();
  };

  const runUpgrade = async () => {
    setUpgrading(true);
    const res = await base44.functions.invoke("multiAgentCollab", {
      action: "auto_upgrade",
      agent_type: selectedAgent === "All" ? undefined : selectedAgent,
    });
    setLastResult(res.data);
    setUpgrading(false);
    load();
  };

  if (loading && !stats) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Self-Reflection & Auto-Upgrade</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="h-7 text-[10px] w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AGENT_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={runReflection} disabled={reflecting} className="h-7 text-[10px] gap-1">
            {reflecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />} Reflect
          </Button>
          <Button size="sm" onClick={runUpgrade} disabled={upgrading} className="h-7 text-[10px] gap-1 metallic-gold-bg text-background">
            {upgrading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpCircle className="w-3 h-3" />} Auto-Upgrade
          </Button>
          <button onClick={load} className="p-1 rounded hover:bg-secondary"><RefreshCw className="w-3 h-3 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Agent Performance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(stats?.by_agent || {}).filter(([k]) => AGENT_TYPES.includes(k)).map(([agent, data]) => {
          const trendInfo = TREND_ICONS[data.trend] || TREND_ICONS.new;
          const TrendIcon = trendInfo.icon;
          return (
            <div key={agent} className="glass-card rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground">{agent}</span>
                <TrendIcon className={`w-3 h-3 ${trendInfo.color}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-extrabold ${data.latest_success_rate >= 80 ? 'text-green-400' : data.latest_success_rate >= 50 ? 'text-primary' : 'text-red-400'}`}>
                  {data.latest_success_rate ?? '—'}
                </span>
                {data.latest_success_rate != null && <span className="text-[8px] text-muted-foreground">% success</span>}
              </div>
              <div className="flex gap-1 flex-wrap">
                {data.collaboration_score != null && <Badge className="text-[7px] px-1 py-0 bg-blue-500/10 text-blue-400">Collab {data.collaboration_score}</Badge>}
                <Badge className={`text-[7px] px-1 py-0 ${trendInfo.color} bg-transparent border border-current/20`}>{trendInfo.label}</Badge>
              </div>
              {data.strengths?.length > 0 && (
                <p className="text-[8px] text-green-400/80 truncate">✓ {data.strengths[0]}</p>
              )}
              {data.weaknesses?.length > 0 && (
                <p className="text-[8px] text-red-400/80 truncate">✗ {data.weaknesses[0]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Reflections */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Recent Reflections</h4>
        {(stats?.recent_reflections || []).slice(0, 6).map((r, i) => {
          const trendInfo = TREND_ICONS[r.trend] || TREND_ICONS.new;
          const TrendIcon = trendInfo.icon;
          return (
            <div key={r.id || i} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
              {r.type === 'skill_upgrade' ? <ArrowUpCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" /> : <Brain className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-foreground">{r.agent}</span>
                  <Badge className="text-[7px] px-1 py-0">{r.type}</Badge>
                  <TrendIcon className={`w-2.5 h-2.5 ${trendInfo.color}`} />
                </div>
                <p className="text-[9px] text-muted-foreground truncate">{r.summary}</p>
              </div>
              <span className={`text-[10px] font-bold ${(r.success_rate || 0) >= 80 ? 'text-green-400' : (r.success_rate || 0) >= 50 ? 'text-primary' : 'text-red-400'}`}>
                {r.success_rate ?? '—'}%
              </span>
            </div>
          );
        })}
        {(stats?.recent_reflections || []).length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">No reflections yet. Click "Reflect" to start.</p>
        )}
      </div>

      {/* Last Result */}
      {lastResult?.reflection && (
        <div className="glass-card rounded-xl p-3 space-y-2 border-l-2 border-primary/50">
          <h4 className="text-[10px] font-bold text-primary">Latest Reflection Result</h4>
          <p className="text-[10px] text-foreground">{lastResult.reflection.overall_assessment}</p>
          {lastResult.reflection.improvements?.length > 0 && (
            <div>
              <span className="text-[8px] font-bold text-muted-foreground uppercase">Improvements Identified:</span>
              {lastResult.reflection.improvements.map((imp, i) => (
                <div key={i} className="text-[9px] text-muted-foreground mt-1 pl-2 border-l border-border/50">
                  <span className="text-foreground font-medium">{imp.area}:</span> {imp.improved_behavior}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {lastResult?.upgrade && (
        <div className="glass-card rounded-xl p-3 space-y-2 border-l-2 border-green-500/50">
          <h4 className="text-[10px] font-bold text-green-400 flex items-center gap-1"><ArrowUpCircle className="w-3 h-3" /> Upgrades Applied</h4>
          <p className="text-[10px] text-foreground">{lastResult.upgrade.expected_impact_summary}</p>
          {(lastResult.upgrade.new_capabilities || []).map((cap, i) => (
            <div key={i} className="text-[9px] text-green-400/80 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> {cap}</div>
          ))}
        </div>
      )}

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className="text-[9px] bg-secondary/80">{stats?.total_reflections || 0} Total Reflections</Badge>
        <Badge className="text-[9px] bg-secondary/80">{stats?.total_collaborations || 0} Collaborations</Badge>
        <Badge className="text-[9px] bg-primary/10 text-primary">{stats?.total_skill_upgrades || 0} Skill Upgrades</Badge>
      </div>
    </div>
  );
}