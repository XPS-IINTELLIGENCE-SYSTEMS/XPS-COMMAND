import { useState } from "react";
import { X, Search, Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_TOOLS, TOOL_CATEGORIES } from "@/components/dashboard/dashboardDefaults";
import { ICON_MAP } from "@/components/dashboard/dashboardDefaults";

export default function WorkspaceToolPicker({ existingTools, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = search.trim()
    ? DEFAULT_TOOLS.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase())
      )
    : DEFAULT_TOOLS;

  const alreadyAdded = new Set(existingTools || []);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10vh] bottom-[10vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Add Tools to Workspace</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Tools list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.map((tool) => {
            const isAlready = alreadyAdded.has(tool.id);
            const isSelected = selected.includes(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => !isAlready && toggle(tool.id)}
                disabled={isAlready}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isAlready
                    ? "opacity-40 cursor-not-allowed"
                    : isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tool.color + "20" }}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4" style={{ color: tool.color }} />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{tool.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{tool.desc}</div>
                </div>
                {isAlready && <span className="text-[10px] text-muted-foreground">Added</span>}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{selected.length} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={selected.length === 0} onClick={() => onAdd(selected)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add {selected.length > 0 ? `(${selected.length})` : ""}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}