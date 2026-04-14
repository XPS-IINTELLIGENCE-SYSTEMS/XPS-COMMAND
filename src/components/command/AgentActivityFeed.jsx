import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Play, Clock, ArrowRight, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUS_ICONS = {
  complete: { icon: CheckCircle2, color: "text-green-400" },
  running: { icon: Play, color: "text-blue-400" },
  queued: { icon: Clock, color: "text-amber-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  paused: { icon: Clock, color: "text-muted-foreground" },
  cancelled: { icon: XCircle, color: "text-muted-foreground/50" },
};

function FeedItem({ job }) {
  const statusConfig = STATUS_ICONS[job.status] || STATUS_ICONS.queued;
  const Icon = statusConfig.icon;
  const time = job.completed_at || job.started_at || job.created_date;

  let resultSummary = "";
  if (job.result) {
    try {
      const parsed = JSON.parse(job.result);
      resultSummary = parsed.summary || "";
    } catch {
      resultSummary = job.result.substring(0, 120);
    }
  }

  return (
    <div className="flex gap-3 py-3 px-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn("w-4 h-4", statusConfig.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{job.agent_type}</span>
          {job.output_handed_to && (
            <>
              <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/80">{job.output_handed_to}</span>
            </>
          )}
        </div>
        <p className="text-xs text-foreground/80 truncate">{job.job_description}</p>
        {resultSummary && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{resultSummary}</p>
        )}
        {job.error && (
          <p className="text-[10px] text-red-400 mt-0.5 truncate">{job.error}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] text-muted-foreground/50">
            {time ? new Date(time).toLocaleString() : "—"}
          </span>
          {job.trigger_source && job.trigger_source !== "manual" && (
            <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />{job.trigger_source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentActivityFeed({ jobs, maxHeight = "h-[500px]" }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No agent activity yet</p>
        <p className="text-xs text-muted-foreground/50 mt-1">Create a job to get started</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Live Activity</span>
        <span className="text-[10px] text-muted-foreground">{jobs.length} events</span>
      </div>
      <ScrollArea className={maxHeight}>
        {jobs.map((job) => (
          <FeedItem key={job.id} job={job} />
        ))}
      </ScrollArea>
    </div>
  );
}