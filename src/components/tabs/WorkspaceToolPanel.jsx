import { X } from "lucide-react";
import { DEFAULT_TOOLS } from "@/components/dashboard/dashboardDefaults";
import { ICON_MAP } from "@/components/dashboard/dashboardDefaults";

export default function WorkspaceToolPanel({ toolIds, onOpenTool, onRemoveTool }) {
  const tools = toolIds.map(id => DEFAULT_TOOLS.find(t => t.id === id)).filter(Boolean);

  if (tools.length === 0) return null;

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Workspace Tools</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tools.map((tool) => {
          const Icon = ICON_MAP[tool.iconName];
          return (
            <div
              key={tool.id}
              className="glass-card rounded-xl p-3 group cursor-pointer hover:scale-[1.02] transition-all relative"
              onClick={() => onOpenTool(tool.id)}
            >
              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveTool(tool.id); }}
                className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>

              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: tool.color + "20" }}
              >
                {Icon ? <Icon className="w-4.5 h-4.5" style={{ color: tool.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />}
              </div>
              <div className="text-sm font-semibold text-foreground truncate">{tool.label}</div>
              <div className="text-[11px] text-muted-foreground truncate">{tool.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}