import { GripVertical, X } from "lucide-react";
import { ICON_MAP } from "../dashboard/dashboardDefaults";
import { Target } from "lucide-react";

export default function FocusToolCard({ tool, onOpen, onRemove, dragHandleProps }) {
  const Icon = ICON_MAP[tool.iconName] || Target;

  return (
    <div className="glass-card shimmer-card rounded-xl relative group/focus overflow-hidden">
      {/* Drag handle */}
      <div {...dragHandleProps} className="absolute top-1 left-1 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover/focus:opacity-100 transition-opacity z-10 rounded hover:bg-white/10">
        <GripVertical className="w-3 h-3 text-muted-foreground/60" />
      </div>

      {/* Remove button */}
      <button onClick={onRemove} className="absolute top-1 right-1 p-1 rounded hover:bg-red-500/20 opacity-0 group-hover/focus:opacity-100 transition-opacity z-10">
        <X className="w-3 h-3 text-red-400" />
      </button>

      {/* Card content */}
      <button onClick={onOpen} className="w-full p-3 pt-4 text-center">
        <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center shimmer-icon-container" style={{ backgroundColor: `${tool.color}15` }}>
          <Icon className="w-5 h-5 shimmer-icon" style={{ color: tool.color }} />
        </div>
        <div className="text-xs font-bold text-foreground truncate">{tool.label}</div>
        <div className="text-[9px] text-muted-foreground truncate mt-0.5">{tool.desc}</div>
      </button>
    </div>
  );
}