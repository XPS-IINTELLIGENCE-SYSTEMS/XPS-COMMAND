import { CheckCircle2, Clock, AlertTriangle, XCircle, ChevronRight, Bot } from "lucide-react";
import moment from "moment";

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", label: "Success" },
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending" },
  approval_required: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", label: "Approval Required" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
};

const CATEGORY_COLORS = {
  outreach: "border-l-blue-400",
  proposal: "border-l-purple-400",
  research: "border-l-cyan-400",
  scraping: "border-l-emerald-400",
  analysis: "border-l-indigo-400",
  scheduling: "border-l-pink-400",
  bidding: "border-l-amber-400",
  system: "border-l-gray-400",
};

export default function ActivityStreamItem({ activity, onViewDetails }) {
  const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const borderColor = CATEGORY_COLORS[activity.category] || "border-l-gray-400";

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg glass-card border-l-2 ${borderColor} group hover:border-primary/30 transition-all`}>
      {/* Status icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center mt-0.5`}>
        <StatusIcon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] sm:text-[13px] font-medium text-foreground leading-snug truncate">
          {activity.action}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Bot className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{activity.agent_name}</span>
          <span className="text-[10px] text-muted-foreground/50">•</span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
            {moment(activity.created_date).fromNow()}
          </span>
        </div>
      </div>

      {/* Status badge + details button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`hidden sm:inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <button
          onClick={() => onViewDetails(activity)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          title="View details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}