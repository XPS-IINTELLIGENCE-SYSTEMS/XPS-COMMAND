import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, Megaphone, HardHat, DollarSign, Lightbulb } from "lucide-react";

const tabs = [
  { id: "command", label: "Home", Icon: LayoutDashboard },
  { id: "find_work", label: "Find", Icon: Search },
  { id: "get_work", label: "Get", Icon: Megaphone },
  { id: "do_work", label: "Do", Icon: HardHat },
  { id: "get_paid", label: "Paid", Icon: DollarSign },
  { id: "tips", label: "Tips", Icon: Lightbulb },
];

export default function MobileTabBar({ activeView, onViewChange }) {
  return (
    <div className="flex items-stretch justify-around border-t border-border bg-card/95 backdrop-blur-md safe-bottom select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[52px] transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.Icon className={cn("w-5 h-5", isActive && "metallic-gold-icon")} />
            <span className={cn("text-[10px] font-medium", isActive && "xps-gold-slow-shimmer")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}