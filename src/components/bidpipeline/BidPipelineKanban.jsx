import { FileText, Clock, Send, Eye, Trophy, XCircle } from "lucide-react";

const COLUMNS = [
  { id: "not_started", label: "Scope Received", icon: FileText, color: "#64748b" },
  { id: "takeoff_complete", label: "Takeoff Done", icon: Clock, color: "#f59e0b" },
  { id: "submitted", label: "Bid Submitted", icon: Send, color: "#06b6d4" },
  { id: "under_review", label: "Under Review", icon: Eye, color: "#8b5cf6" },
  { id: "won", label: "Won", icon: Trophy, color: "#22c55e" },
  { id: "lost", label: "Lost", icon: XCircle, color: "#ef4444" },
];

export default function BidPipelineKanban({ scopes }) {
  const grouped = {};
  COLUMNS.forEach(c => { grouped[c.id] = []; });
  scopes.forEach(s => {
    const status = s.bid_status || "not_started";
    if (grouped[status]) grouped[status].push(s);
    else if (status === "in_progress") grouped["not_started"].push(s);
    else if (status === "revision_requested") grouped["under_review"].push(s);
    else if (status === "no_response") grouped["lost"].push(s);
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {COLUMNS.map(col => (
        <div key={col.id} className="min-w-[220px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 px-1">
            <col.icon className="w-3.5 h-3.5" style={{ color: col.color }} />
            <span className="text-[11px] font-bold text-foreground">{col.label}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{grouped[col.id].length}</span>
          </div>
          <div className="space-y-2">
            {grouped[col.id].length === 0 && (
              <div className="rounded-lg border border-dashed border-border/40 p-4 text-center text-[10px] text-muted-foreground">Empty</div>
            )}
            {grouped[col.id].map(scope => (
              <div key={scope.id} className="glass-card rounded-lg p-3">
                <div className="text-[11px] font-bold text-foreground truncate">{scope.project_name}</div>
                <div className="text-[10px] text-muted-foreground">{scope.gc_company_name}</div>
                <div className="text-[10px] text-muted-foreground">{scope.project_city}, {scope.project_state}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-primary">
                    {scope.total_flooring_sqft ? `${scope.total_flooring_sqft.toLocaleString()} sqft` : "—"}
                  </span>
                  {scope.total_bid_price > 0 && (
                    <span className="text-[10px] font-bold text-green-400">${scope.total_bid_price.toLocaleString()}</span>
                  )}
                </div>
                {scope.bid_due_date && (
                  <div className="text-[9px] text-red-400 mt-1">Due: {scope.bid_due_date}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}