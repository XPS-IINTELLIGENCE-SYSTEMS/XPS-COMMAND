import { BarChart3, CheckCircle2, AlertCircle, Zap, ListOrdered, TrendingUp } from "lucide-react";

export default function PerformanceBar({ stats }) {
  const metrics = [
    { label: "Running", value: stats?.running || 0, icon: Zap, color: "text-green-400" },
    { label: "Queued", value: stats?.queued || 0, icon: ListOrdered, color: "text-blue-400" },
    { label: "Done Today", value: stats?.completed_today || 0, icon: CheckCircle2, color: "text-primary" },
    { label: "Total Done", value: stats?.completed_total || 0, icon: TrendingUp, color: "text-foreground" },
    { label: "Failed", value: stats?.failed || 0, icon: AlertCircle, color: "text-red-400" },
    { label: "Success Rate", value: `${stats?.success_rate || 0}%`, icon: BarChart3, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
            <Icon className={`w-3.5 h-3.5 ${m.color} flex-shrink-0`} />
            <div>
              <div className="text-sm font-bold text-foreground leading-none">{m.value}</div>
              <div className="text-[9px] text-muted-foreground">{m.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}