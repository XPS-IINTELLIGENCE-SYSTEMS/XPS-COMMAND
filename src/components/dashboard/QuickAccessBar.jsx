import { QUICK_ACCESS_HEADERS } from "./toolCategories";
import { DEFAULT_TOOLS } from "./dashboardDefaults";
import { ICON_MAP } from "./dashboardDefaults";

export default function QuickAccessBar({ onOpenTool }) {
  const toolMap = Object.fromEntries(DEFAULT_TOOLS.map(t => [t.id, t]));

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 px-1">
      {QUICK_ACCESS_HEADERS.map(h => {
        const tool = toolMap[h.id];
        if (!tool) return null;
        const Icon = ICON_MAP[tool.iconName];
        return (
          <button
            key={h.id}
            onClick={() => onOpenTool(h.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[11px] sm:text-[12px] font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-all hover:border-primary/30 shimmer-card"
            style={{ minWidth: "fit-content" }}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shimmer-icon" style={{ color: tool.color }} />}
            {h.label}
          </button>
        );
      })}
    </div>
  );
}