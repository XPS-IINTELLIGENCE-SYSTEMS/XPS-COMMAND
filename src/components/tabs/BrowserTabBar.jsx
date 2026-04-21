import { useState, useRef, useEffect } from "react";
import { Plus, X, FolderOpen, Home } from "lucide-react";

export default function BrowserTabBar({
  tabs, activeTabId, onSelectTab, onAddTab, onCloseTab, onRenameTab,
  projects, onOpenProjects,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (tab) => {
    setEditingId(tab.id);
    setDraft(tab.name);
  };

  const commitRename = () => {
    if (editingId && draft.trim()) {
      onRenameTab(editingId, draft.trim());
    }
    setEditingId(null);
  };

  const getProjectColor = (projectId) => {
    const p = projects?.find(pr => pr.id === projectId);
    return p?.color || null;
  };

  return (
    <div
      className="flex items-end gap-0 overflow-x-auto scrollbar-hide select-none flex-shrink-0"
      style={{
        background: "rgba(0,0,0,0.45)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        minHeight: 38,
      }}
    >
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const projColor = getProjectColor(tab.projectId);

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all max-w-[200px] min-w-[100px] ${
              isActive
                ? "bg-background border-t-2 border-l border-r border-border rounded-t-lg -mb-px z-10"
                : "text-white/50 hover:text-white/80 hover:bg-white/5 border-t-2 border-transparent"
            }`}
            style={isActive && projColor ? { borderTopColor: projColor } : isActive ? { borderTopColor: "hsl(var(--primary))" } : {}}
          >
            {/* Project dot */}
            {projColor && (
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: projColor }} />
            )}

            {/* Tab name — editable on double click */}
            {editingId === tab.id ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="bg-transparent text-xs font-medium text-foreground outline-none border-b border-primary w-full min-w-0"
                maxLength={30}
              />
            ) : (
              <span
                onDoubleClick={(e) => { e.stopPropagation(); startRename(tab); }}
                className={`text-xs font-medium truncate ${isActive ? "text-foreground" : ""}`}
              >
                {tab.name}
              </span>
            )}

            {/* Close button — hidden for default tab */}
            {tab.isDefault ? (
              <Home className="w-3 h-3 ml-auto text-primary/50 flex-shrink-0" />
            ) : tabs.length > 1 ? (
              <button
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                className="ml-auto p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        );
      })}

      {/* New tab button */}
      <button
        onClick={onAddTab}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors flex-shrink-0 mx-1"
        title="New tab"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Projects button */}
      <button
        onClick={onOpenProjects}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors flex-shrink-0 ml-auto mr-2 text-[11px]"
        title="Projects"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Projects</span>
      </button>
    </div>
  );
}