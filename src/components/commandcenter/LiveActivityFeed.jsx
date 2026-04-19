import { Activity, Bot, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

const STATUS_ICON = {
  running: <Loader2 className="w-3 h-3 animate-spin text-green-400" />,
  planning: <Loader2 className="w-3 h-3 animate-spin text-blue-400" />,
  retrying: <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />,
  complete: <CheckCircle2 className="w-3 h-3 text-green-400" />,
  failed: <AlertCircle className="w-3 h-3 text-red-400" />,
  queued: <Clock className="w-3 h-3 text-muted-foreground" />,
  paused: <Clock className="w-3 h-3 text-yellow-400" />,
  cancelled: <AlertCircle className="w-3 h-3 text-muted-foreground" />,
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveActivityFeed({ activeJobs, recentCompleted, recentFailed }) {
  const items = [
    ...(activeJobs || []).map(j => ({ ...j, _type: "active" })),
    ...(recentCompleted || []).slice(0, 15).map(j => ({ ...j, _type: "completed", status: "complete" })),
    ...(recentFailed || []).slice(0, 5).map(j => ({ ...j, _type: "failed", status: "failed" })),
  ].sort((a, b) => {
    const ta = a.started || a.completed_at || "";
    const tb = b.started || b.completed_at || "";
    return tb.localeCompare(ta);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">Live Activity</span>
        {(activeJobs || []).length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 font-semibold">
            {activeJobs.length} running
          </span>
        )}
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No recent activity</p>
        )}
        {items.map((item, i) => (
          <div key={item.id || i} className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors">
            <div className="mt-0.5">{STATUS_ICON[item.status] || STATUS_ICON.queued}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-primary">{item.agent_type}</span>
                {item.step !== undefined && item.total > 0 && (
                  <span className="text-[9px] text-muted-foreground">Step {item.step}/{item.total}</span>
                )}
              </div>
              <p className="text-[11px] text-foreground truncate">{item.description}</p>
              {item.output && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.output}</p>
              )}
              {item.result_summary && (
                <p className="text-[10px] text-green-400/80 truncate mt-0.5">{item.result_summary}</p>
              )}
              {item.error && (
                <p className="text-[10px] text-red-400/80 truncate mt-0.5">{item.error}</p>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
              {timeAgo(item.started || item.completed_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}