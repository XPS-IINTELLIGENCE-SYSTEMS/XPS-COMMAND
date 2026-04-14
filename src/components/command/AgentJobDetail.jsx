import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Play, Pause, StopCircle, ArrowRight, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const STATUS_BADGE = {
  complete: { variant: "default", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  running: { variant: "default", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  queued: { variant: "default", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  failed: { variant: "default", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  paused: { variant: "default", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { variant: "default", className: "bg-muted/50 text-muted-foreground/50 border-border/50" },
};

export default function AgentJobDetail({ job, onClose, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!job) return null;

  let parsedResult = null;
  if (job.result) {
    try { parsedResult = JSON.parse(job.result); } catch { parsedResult = { summary: job.result }; }
  }

  const runAction = async (action) => {
    setActionLoading(true);
    try {
      await base44.functions.invoke('agentRunner', { action, job_id: job.id });
      toast({ title: `Job ${action}ed` });
      if (onRefresh) onRefresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.queued;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{job.agent_type}</span>
          <Badge className={cn("text-[10px]", badge.className)}>{job.status}</Badge>
        </div>
        <div className="flex items-center gap-1">
          {job.status === "queued" && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => runAction('run')} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-green-400" />}
            </Button>
          )}
          {job.status === "running" && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => runAction('pause')} disabled={actionLoading}>
              <Pause className="w-3 h-3 text-amber-400" />
            </Button>
          )}
          {(job.status === "queued" || job.status === "running") && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => runAction('cancel')} disabled={actionLoading}>
              <StopCircle className="w-3 h-3 text-red-400" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Task</div>
            <p className="text-sm text-foreground">{job.job_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground/60">Priority:</span>
              <span className="ml-1 text-foreground">{job.priority || 5}/10</span>
            </div>
            <div>
              <span className="text-muted-foreground/60">Trigger:</span>
              <span className="ml-1 text-foreground">{job.trigger_source || "manual"}</span>
            </div>
            {job.started_at && (
              <div>
                <span className="text-muted-foreground/60">Started:</span>
                <span className="ml-1 text-foreground">{new Date(job.started_at).toLocaleString()}</span>
              </div>
            )}
            {job.completed_at && (
              <div>
                <span className="text-muted-foreground/60">Completed:</span>
                <span className="ml-1 text-foreground">{new Date(job.completed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {job.output_handed_to && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-blue-300">Handed off to <strong>{job.output_handed_to}</strong> Agent</span>
            </div>
          )}

          {job.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Error</span>
              </div>
              <p className="text-xs text-red-300">{job.error}</p>
            </div>
          )}

          {parsedResult && (
            <>
              {parsedResult.summary && (
                <div>
                  <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Summary</div>
                  <p className="text-sm text-foreground/90">{parsedResult.summary}</p>
                </div>
              )}
              {parsedResult.actions && parsedResult.actions.length > 0 && (
                <div>
                  <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Actions Taken</div>
                  <ul className="space-y-1">
                    {parsedResult.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsedResult.findings && (
                <div>
                  <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Findings</div>
                  <p className="text-xs text-foreground/70">{parsedResult.findings}</p>
                </div>
              )}
              {parsedResult.next_steps && parsedResult.next_steps.length > 0 && (
                <div>
                  <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Recommended Next Steps</div>
                  <ul className="space-y-1">
                    {parsedResult.next_steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                        <Clock className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {job.execution_log && (
            <div>
              <div className="text-[10px] text-muted-foreground/60 uppercase mb-1">Execution Log</div>
              <pre className="text-[10px] text-muted-foreground bg-black/30 rounded p-2 whitespace-pre-wrap">{job.execution_log}</pre>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}