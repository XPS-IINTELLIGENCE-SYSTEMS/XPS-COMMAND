import { useState } from "react";
import { GripVertical, X, Pencil, ChevronDown, ChevronUp, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardSection({
  section,
  editMode,
  dragHandleProps,
  onRemove,
  onToggleCollapse,
  onToggleSize,
  onRename,
  children,
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(section.title);

  const commitRename = () => {
    if (nameVal.trim()) onRename(nameVal.trim());
    setRenaming(false);
  };

  const collapsed = section.collapsed;
  const fullWidth = section.size === "full";

  return (
    <div
      className={cn(
        "rounded-xl transition-all relative group/section",
        "ring-1 ring-border/60 hover:ring-primary/30",
        collapsed && "opacity-70"
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] rounded-t-xl border-b border-white/[0.06]">
          {/* Drag handle */}
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/10">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
          )}

          {/* Title */}
          {renaming ? (
            <input
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => e.key === "Enter" && commitRename()}
              className="text-[11px] font-bold text-foreground bg-transparent border-b border-primary/40 outline-none flex-1 min-w-0"
              autoFocus
            />
          ) : (
            <span className="text-[11px] font-bold text-foreground/80 flex-1 truncate">{section.title}</span>
          )}

          {/* Actions */}
          {editMode && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={() => setRenaming(!renaming)} className="p-1 rounded hover:bg-white/10" title="Rename">
                <Pencil className="w-3 h-3 text-muted-foreground/60" />
              </button>
              <button onClick={onToggleSize} className="p-1 rounded hover:bg-white/10" title={fullWidth ? "Half width" : "Full width"}>
                {fullWidth ? <Minimize2 className="w-3 h-3 text-muted-foreground/60" /> : <Maximize2 className="w-3 h-3 text-muted-foreground/60" />}
              </button>
              <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-white/10" title={collapsed ? "Expand" : "Collapse"}>
                {collapsed ? <ChevronDown className="w-3 h-3 text-muted-foreground/60" /> : <ChevronUp className="w-3 h-3 text-muted-foreground/60" />}
              </button>
              <button onClick={onRemove} className="p-1 rounded hover:bg-red-500/20" title="Remove section">
                <X className="w-3 h-3 text-red-400/60" />
              </button>
            </div>
          )}
          </div>

      {/* Content */}
      {!collapsed && (
        <div className={cn(editMode && "rounded-b-xl")}>
          {children}
        </div>
      )}
      {collapsed && (
        <button onClick={onToggleCollapse} className="w-full py-2 text-[10px] text-muted-foreground hover:text-foreground text-center">
          Click to expand
        </button>
      )}
    </div>
  );
}