import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ApprovalCard from "./ApprovalCard";

export default function ApprovalQueueView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("approval_required");

  useEffect(() => { loadItems(); }, [filter]);

  const loadItems = async () => {
    setLoading(true);
    const query = filter === "all" ? {} : { status: filter };
    const results = await base44.entities.AgentActivity.filter(query, "-created_date", 100).catch(() => []);
    setItems(results);
    setLoading(false);
  };

  const handleApprove = async (item) => {
    await base44.entities.AgentActivity.update(item.id, {
      status: "success",
      resolved_at: new Date().toISOString(),
    });
    toast({ title: "Approved", description: `${item.action} approved and executed.` });
    loadItems();
  };

  const handleReject = async (item) => {
    await base44.entities.AgentActivity.update(item.id, {
      status: "failed",
      resolved_at: new Date().toISOString(),
    });
    toast({ title: "Rejected", description: `${item.action} rejected.` });
    loadItems();
  };

  const pendingCount = items.filter(i => i.status === "approval_required").length;
  const filters = [
    { key: "approval_required", label: "Pending", icon: Clock, color: "text-yellow-400" },
    { key: "success", label: "Approved", icon: CheckCircle2, color: "text-green-400" },
    { key: "failed", label: "Rejected", icon: XCircle, color: "text-red-400" },
    { key: "all", label: "All", icon: Eye, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold metallic-gold">Human Approval Queue</h2>
          <p className="text-xs text-muted-foreground">Review AI agent actions before execution</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{pendingCount} awaiting review</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              filter === f.key ? "glass-card-active" : "glass-card hover:bg-white/[0.05]"
            }`}
          >
            <f.icon className={`w-3 h-3 ${filter === f.key ? f.color : "text-muted-foreground"}`} />
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-green-500/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {filter === "approval_required" ? "No items pending approval" : "No items found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <ApprovalCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}