import { useState } from "react";
import { GripVertical, X, Pencil, Check, ChevronUp, ChevronDown, Plus } from "lucide-react";
import WorkspaceToolPanel from "./WorkspaceToolPanel";
import WorkspaceNotes from "./WorkspaceNotes";

export default function WorkspaceSection({
  section, index, onUpdate, onRemove, onOpenTool, onRemoveTool, dragHandleProps, onAddTools,
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(section.label || "");
  const [collapsed, setCollapsed] = useState(false);

  const saveLabel = () => {
    onUpdate({ ...section, label: labelDraft.trim() });
    setEditingLabel(false);
  };

  if (section.type === "divider") {
    return (
      <div className="relative flex items-center gap-3 py-2 group">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="flex-1 border-t border-border" />
        {editingLabel ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveLabel(); if (e.key === "Escape") setEditingLabel(false); }}
              className="bg-transparent text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center outline-none border-b border-primary/40 w-32"
              placeholder="Label..."
            />
            <button onClick={saveLabel} className="p-0.5 rounded hover:bg-white/10">
              <Check className="w-3 h-3 text-primary" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setLabelDraft(section.label || ""); setEditingLabel(true); }}
            className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold px-2 hover:text-foreground transition-colors"
          >
            {section.label || "• • •"}
          </button>
        )}
        <div className="flex-1 border-t border-border" />
        <button onClick={() => onRemove(section.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded">
          <X className="w-3 h-3 text-muted-foreground/50" />
        </button>
      </div>
    );
  }

  // Regular section
  return (
    <div className="glass-card rounded-xl overflow-hidden group mb-1">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Section number */}
        <span className="text-[11px] font-bold text-primary/70 min-w-[20px]">{index + 1}.</span>

        {/* Label */}
        {editingLabel ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              autoFocus
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveLabel(); if (e.key === "Escape") setEditingLabel(false); }}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none border-b border-primary/40 py-0.5"
              placeholder="Section title..."
            />
            <button onClick={saveLabel} className="p-1 rounded hover:bg-white/10">
              <Check className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setLabelDraft(section.label || ""); setEditingLabel(true); }} className="flex items-center gap-1 flex-1 text-left">
            <span className="text-sm font-semibold text-foreground truncate">
              {section.label || "Untitled Section"}
            </span>
            <Pencil className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-white/10">
          {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={() => onRemove(section.id)} className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div className="px-4 py-3">
          {section.contentType === "notes" && (
            <WorkspaceNotes
              notes={section.notes || ""}
              onChange={(val) => onUpdate({ ...section, notes: val })}
            />
          )}
          {section.contentType === "tools" && (
            <>
              <WorkspaceToolPanel
                toolIds={section.toolIds || []}
                onOpenTool={onOpenTool}
                onRemoveTool={(toolId) => {
                  onUpdate({ ...section, toolIds: (section.toolIds || []).filter(id => id !== toolId) });
                }}
              />
              {onAddTools && (
                <button
                  onClick={() => onAddTools(section.id)}
                  className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add more tools
                </button>
              )}
            </>
          )}
          {section.contentType === "text" && (
            <textarea
              value={section.text || ""}
              onChange={(e) => onUpdate({ ...section, text: e.target.value })}
              placeholder="Type here..."
              className="w-full bg-transparent text-sm text-foreground outline-none resize-none min-h-[80px] placeholder:text-muted-foreground/30"
            />
          )}
          {!section.contentType && (
            <p className="text-xs text-muted-foreground/40 italic">Empty section — use tools above to add content</p>
          )}
        </div>
      )}
    </div>
  );
}