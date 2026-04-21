import { useState } from "react";
import { Bot, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AGENT_COLORS = {
  'Lead Engine': '#d4af37', 'Scraper': '#ef4444', 'Outreach': '#ec4899',
  'System Guardian': '#22c55e', 'Financial Sandbox': '#8b5cf6', 'Bid Engine': '#f59e0b',
  'Research': '#06b6d4', 'Analytics': '#6366f1', 'Orchestrator': '#d4af37',
  'Crypto Agent': '#f97316', 'Passive Intel': '#8b5cf6',
};

export default function AgentActionsFeed({ actions }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!actions || actions.length === 0) return (
    <div className="glass-card rounded-xl p-4 text-center text-xs text-muted-foreground py-8">
      No actions yet. Run a cycle to see agent activity.
    </div>
  );

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 metallic-gold-icon" />Actions Taken</h2>
        <Badge variant="secondary" className="text-[8px]">{actions.length} actions</Badge>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {actions.map((action, i) => {
          const isExpanded = expandedIdx === i;
          const color = AGENT_COLORS[action.agent] || '#888';
          return (
            <div key={i} className="border border-border/50 rounded-lg p-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
              onClick={() => setExpandedIdx(isExpanded ? null : i)}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}20` }}>
                  <Bot className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color }}>{action.agent}</span>
                    {action.executed ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Clock className="w-3 h-3 text-yellow-400" />}
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground ml-auto" /> : <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />}
                  </div>
                  <div className="text-[10px] text-foreground mt-0.5">{action.action}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{action.result}</div>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5 ml-9">
                  {action.reasoning && (
                    <div className="text-[10px] text-foreground/80 bg-white/[0.02] rounded-md p-2">
                      <span className="font-bold text-primary">Why: </span>{action.reasoning}
                    </div>
                  )}
                  {action.target && <div className="text-[9px] text-muted-foreground">Target: {action.target}</div>}
                  {action.expected_impact && <div className="text-[9px] text-green-400/80">Expected Impact: {action.expected_impact}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}