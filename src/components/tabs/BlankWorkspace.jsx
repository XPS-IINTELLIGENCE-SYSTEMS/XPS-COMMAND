import { useState } from "react";
import { Save, Share2, Mail, StickyNote, Wrench, FolderOpen, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import WorkspaceNotes from "./WorkspaceNotes";
import WorkspaceToolPicker from "./WorkspaceToolPicker";
import WorkspaceToolPanel from "./WorkspaceToolPanel";
import GoogleAppsBar from "./GoogleAppsBar";
import GoogleAppEmbed from "./GoogleAppEmbed";
import WorkspaceBrowser from "./WorkspaceBrowser";

export default function BlankWorkspace({
  tab, onUpdateTab, onOpenTool, projects, onOpenProjects, onSetTabProject,
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [activeGoogleApp, setActiveGoogleApp] = useState(null);

  const handleSave = () => {
    onUpdateTab(tab.id, { savedAt: new Date().toISOString() });
    toast({ title: "Workspace saved", description: `"${tab.name}" has been saved.` });
  };

  const handleShare = () => {
    const text = `Workspace: ${tab.name}\nNotes: ${tab.notes || "(none)"}\nTools: ${(tab.tools || []).length} added\nProject: ${tab.projectId ? projects.find(p => p.id === tab.projectId)?.name : "None"}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Workspace summary copied." });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Workspace: ${tab.name}`);
    const body = encodeURIComponent(`Workspace: ${tab.name}\n\nNotes:\n${tab.notes || "(none)"}\n\nTools added: ${(tab.tools || []).length}\nProject: ${tab.projectId ? projects.find(p => p.id === tab.projectId)?.name : "None"}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  const handleAddTools = (toolIds) => {
    const existing = tab.tools || [];
    const merged = [...new Set([...existing, ...toolIds])];
    onUpdateTab(tab.id, { tools: merged });
    setShowToolPicker(false);
  };

  const handleRemoveTool = (toolId) => {
    onUpdateTab(tab.id, { tools: (tab.tools || []).filter(id => id !== toolId) });
  };

  const linkedProject = tab.projectId ? projects.find(p => p.id === tab.projectId) : null;

  const ACTION_BUTTONS = [
    { id: "save", label: "Save", icon: Save, onClick: handleSave, color: "#22c55e" },
    { id: "share", label: "Share", icon: Share2, onClick: handleShare, color: "#6366f1" },
    { id: "email", label: "Email", icon: Mail, onClick: handleEmail, color: "#06b6d4" },
    { id: "notes", label: "Notes", icon: StickyNote, onClick: () => setShowNotes(!showNotes), color: "#f59e0b", active: showNotes },
    { id: "tools", label: "Add Tools", icon: Wrench, onClick: () => setShowToolPicker(true), color: "#ec4899" },
    { id: "project", label: linkedProject ? linkedProject.name : "Link Project", icon: FolderOpen, onClick: onOpenProjects, color: linkedProject?.color || "#8b5cf6" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8">
      {/* Action buttons — centered row */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {ACTION_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                btn.active
                  ? "bg-white/10 border-white/20 text-foreground"
                  : "glass-card hover:scale-105 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" style={{ color: btn.color }} />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Google Apps Bar */}
      <GoogleAppsBar activeApp={activeGoogleApp} onSelectApp={setActiveGoogleApp} />

      {/* Active Google App or Web Browser */}
      {activeGoogleApp === "browser" && (
        <div className="w-full mb-6">
          <WorkspaceBrowser onClose={() => setActiveGoogleApp(null)} />
        </div>
      )}
      {activeGoogleApp && activeGoogleApp !== "browser" && (
        <div className="w-full mb-6">
          <GoogleAppEmbed appId={activeGoogleApp} onClose={() => setActiveGoogleApp(null)} />
        </div>
      )}

      {/* Notes panel — inline expandable */}
      {showNotes && (
        <div className="w-full max-w-2xl mb-6">
          <WorkspaceNotes
            notes={tab.notes || ""}
            onChange={(val) => onUpdateTab(tab.id, { notes: val })}
            onClose={() => setShowNotes(false)}
          />
        </div>
      )}

      {/* Tools the user has added to this workspace */}
      {(tab.tools || []).length > 0 && (
        <div className="w-full max-w-4xl mb-6">
          <WorkspaceToolPanel
            toolIds={tab.tools}
            onOpenTool={onOpenTool}
            onRemoveTool={handleRemoveTool}
          />
        </div>
      )}

      {/* Empty state when nothing is active */}
      {!showNotes && !activeGoogleApp && (tab.tools || []).length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground/60 mb-1">Empty workspace</p>
            <p className="text-xs text-muted-foreground/40">Use the Google apps above or action buttons to get started</p>
          </div>
        </div>
      )}

      {/* Tool picker modal */}
      {showToolPicker && (
        <WorkspaceToolPicker
          existingTools={tab.tools || []}
          onAdd={handleAddTools}
          onClose={() => setShowToolPicker(false)}
        />
      )}
    </div>
  );
}