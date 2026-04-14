import { cn } from "@/lib/utils";
import { Activity, Pause, AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";

const STATUS_CONFIG = {
  running: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", pulse: true, icon: Activity, label: "Running" },
  queued: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", pulse: false, icon: Clock, label: "Queued" },
  paused: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", pulse: false, icon: Pause, label: "Paused" },
  idle: { color: "text-muted-foreground", bg: "bg-secondary/50 border-border", pulse: false, icon: Zap, label: "Idle" },
  error: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", pulse: true, icon: AlertTriangle, label: "Error" },
};

export default function AgentStatusCard({ agentType, stats, onAction }) {
  const hasRunning = stats?.running > 0;
  const hasQueued = stats?.queued > 0;
  const hasFailed = stats?.failed > 0;

  let status = "idle";
  if (hasRunning) status = "running";
  else if (hasFailed && !stats?.completed) status = "error";
  else if (hasQueued) status = "queued";

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const total = (stats?.completed || 0) + (stats?.failed || 0);

  return (
    <div className={cn(
      "glass-card rounded-xl p-4 border transition-all duration-300 cursor-pointer hover:scale-[1.02]",
      config.bg,
      config.pulse && "animate-pulse"
    )} onClick={() => onAction && onAction(agentType)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", hasRunning ? "bg-green-400 animate-pulse" : hasFailed ? "bg-red-400" : hasQueued ? "bg-amber-400" : "bg-muted-foreground/40")} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">{agentType}</span>
        </div>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">{stats?.running || 0}</div>
          <div className="text-[9px] text-muted-foreground">Active</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400">{stats?.queued || 0}</div>
          <div className="text-[9px] text-muted-foreground">Queued</div>
        </div>
        <div>
          <div className="text-lg font-bold text-foreground/60">{total}</div>
          <div className="text-[9px] text-muted-foreground">Done</div>
        </div>
      </div>
      {stats?.last_action && (
        <div className="mt-2 text-[9px] text-muted-foreground/60 truncate">
          Last: {new Date(stats.last_action).toLocaleString()}
        </div>
      )}
    </div>
  );
}