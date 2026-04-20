import { useState } from "react";
import { Plus, Trash2, Pencil, X, Check, Search, Wand2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICON_OPTIONS, ICON_MAP, COLOR_OPTIONS, DEFAULT_TOOLS } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function ToolCardManager({ tools, onAddTool, onDeleteTool, onEditTool, onClose }) {
  const [mode, setMode] = useState("list"); // list | add | edit
  const [search, setSearch] = useState("");
  const [editingTool, setEditingTool] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form state for add/edit
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [iconName, setIconName] = useState("Bot");
  const [color, setColor] = useState("#d4af37");

  const filtered = tools.filter(t =>
    !search || t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
  );

  const isCustom = (tool) => tool.id.startsWith("custom_");
  const isDefault = (tool) => DEFAULT_TOOLS.some(d => d.id === tool.id);

  const startAdd = () => {
    setLabel("");
    setDesc("");
    setIconName("Bot");
    setColor("#d4af37");
    setMode("add");
  };

  const startEdit = (tool) => {
    setEditingTool(tool);
    setLabel(tool.label);
    setDesc(tool.desc);
    setIconName(tool.iconName);
    setColor(tool.color);
    setMode("edit");
  };

  const handleSave = () => {
    if (!label.trim()) return;
    if (mode === "add") {
      onAddTool({
        id: `custom_${Date.now()}`,
        label: label.trim(),
        desc: desc.trim(),
        iconName,
        color,
      });
    } else if (mode === "edit" && editingTool) {
      onEditTool({ ...editingTool, label: label.trim(), desc: desc.trim(), iconName, color });
    }
    setMode("list");
    setEditingTool(null);
  };

  const handleDelete = (toolId) => {
    onDeleteTool(toolId);
    setConfirmDelete(null);
  };

  const SelectedIcon = ICON_MAP[iconName] || ICON_MAP["Bot"];

  // Form UI shared between add and edit
  const renderForm = () => (
    <div className="space-y-4">
      <button onClick={() => { setMode("list"); setEditingTool(null); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to list
      </button>

      {/* Live Preview */}
      <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <SelectedIcon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{label || "Untitled"}</div>
          <div className="text-xs text-muted-foreground">{desc || "No description"}</div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Card Name</label>
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Payment Processing" className="h-9 text-sm" autoFocus />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this tool do?" className="h-9 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Icon</label>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
          {ICON_OPTIONS.map(opt => {
            const Ic = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={() => setIconName(opt.name)}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  iconName === opt.name
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-secondary/50 border border-transparent hover:border-border"
                )}
              >
                <Ic className="w-4 h-4" style={{ color: iconName === opt.name ? color : undefined }} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c }}
            >
              {color === c && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={!label.trim()} className="metallic-gold-bg text-background">
          <Check className="w-3.5 h-3.5 mr-1" /> {mode === "add" ? "Add Tool" : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => { setMode("list"); setEditingTool(null); }}>Cancel</Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h3 className="text-base font-bold metallic-gold">Tool Card Manager</h3>
            <p className="text-[10px] text-muted-foreground">Add, edit, or remove dashboard tool cards</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          {mode === "list" ? (
            <div className="space-y-4">
              {/* Search + Add button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tools..."
                    className="h-9 text-sm pl-8"
                  />
                </div>
                <Button onClick={startAdd} className="metallic-gold-bg text-background h-9">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New
                </Button>
              </div>

              {/* Tool list */}
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {filtered.map(tool => {
                  const TIcon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];
                  const custom = isCustom(tool);
                  return (
                    <div key={tool.id} className="flex items-center gap-3 p-3 rounded-xl glass-card group">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}18` }}>
                        <TIcon className="w-4 h-4" style={{ color: tool.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{tool.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{tool.desc}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(tool)}
                          className="p-2 rounded-lg hover:bg-secondary"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        {confirmDelete === tool.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(tool.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20" title="Confirm delete">
                              <Check className="w-3.5 h-3.5 text-destructive" />
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="p-2 rounded-lg hover:bg-secondary" title="Cancel">
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(tool.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10"
                            title={custom ? "Delete custom tool" : "Hide from dashboard"}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">No tools match your search</div>
                )}
              </div>

              <div className="text-[10px] text-muted-foreground text-center pt-2">
                {tools.length} tools total · Custom tools are fully removable · Default tools can be hidden
              </div>
            </div>
          ) : (
            renderForm()
          )}
        </div>
      </div>
    </div>
  );
}