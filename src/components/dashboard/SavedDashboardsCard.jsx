import { useState, useEffect } from "react";
import { LayoutDashboard, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRE_GENERATED = [
  { id: "call_center", label: "Call Center", desc: "Sales call management", icon: "Phone", color: "#ef4444" },
  { id: "master_ops", label: "Master Ops", desc: "Operations control", icon: "Gauge", color: "#8b5cf6" },
  { id: "lead_sniper", label: "Lead Sniper", desc: "Lead automation", icon: "Target", color: "#f59e0b" },
];

export default function SavedDashboardsCard({ onOpenTool }) {
  const [customDashboards, setCustomDashboards] = useState([]);

  useEffect(() => {
    loadCustomDashboards();
  }, []);

  const loadCustomDashboards = async () => {
    try {
      // Fetch saved dashboards from user profile or database
      const user = await base44.auth.me();
      if (user?.saved_dashboards) {
        const saved = typeof user.saved_dashboards === "string" 
          ? JSON.parse(user.saved_dashboards) 
          : user.saved_dashboards;
        setCustomDashboards(saved);
      }
    } catch (error) {
      console.error("Failed to load dashboards:", error);
    }
  };

  const handleLoadDashboard = (dashboardId) => {
    onOpenTool?.(dashboardId);
  };

  const allDashboards = [...PRE_GENERATED, ...customDashboards];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
          Saved Dashboards
        </h3>
        <span className="text-[10px] text-muted-foreground">{allDashboards.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allDashboards.map((dashboard) => (
          <button
            key={dashboard.id}
            onClick={() => handleLoadDashboard(dashboard.id)}
            className="p-2.5 rounded-lg glass-card hover:bg-white/10 transition-all text-left text-[10px] group"
          >
            <div 
              className="w-6 h-6 rounded-md flex items-center justify-center mb-1.5 flex-shrink-0" 
              style={{ background: `${dashboard.color}20` }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: dashboard.color }}
              />
            </div>
            <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {dashboard.label}
            </div>
            <div className="text-[8px] text-muted-foreground truncate">
              {dashboard.desc}
            </div>
          </button>
        ))}

        <button
          onClick={() => onOpenTool?.("add_dashboard")}
          className="p-2.5 rounded-lg glass-card hover:bg-white/10 transition-all flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-medium">New</span>
        </button>
      </div>
    </div>
  );
}