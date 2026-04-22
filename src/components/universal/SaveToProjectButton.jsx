import { useState, useEffect } from "react";
import { Save, FolderPlus, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SaveToProjectButton({
  itemId,
  itemType, // "lead", "proposal", "note", "task"
  toolType, // "leadEngine", "bidding", "notes", etc.
  itemData = {}, // data to save
  onSaved = () => {},
  variant = "outline",
  size = "sm",
  label = "Save",
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (open) loadProjects();
  }, [open]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const result = await base44.entities.Project.filter({
        owner_email: user.email,
        is_archived: false,
      });
      setProjects(result || []);
    } catch (e) {
      console.error("Failed to load projects:", e);
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const project = await base44.entities.Project.create({
        name: newProjectName,
        owner_email: user.email,
        category: "custom",
        color: "#d4af37",
      });
      setSelectedProjectId(project.id);
      setNewProjectName("");
      await loadProjects();
    } catch (e) {
      console.error("Failed to create project:", e);
    }
    setSaving(false);
  };

  const saveToProject = async () => {
    if (!selectedProjectId) return;
    setSaving(true);
    try {
      const project = projects.find(p => p.id === selectedProjectId);
      const items = project.items ? JSON.parse(project.items) : [];
      items.push({
        itemId,
        itemType,
        toolType,
        savedAt: new Date().toISOString(),
        itemData,
      });

      await base44.entities.Project.update(selectedProjectId, {
        items: JSON.stringify(items),
        item_count: items.length,
      });

      // Trigger Google Drive sync
      await base44.functions.invoke("projectGoogleDriveSync", {
        projectId: selectedProjectId,
        itemId,
        itemType,
        itemData,
      });

      setOpen(false);
      onSaved({ projectId: selectedProjectId, projectName: project.name });
    } catch (e) {
      console.error("Failed to save to project:", e);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Project</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* New Project Input */}
            <div className="flex gap-2">
              <Input
                placeholder="New project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={createProject}
                disabled={!newProjectName.trim() || saving}
                className="px-3"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3 h-3" />}
              </Button>
            </div>

            {/* Existing Projects */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Or select existing:</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        selectedProjectId === project.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-[11px] opacity-75">{project.item_count || 0} items</div>
                        </div>
                        {selectedProjectId === project.id && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={saveToProject}
              disabled={!selectedProjectId || saving}
              className="w-full"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
              {saving ? "Saving..." : "Save to Project"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}