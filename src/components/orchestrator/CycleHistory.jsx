import { useState } from "react";
import { History, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CYCLE_LABELS = {
  morning_ops: 'Morning Ops', midday_optimize: 'Midday', afternoon_outreach: 'Afternoon',
  evening_analysis: 'Evening', overnight_maintenance: 'Overnight', on_demand: 'On Demand', strategic_review: 'Strategic',
};
const STATUS_ICON = { complete: CheckCircle2, failed: AlertCircle, running: Clock, partial: AlertCircle };
const STATUS_COLOR = { complete: 'text-green-400', failed: 'text-red-400', running: 'text-yellow-400', partial: 'text-yellow-400' };

export default function CycleHistory({ logs }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><History className="w-4 h-4 text-muted-foreground" />Cycle History</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {logs.map((log) => {
          const isExpanded = expandedId === log.id;
          const Icon = STATUS_ICON[log.status] || Clock;
          const color = STATUS_COLOR[log.status] || 'text-muted-foreground';
          let agents = [];
          try { agents = JSON.parse(log.agents_deployed || '[]'); } catch {}

          return (
            <div key={log.id} className="border border-border/50 rounded-lg p-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : log.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <Badge variant="secondary" className="text-[8px]">{CYCLE_LABELS[log.cycle_type] || log.cycle_type}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(log.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {log.health_score > 0 && (
                    <span className={`text-[10px] font-bold ${log.health_score >= 80 ? 'text-green-400' : log.health_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {log.health_score}/100
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </div>
              {!isExpanded && log.summary && (
                <div className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{log.summary.substring(0, 200)}...</div>
              )}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  {log.summary && <div className="text-[10px] text-foreground/85 leading-relaxed whitespace-pre-wrap">{log.summary}</div>}
                  {agents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agents.map((a, i) => <Badge key={i} variant="outline" className="text-[7px]">{a}</Badge>)}
                    </div>
                  )}
                  {log.revenue_impact && <div className="text-[9px] text-primary mt-1">Revenue Impact: {log.revenue_impact}</div>}
                  {log.duration_ms && <div className="text-[8px] text-muted-foreground">Duration: {(log.duration_ms / 1000).toFixed(1)}s</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}