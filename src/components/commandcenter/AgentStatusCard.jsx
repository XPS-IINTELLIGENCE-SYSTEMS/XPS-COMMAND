import { Bot, Play, Pause, AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";

const STATUS_STYLES = {
  running: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Running", icon: Zap },
  idle: { color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", label: "Idle", icon: Clock },
  error: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Error", icon: AlertCircle },
};

export default function AgentStatusCard({ name, stats }) {
  const isRunning = (stats?.running || 0) > 0;
  const hasError = (stats?.failed || 0) > 0 && !isRunning;
  const status = isRunning ? "running" : hasError ? "error" : "idle";
  const style = STATUS_STYLES[status];
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-3 transition-all hover:brightness-110`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bot className={`w-4 h-4 ${style.color}`} />
          <span className="text-xs font-bold text-foreground truncate">{name}</span>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.color} ${style.bg}`}>
          <Icon className="w-2.5 h-2.5" />
          {style.label}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <div className="text-sm font-bold text-foreground">{stats?.running || 0}</div>
          <div className="text-[9px] text-muted-foreground">Active</div>
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{stats?.completed || 0}</div>
          <div className="text-[9px] text-muted-foreground">Done</div>
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{stats?.queued || 0}</div>
          <div className="text-[9px] text-muted-foreground">Queue</div>
        </div>
      </div>
      {stats?.last_action && (
        <p className="text-[10px] text-muted-foreground mt-2 truncate">{stats.last_action}</p>
      )}
    </div>
  );
}