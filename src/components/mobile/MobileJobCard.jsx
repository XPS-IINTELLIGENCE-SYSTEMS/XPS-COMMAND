import { MapPin, Ruler, DollarSign, Star } from "lucide-react";
import { StatusBadge } from "../shared/DataPageLayout";

export default function MobileJobCard({ job, phaseColors }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card/30">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{job.job_name}</div>
          <div className="text-xs text-muted-foreground truncate">{job.gc_name || "—"}</div>
        </div>
        <StatusBadge status={job.project_phase || "—"} colorMap={phaseColors} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}, {job.state}</span>
        {job.project_type && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{(job.project_type || "").replace(/_/g, " ")}</span>
        )}
        {job.total_sqft > 0 && (
          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{job.total_sqft.toLocaleString()}</span>
        )}
        {job.project_value > 0 && (
          <span className="flex items-center gap-1 text-foreground font-medium"><DollarSign className="w-3 h-3" />{job.project_value.toLocaleString()}</span>
        )}
        {job.lead_score > 0 && (
          <span className="flex items-center gap-1 text-primary font-bold"><Star className="w-3 h-3" />{job.lead_score}</span>
        )}
      </div>
    </div>
  );
}