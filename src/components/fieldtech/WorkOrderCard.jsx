import { MapPin, Ruler, Clock, ChevronRight } from "lucide-react";

const PHASE_COLORS = {
  discovered: "bg-gray-500",
  pre_bid: "bg-yellow-500",
  bidding: "bg-orange-500",
  awarded: "bg-blue-500",
  under_construction: "bg-green-500",
  complete: "bg-emerald-600",
};

export default function WorkOrderCard({ job, onClick }) {
  const phase = job.project_phase || "discovered";
  const dotColor = PHASE_COLORS[phase] || "bg-gray-500";

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] active:bg-white/[0.06] transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
            <h3 className="text-sm font-bold text-white truncate">{job.job_name}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}, {job.state}</span>
            {(job.flooring_sqft || job.total_sqft) > 0 && (
              <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{(job.flooring_sqft || job.total_sqft).toLocaleString()} sqft</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/60">
              {(job.project_type || "").replace(/_/g, " ")}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/60">
              {phase.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/20 mt-1 flex-shrink-0" />
      </div>
    </button>
  );
}