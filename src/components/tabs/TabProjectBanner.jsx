import { FolderOpen, Plus } from "lucide-react";

/**
 * Shows a small banner at the top of a dashboard tab indicating which project
 * it belongs to, with a "New Project" shortcut if no project is linked.
 */
export default function TabProjectBanner({ project, onOpenProjects }) {
  if (project) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
        <span className="text-xs font-semibold text-foreground">{project.name}</span>
        <span className="text-[10px] text-muted-foreground ml-1">— Project Workspace</span>
      </div>
    );
  }

  return (
    <button
      onClick={onOpenProjects}
      className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg border border-dashed border-border hover:border-primary/30 transition-colors w-full text-left"
    >
      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Link to a project or create new...</span>
    </button>
  );
}