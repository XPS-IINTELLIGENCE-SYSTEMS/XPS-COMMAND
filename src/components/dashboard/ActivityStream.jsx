import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Loader2, Filter, RefreshCw } from "lucide-react";
import ActivityStreamItem from "./ActivityStreamItem";
import ActivityDetailModal from "./ActivityDetailModal";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "approval_required", label: "Needs Approval" },
  { value: "failed", label: "Failed" },
];

export default function ActivityStream() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    const data = await base44.entities.AgentActivity.list("-created_date", 50);
    setActivities(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadActivities();

    // Real-time subscription
    const unsubscribe = base44.entities.AgentActivity.subscribe((event) => {
      if (event.type === "create") {
        setActivities(prev => [event.data, ...prev].slice(0, 50));
      } else if (event.type === "update") {
        setActivities(prev => prev.map(a => a.id === event.id ? event.data : a));
      } else if (event.type === "delete") {
        setActivities(prev => prev.filter(a => a.id !== event.id));
      }
    });

    return unsubscribe;
  }, []);

  const filtered = filter === "all" ? activities : activities.filter(a => a.status === filter);

  const handleApprove = async (activity) => {
    await base44.entities.AgentActivity.update(activity.id, {
      status: "success",
      resolved_at: new Date().toISOString(),
    });
    setSelectedActivity(null);
  };

  const handleDismiss = async (activity) => {
    await base44.entities.AgentActivity.update(activity.id, {
      status: "failed",
      resolved_at: new Date().toISOString(),
    });
    setSelectedActivity(null);
  };

  const approvalCount = activities.filter(a => a.status === "approval_required").length;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-[13px] sm:text-[15px] font-bold text-white">Activity Stream</h2>
          {approvalCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-400/20 text-orange-400 text-[10px] font-bold">
              {approvalCount}
            </span>
          )}
        </div>
        <button
          onClick={() => loadActivities(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <Filter className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? "metallic-gold-bg text-background"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[12px] text-muted-foreground">
            {filter === "all" ? "No agent activity yet. Activities will appear here as agents perform actions." : `No ${filter.replace("_", " ")} activities.`}
          </div>
        ) : (
          filtered.map(activity => (
            <ActivityStreamItem
              key={activity.id}
              activity={activity}
              onViewDetails={setSelectedActivity}
            />
          ))
        )}
      </div>

      {/* Detail modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}