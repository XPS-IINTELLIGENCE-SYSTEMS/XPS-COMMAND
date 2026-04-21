import { useState } from "react";
import { X, Plus, FolderOpen, Pencil, Trash2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROJECT_COLORS = [
  "#d4af37", "#6366f1", "#06b6d4", "#22c55e", "#f59e0b",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#ef4444",
];

export default function ProjectDrawer({
  open, onClose,
  projects, onCreateProject, onRenameProject, onDeleteProject,
  tabs, onAddTab,
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#d4af37");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const proj = onCreateProject(newName.trim(), newColor);
    // Also open a new tab linked to this project
    onAddTab(newName.trim(), proj.id);
    setNewName("");
    setNewColor("#d4af37");
    setCreating(false);
  };

  const handleRename = (id) => {
    if (editDraft.trim()) onRenameProject(id, editDraft.trim());
    setEditingId(null);
  };

  const openProjectInTab = (project) => {
    // Check if there's already a tab for this project
    const existing = tabs.find(t => t.projectId === project.id);
    if (!existing) {
      onAddTab(project.name, project.id);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Projects</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {projects.length === 0 && !creating && (
            <div className="text-center py-12">
              <FolderOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No projects yet</p>
              <p className="text-xs text-muted-foreground/60">Create a project to organize your work across tabs</p>
            </div>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card rounded-xl p-3 flex items-center gap-3 group hover:border-primary/20 transition-all"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <div className="flex-1 min-w-0">
                {editingId === project.id ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRename(project.id); if (e.key === "Escape") setEditingId(null); }}
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <button onClick={() => handleRename(project.id)} className="p-1 rounded hover:bg-secondary">
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-foreground truncate">{project.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openProjectInTab(project)} className="p-1.5 rounded-lg hover:bg-secondary" title="Open in tab">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => { setEditingId(project.id); setEditDraft(project.name); }} className="p-1.5 rounded-lg hover:bg-secondary" title="Rename">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => onDeleteProject(project.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}

          {/* Create new project form */}
          {creating && (
            <div className="glass-card rounded-xl p-4 space-y-3 border-primary/30">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name..."
                className="text-sm"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              />
              <div className="flex gap-1.5">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${newColor === c ? "ring-2 ring-white scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={!newName.trim()} size="sm" className="gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Create
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button onClick={() => setCreating(true)} className="w-full gap-2" disabled={creating}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>
    </>
  );
}