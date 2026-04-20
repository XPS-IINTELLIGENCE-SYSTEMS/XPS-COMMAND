import { X, CheckCircle2, Clock, AlertTriangle, XCircle, Bot, Tag, FileText, Calendar } from "lucide-react";
import moment from "moment";

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", label: "Success" },
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending" },
  approval_required: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", label: "Approval Required" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
};

export default function ActivityDetailModal({ activity, onClose, onApprove, onDismiss }) {
  if (!activity) return null;
  const config = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  let parsedDetails = null;
  try {
    parsedDetails = activity.details ? JSON.parse(activity.details) : null;
  } catch {
    parsedDetails = activity.details ? { raw: activity.details } : null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Activity Details</h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Action */}
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-relaxed">{activity.action}</p>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Agent</div>
                <div className="text-[12px] font-medium text-foreground">{activity.agent_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">When</div>
                <div className="text-[12px] font-medium text-foreground">{moment(activity.created_date).format("MMM D, h:mm A")}</div>
              </div>
            </div>
            {activity.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</div>
                  <div className="text-[12px] font-medium text-foreground capitalize">{activity.category}</div>
                </div>
              </div>
            )}
            {activity.related_entity_type && (
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Related</div>
                  <div className="text-[12px] font-medium text-foreground">{activity.related_entity_type}</div>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          {parsedDetails && (
            <div className="rounded-xl bg-black/20 border border-white/5 p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Details</div>
              <div className="space-y-1.5">
                {Object.entries(parsedDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-foreground font-medium truncate max-w-[200px]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for approval_required */}
        {activity.status === "approval_required" && (
          <div className="flex items-center gap-3 px-5 py-3 border-t border-white/10">
            <button
              onClick={() => onApprove?.(activity)}
              className="flex-1 py-2 rounded-xl metallic-gold-bg text-background text-[12px] font-bold hover:opacity-90 transition-opacity"
            >
              Approve & Execute
            </button>
            <button
              onClick={() => onDismiss?.(activity)}
              className="flex-1 py-2 rounded-xl border border-white/10 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}