import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BarChart3, Search, Shield } from "lucide-react";
import NavIcon from "../shared/NavIcon";

const tabs = [
  { id: "command", label: "Home", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "analytics", label: "Charts", icon: BarChart3 },
  { id: "find_work", label: "Find", icon: Search },
  { id: "admin", label: "Admin", icon: Shield },
];

export default function MobileTabBar({ activeView, onViewChange }) {
  return (
    <div className="flex items-center justify-around border-t border-border bg-card/80 backdrop-blur-md safe-bottom py-1.5">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive && "metallic-gold-icon")} />
            <span className={cn("text-[9px] font-medium", isActive && "xps-gold-slow-shimmer")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}