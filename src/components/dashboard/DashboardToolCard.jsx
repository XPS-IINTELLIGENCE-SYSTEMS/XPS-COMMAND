import { Star, Pencil } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function DashboardToolCard({ tool, starred, onOpen, onToggleStar, onEdit, dragHandleProps }) {
  const Icon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];

  return (
    <div
      className="group glass-card rounded-xl p-4 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer relative"
      onClick={() => onOpen(tool.id)}
      {...dragHandleProps}
    >
      {/* Star + Edit buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(tool); }}
          className="p-1.5 rounded-md hover:bg-secondary/80"
          title="Edit card"
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(tool.id); }}
          className="p-1.5 rounded-md hover:bg-secondary/80"
          title={starred ? "Unstar" : "Star"}
        >
          <Star className={cn("w-3.5 h-3.5", starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      </div>

      {/* Star indicator (always visible when starred) */}
      {starred && (
        <div className="absolute top-2.5 right-2.5 group-hover:hidden">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors"
        style={{ backgroundColor: `${tool.color}15` }}
      >
        <Icon className="w-5 h-5 transition-colors" style={{ color: tool.color }} />
      </div>
      <div className="text-sm font-bold text-foreground">{tool.label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{tool.desc}</div>
    </div>
  );
}