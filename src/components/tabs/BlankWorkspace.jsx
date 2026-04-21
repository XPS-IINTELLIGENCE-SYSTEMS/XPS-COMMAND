import { useState, useCallback } from "react";
import { Save, Share2, Mail, StickyNote, Wrench, FolderOpen, Plus, Pencil, Check } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "@/components/ui/use-toast";
import GoogleAppsBar from "./GoogleAppsBar";
import GoogleAppEmbed from "./GoogleAppEmbed";
import WorkspaceBrowser from "./WorkspaceBrowser";
import WorkspaceToolPicker from "./WorkspaceToolPicker";
import WorkspaceSection from "./WorkspaceSection";
import AddSectionMenu from "./AddSectionMenu";

let sectionIdCounter = Date.now();
const newId = () => `sec_${sectionIdCounter++}`;

export default function BlankWorkspace({
  tab, onUpdateTab, onOpenTool, projects, onOpenProjects,
}) {
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [toolPickerTarget, setToolPickerTarget] = useState(null); // section id or null
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeGoogleApp, setActiveGoogleApp] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(tab.workspaceTitle || tab.name || "");

  const sections = tab.sections || [];

  const updateSections = useCallback((newSections) => {
    onUpdateTab(tab.id, { sections: newSections });
  }, [tab.id, onUpdateTab]);

  // --- Title ---
  const saveTitle = () => {
    const title = titleDraft.trim() || "Untitled Workspace";
    onUpdateTab(tab.id, { workspaceTitle: title, name: title });
    setEditingTitle(false);
  };

  // --- Actions ---
  const handleSave = () => {
    onUpdateTab(tab.id, { savedAt: new Date().toISOString() });
    toast({ title: "Workspace saved", description: `"${tab.workspaceTitle || tab.name}" saved.` });
  };

  const handleShare = () => {
    const text = `Workspace: ${tab.workspaceTitle || tab.name}\nSections: ${sections.length}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Workspace: ${tab.workspaceTitle || tab.name}`);
    const body = encodeURIComponent(`Workspace: ${tab.workspaceTitle || tab.name}\nSections: ${sections.length}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  // --- Section CRUD ---
  const addSection = (type, contentType) => {
    const sec = { id: newId(), type, contentType, label: "", notes: "", text: "", toolIds: [] };
    updateSections([...sections, sec]);
  };

  const updateSection = (updated) => {
    updateSections(sections.map(s => s.id === updated.id ? updated : s));
  };

  const removeSection = (id) => {
    updateSections(sections.filter(s => s.id !== id));
  };

  // --- Tool picker for a tools section ---
  const handleAddToolsToSection = (toolIds) => {
    if (!toolPickerTarget) return;
    updateSections(sections.map(s => {
      if (s.id !== toolPickerTarget) return s;
      const merged = [...new Set([...(s.toolIds || []), ...toolIds])];
      return { ...s, toolIds: merged };
    }));
    setShowToolPicker(false);
    setToolPickerTarget(null);
  };

  // --- Drag & Drop ---
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    updateSections(reordered);
  };

  const linkedProject = tab.projectId ? projects.find(p => p.id === tab.projectId) : null;

  // Number only non-divider sections
  let sectionNumber = 0;

  const ACTION_BUTTONS = [
    { id: "save", label: "Save", icon: Save, onClick: handleSave, color: "#22c55e" },
    { id: "share", label: "Share", icon: Share2, onClick: handleShare, color: "#6366f1" },
    { id: "email", label: "Email", icon: Mail, onClick: handleEmail, color: "#06b6d4" },
    { id: "add", label: "Add Section", icon: Plus, onClick: () => setShowAddMenu(!showAddMenu), color: "#f59e0b", active: showAddMenu },
    { id: "tools", label: "Add Tools", icon: Wrench, onClick: () => { setToolPickerTarget(null); setShowToolPicker(true); }, color: "#ec4899" },
    { id: "project", label: linkedProject ? linkedProject.name : "Link Project", icon: FolderOpen, onClick: onOpenProjects, color: linkedProject?.color || "#8b5cf6" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
      <div className="px-4 pt-6 pb-20 max-w-5xl mx-auto w-full">

        {/* Workspace Title */}
        <div className="flex items-center justify-center mb-6 group">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                className="bg-transparent text-xl md:text-2xl font-bold text-foreground text-center outline-none border-b-2 border-primary/50 pb-1 min-w-[200px]"
                placeholder="Workspace title..."
              />
              <button onClick={saveTitle} className="p-1.5 rounded-lg hover:bg-white/10">
                <Check className="w-4 h-4 text-primary" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTitleDraft(tab.workspaceTitle || tab.name || ""); setEditingTitle(true); }}
              className="flex items-center gap-2 text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {tab.workspaceTitle || tab.name || "Untitled Workspace"}
              <Pencil className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {ACTION_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={btn.onClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
                  btn.active
                    ? "bg-white/10 border-white/20 text-foreground"
                    : "glass-card hover:scale-105 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: btn.color }} />
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Add section menu */}
        {showAddMenu && (
          <div className="mb-4">
            <AddSectionMenu onAdd={addSection} onClose={() => setShowAddMenu(false)} />
          </div>
        )}

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

        {/* Sections with drag & drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="workspace-sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {sections.map((section, idx) => {
                  const isDivider = section.type === "divider";
                  if (!isDivider) sectionNumber++;
                  const displayIdx = isDivider ? -1 : sectionNumber - 1;

                  return (
                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={snapshot.isDragging ? "opacity-80 scale-[1.02]" : ""}
                        >
                          <WorkspaceSection
                            section={section}
                            index={displayIdx}
                            onUpdate={updateSection}
                            onRemove={removeSection}
                            onOpenTool={onOpenTool}
                            onRemoveTool={(toolId) => {
                              updateSection({ ...section, toolIds: (section.toolIds || []).filter(id => id !== toolId) });
                            }}
                            dragHandleProps={prov.dragHandleProps}
                            onAddTools={(secId) => { setToolPickerTarget(secId); setShowToolPicker(true); }}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Quick add button at bottom */}
        {sections.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAddMenu(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground/50 hover:text-foreground border border-dashed border-border hover:border-primary/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add section
            </button>
          </div>
        )}

        {/* Empty state */}
        {sections.length === 0 && !activeGoogleApp && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <Plus className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground/60 mb-1">Empty workspace</p>
            <p className="text-xs text-muted-foreground/40">Click "Add Section" to start building, or use Google apps above</p>
          </div>
        )}

        {/* Bottom padding for infinite scroll feel */}
        <div className="h-40" />
      </div>

      {/* Tool picker modal */}
      {showToolPicker && (
        <WorkspaceToolPicker
          existingTools={toolPickerTarget ? (sections.find(s => s.id === toolPickerTarget)?.toolIds || []) : []}
          onAdd={(toolIds) => {
            if (toolPickerTarget) {
              handleAddToolsToSection(toolIds);
            } else {
              // Add a new tools section with these tools
              const sec = { id: newId(), type: "tools", contentType: "tools", label: "Tools", toolIds: toolIds, notes: "", text: "" };
              updateSections([...sections, sec]);
              setShowToolPicker(false);
            }
          }}
          onClose={() => { setShowToolPicker(false); setToolPickerTarget(null); }}
        />
      )}
    </div>
  );
}