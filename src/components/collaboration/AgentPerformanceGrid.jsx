import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Wrench, CheckCircle2 } from "lucide-react";

const AGENT_COLORS = {
  Coordinator: "#d4af37", Research: "#8b5cf6", Scraper: "#ef4444", Writer: "#ec4899",
  Analyst: "#06b6d4", Coder: "#22c55e", Outreach: "#f59e0b", Proposal: "#14b8a6",
  SEO: "#0ea5e9", Content: "#f97316", Scheduler: "#64748b",
};

export default function AgentPerformanceGrid({ agentPerformance }) {
  if (!agentPerformance || Object.keys(agentPerformance).length === 0) {
    return <div className="text-center py-6 text-xs text-muted-foreground">No performance data yet — run some agent tasks first</div>;
  }

  const sorted = Object.entries(agentPerformance).sort((a, b) => (b[1].complete + b[1].failed) - (a[1].complete + a[1].failed));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {sorted.map(([agent, perf]) => {
        const color = AGENT_COLORS[agent] || "#64748b";
        const total = perf.complete + perf.failed;
        const qualityColor = perf.avg_quality >= 80 ? "text-green-400" : perf.avg_quality >= 60 ? "text-yellow-400" : "text-red-400";
        const rateColor = perf.success_rate >= 90 ? "text-green-400" : perf.success_rate >= 70 ? "text-yellow-400" : "text-red-400";

        return (
          <div key={agent} className="glass-card rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-foreground">{agent}</span>
              </div>
              <Badge className="text-[7px] px-1 py-0" style={{ backgroundColor: `${color}20`, color }}>{total} tasks</Badge>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <p className="text-[8px] text-muted-foreground">Quality</p>
                <p className={`text-sm font-bold ${qualityColor}`}>{perf.avg_quality}<span className="text-[8px] text-muted-foreground">/100</span></p>
              </div>
              <div>
                <p className="text-[8px] text-muted-foreground">Success</p>
                <p className={`text-sm font-bold ${rateColor}`}>{perf.success_rate}<span className="text-[8px] text-muted-foreground">%</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> {perf.complete}</span>
              <span className="flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5 text-red-400" /> {perf.failed}</span>
              {perf.corrections > 0 && (
                <span className="flex items-center gap-0.5"><Wrench className="w-2.5 h-2.5 text-yellow-400" /> {perf.corrections} fixes</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}