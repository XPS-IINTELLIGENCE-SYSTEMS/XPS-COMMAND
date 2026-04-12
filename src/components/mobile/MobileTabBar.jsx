import { cn } from "@/lib/utils";
import MetalIcon from "../shared/MetalIcon";

const tabs = [
  { id: "command", label: "Home" },
  { id: "find_work", label: "Find" },
  { id: "get_work", label: "Get" },
  { id: "do_work", label: "Do" },
  { id: "get_paid", label: "Paid" },
  { id: "tips", label: "Tips" },
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
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MetalIcon id={tab.id} size="xs" />
            <span className={cn("text-[11px] font-medium", isActive && "xps-gold-slow-shimmer")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}