import { Zap, Search, MessageSquare, Trophy, DollarSign, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "command", label: "Home", icon: Zap },
  { id: "find_work", label: "Find", icon: Search },
  { id: "get_work", label: "Get", icon: MessageSquare },
  { id: "win_work", label: "Win", icon: Trophy },
  { id: "get_paid", label: "Paid", icon: DollarSign },
  { id: "tips", label: "Tips", icon: Lightbulb },
];

export default function MobileTabBar({ activeView, onViewChange }) {
  return (
    <div className="flex items-stretch justify-around border-t border-border bg-card/95 backdrop-blur-md safe-bottom select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "metallic-gold-icon" : "")} />
            <span className={cn("text-[11px] font-medium", isActive && "xps-gold-slow-shimmer")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}