import { GripVertical, X, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import nodeCategories from "./workflowNodes";

const allNodes = nodeCategories.flatMap(c => c.nodes.map(n => ({ ...n, color: c.color })));

export default function WorkflowNodeCard({ node, index, isSelected, onSelect, onRemove, onConfigure, dragHandleProps }) {
  const nodeDef = allNodes.find(n => n.type === node.type) || {};
  const Icon = nodeDef.icon || Zap;
  const color = nodeDef.color || "#6b7280";

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
        "bg-card/80 backdrop-blur-sm",
        isSelected
          ? "border-primary/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
          : "border-border hover:border-white/20"
      )}
    >
      {/* Drag handle */}
      <div {...(dragHandleProps || {})} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary border border-[#8a8a8a]/30">
        <Icon className="w-4 h-4 metallic-silver-icon" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{nodeDef.label || node.type}</div>
        <div className="text-[10px] text-muted-foreground truncate">
          {node.agent ? `Agent: ${node.agent}` : nodeDef.desc || ""}
        </div>
      </div>

      {/* Step number */}
      <div className="text-[9px] font-mono text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
        #{index + 1}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onConfigure(node.id); }} className="p-1 rounded hover:bg-secondary">
          <Settings className="w-3 h-3 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(node.id); }} className="p-1 rounded hover:bg-destructive/20">
          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Connection line */}
      <div className="absolute -bottom-3 left-1/2 w-px h-3 bg-border" />
    </div>
  );
}