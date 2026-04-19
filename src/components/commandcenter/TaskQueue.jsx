import { ListOrdered, Play, X, RotateCcw, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

export default function TaskQueue({ queuedJobs, onRefresh }) {
  const [acting, setActing] = useState(null);

  const handleAction = async (jobId, command) => {
    setActing(jobId);
    try {
      await base44.functions.invoke("autonomousEngine", { action: "control", job_id: jobId, command });
      onRefresh?.();
    } catch { /* ignore */ }
    setActing(null);
  };

  const handleExecute = async (jobId) => {
    setActing(jobId);
    try {
      await base44.functions.invoke("autonomousEngine", { action: "execute_job", job_id: jobId });
      onRefresh?.();
    } catch { /* ignore */ }
    setActing(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ListOrdered className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">Task Queue</span>
        <span className="text-[10px] text-muted-foreground">({(queuedJobs || []).length})</span>
      </div>
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
        {(queuedJobs || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Queue empty</p>
        )}
        {(queuedJobs || []).map((job) => (
          <div key={job.id} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
            <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-primary">{job.agent_type}</span>
                <span className="text-[9px] text-muted-foreground">P{job.priority || 5}</span>
              </div>
              <p className="text-[11px] text-foreground truncate">{job.description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleExecute(job.id)}
                disabled={acting === job.id}
                className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors"
                title="Run now"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleAction(job.id, "cancel")}
                disabled={acting === job.id}
                className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}