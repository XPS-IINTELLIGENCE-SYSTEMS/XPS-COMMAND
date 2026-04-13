import { Play, Pause, Trash2, Clock, MapPin, Tag, Hash, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  Idle: "text-muted-foreground",
  Running: "text-yellow-400",
  Completed: "text-green-400",
  Failed: "text-red-400",
  Scheduled: "text-blue-400",
};

export default function SchedulerJobList({ jobs, onRun, onToggle, onDelete }) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl p-12 text-center bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]">
        <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-lg font-bold text-muted-foreground">No scrape jobs yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Create your first job above to start generating leads</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold metallic-silver tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          YOUR SCRAPE JOBS
        </h2>
        <span className="text-sm text-muted-foreground">{jobs.length} jobs</span>
      </div>

      {jobs.map((job, i) => (
        <div key={job.id}
          className={cn(
            "rounded-2xl p-5 transition-all duration-300 animated-silver-border",
            i % 2 === 0
              ? "bg-black/50 backdrop-blur-xl border border-white/[0.08]"
              : "bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12]",
            !job.is_active && "opacity-50"
          )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-foreground truncate">{job.name}</span>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1]", STATUS_COLORS[job.status] || "text-muted-foreground")}>
                  {job.status}
                </span>
                {!job.is_active && <span className="text-xs text-muted-foreground/50 font-semibold">PAUSED</span>}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                {job.keywords && (
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{job.keywords}</span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                )}
                {job.schedule && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{job.schedule}</span>
                )}
                {job.results_count > 0 && (
                  <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{job.results_count} leads/run</span>
                )}
                {job.industry && (
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{job.industry}</span>
                )}
              </div>

              {job.run_count > 0 && (
                <div className="text-xs text-muted-foreground/50 mt-2">
                  {job.run_count} runs · Last: {job.last_run ? new Date(job.last_run).toLocaleString() : "—"}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => onRun(job)} className="text-xs">
                <Play className="w-3.5 h-3.5 mr-1" />Run Now
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onToggle(job)} className="h-8 w-8">
                {job.is_active ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-green-400" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(job)} className="h-8 w-8">
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}