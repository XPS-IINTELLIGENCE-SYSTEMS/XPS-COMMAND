import { useState } from "react";
import { Brain, ChevronDown, ChevronRight, Star, AlertTriangle, Lightbulb, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS = {
  performance_review: { label: "Performance Review", icon: TrendingUp, color: "#06b6d4" },
  skill_gap: { label: "Skill Gap", icon: AlertTriangle, color: "#f59e0b" },
  self_correction: { label: "Self Correction", icon: Brain, color: "#8b5cf6" },
  collaboration_review: { label: "Collaboration Review", icon: Users, color: "#22c55e" },
  strategy_upgrade: { label: "Strategy Upgrade", icon: Lightbulb, color: "#d4af37" },
};

export default function ReflectionFeed({ reflections }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!reflections?.length) {
    return <div className="text-center py-6 text-xs text-muted-foreground">No reflections yet — trigger one via the Actions menu</div>;
  }

  return (
    <div className="space-y-2">
      {reflections.map(ref => {
        const config = TYPE_LABELS[ref.reflection_type] || TYPE_LABELS.performance_review;
        const Icon = config.icon;
        const expanded = expandedId === ref.id;
        const strengths = (() => { try { return JSON.parse(ref.strengths || '[]'); } catch { return []; } })();
        const weaknesses = (() => { try { return JSON.parse(ref.weaknesses || '[]'); } catch { return []; } })();
        const upgrades = (() => { try { return JSON.parse(ref.skill_upgrades || '[]'); } catch { return []; } })();
        const nextActions = (() => { try { return JSON.parse(ref.next_actions || '[]'); } catch { return []; } })();

        return (
          <div key={ref.id} className="glass-card rounded-xl overflow-hidden">
            <button onClick={() => setExpandedId(expanded ? null : ref.id)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.color}18` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-foreground">{ref.agent_type}</span>
                  <Badge className="text-[7px] px-1 py-0" style={{ backgroundColor: `${config.color}20`, color: config.color }}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground">
                  <span>Score: <span className={ref.performance_score >= 70 ? "text-green-400" : "text-yellow-400"}>{ref.performance_score}/100</span></span>
                  <span>{ref.tasks_analyzed} tasks analyzed</span>
                  <span>Success: {ref.success_rate}%</span>
                </div>
              </div>
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {expanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3">
                {ref.full_analysis && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ref.full_analysis}</p>
                )}

                {strengths.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-green-400 mb-1 flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Strengths</p>
                    <ul className="space-y-0.5">{strengths.map((s, i) => <li key={i} className="text-[9px] text-muted-foreground">• {typeof s === 'string' ? s : s.insight || JSON.stringify(s)}</li>)}</ul>
                  </div>
                )}

                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-red-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Weaknesses</p>
                    <ul className="space-y-0.5">{weaknesses.map((w, i) => <li key={i} className="text-[9px] text-muted-foreground">• {typeof w === 'string' ? w : w.insight || JSON.stringify(w)}</li>)}</ul>
                  </div>
                )}

                {upgrades.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-primary mb-1 flex items-center gap-1"><Lightbulb className="w-2.5 h-2.5" /> Skill Upgrades Recommended</p>
                    <ul className="space-y-0.5">{upgrades.map((u, i) => (
                      <li key={i} className="text-[9px] text-muted-foreground">• <span className="text-foreground font-medium">{u.skill || u}</span> — {u.description || u.priority || ''}</li>
                    ))}</ul>
                  </div>
                )}

                {nextActions.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-foreground mb-1">Next Actions</p>
                    <ul className="space-y-0.5">{nextActions.map((a, i) => <li key={i} className="text-[9px] text-muted-foreground">→ {a}</li>)}</ul>
                  </div>
                )}

                <p className="text-[8px] text-muted-foreground/50">{new Date(ref.created_date).toLocaleString()}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}