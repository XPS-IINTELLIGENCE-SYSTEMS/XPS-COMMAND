import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Bot, ChevronDown, ChevronUp, Mail, Search, FileText, Target, Send, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS = {
  outreach: Send,
  proposal: FileText,
  research: Search,
  scraping: Search,
  analysis: Target,
  scheduling: Clock,
  bidding: FileText,
  system: Wrench,
};

const STATUS_CONFIG = {
  approval_required: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Pending" },
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Approved" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rejected" },
  pending: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Processing" },
};

export default function ApprovalCard({ item, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const Icon = CATEGORY_ICONS[item.category] || Bot;

  let details = null;
  try { details = item.details ? JSON.parse(item.details) : null; } catch {}

  const isPending = item.status === "approval_required";

  return (
    <div className={`rounded-xl border ${isPending ? status.border : "border-border"} ${isPending ? "bg-yellow-500/[0.03]" : "bg-card/30"} transition-all`}>
      <div className="flex items-start gap-3 p-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${status.bg}`}>
          <Icon className={`w-4 h-4 ${status.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-foreground">{item.agent_name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
            {item.category && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.category}</span>
            )}
          </div>
          <p className="text-sm text-foreground/80">{item.action}</p>
          {item.related_entity_type && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {item.related_entity_type} {item.related_entity_id ? `#${item.related_entity_id.slice(-6)}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isPending && (
            <>
              <Button size="sm" variant="outline" onClick={onReject} className="h-7 px-2.5 text-[10px] text-red-400 border-red-500/20 hover:bg-red-500/10">
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={onApprove} className="h-7 px-2.5 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
              </Button>
            </>
          )}
          {details && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-secondary">
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          )}
        </div>
      </div>
      {expanded && details && (
        <div className="px-4 pb-4 pt-0">
          <pre className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg p-3 overflow-x-auto max-h-[200px] overflow-y-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
      <div className="px-4 pb-2">
        <span className="text-[9px] text-muted-foreground/50">
          {new Date(item.created_date).toLocaleString()}
          {item.resolved_at && ` · Resolved ${new Date(item.resolved_at).toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}