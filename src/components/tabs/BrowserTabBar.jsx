import { useState, useRef, useEffect } from "react";
import { Plus, X, FolderOpen, Home, Pin, PinOff, Settings } from "lucide-react";

export default function BrowserTabBar({
  tabs, activeTabId, onSelectTab, onAddTab, onCloseTab, onRenameTab,
  projects, onOpenProjects, onTogglePin, onSetTabStyle,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [stylingId, setStylingId] = useState(null);
  const [styleIcon, setStyleIcon] = useState("");
  const [styleColor, setStyleColor] = useState("");
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

  const startStyling = (tab) => {
    setStylingId(tab.id);
    setStyleIcon(tab.iconName || "");
    setStyleColor(tab.tabColor || "");
  };

  const commitStyling = () => {
    if (stylingId && onSetTabStyle) {
      onSetTabStyle(stylingId, styleIcon || null, styleColor || null);
    }
    setStylingId(null);
  };

  const getProjectColor = (projectId) => {
    const p = projects?.find(pr => pr.id === projectId);
    return p?.color || null;
  };

  if (stylingId) {
    const tab = tabs.find(t => t.id === stylingId);
    if (tab) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border">
          <span className="text-xs font-bold text-foreground">Customize "{tab.name}"</span>
          
          <input
            type="text"
            placeholder="Icon name (e.g., Phone, Calendar)"
            value={styleIcon}
            onChange={(e) => setStyleIcon(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-secondary text-foreground outline-none border border-border"
            maxLength={20}
          />

          <input
            type="color"
            value={styleColor || "#d4af37"}
            onChange={(e) => setStyleColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />

          <button
            onClick={commitStyling}
            className="ml-auto px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={() => setStylingId(null)}
            className="px-2 py-1 text-xs rounded bg-secondary hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>
      );
    }
  }

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
        const borderColor = tab.tabColor || (isActive && projColor) ? (tab.tabColor || projColor) : isActive ? "hsl(var(--primary))" : "transparent";

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all max-w-[200px] min-w-[100px] ${
              isActive
                ? "bg-background border-t-2 border-l border-r border-border rounded-t-lg -mb-px z-10"
                : "text-white/50 hover:text-white/80 hover:bg-white/5 border-t-2 border-transparent"
            }`}
            style={isActive ? { borderTopColor: borderColor } : {}}
          >
            {/* Custom icon or project dot */}
            {tab.iconName ? (
              <span className="text-xs flex-shrink-0" style={{ color: tab.tabColor || "currentColor" }}>
                {tab.iconName.charAt(0).toUpperCase()}
              </span>
            ) : projColor ? (
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: projColor }} />
            ) : null}

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

            {/* Right actions */}
            <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {/* Pin/Unpin button */}
              {!tab.isDefault && onTogglePin && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin(tab.id); }}
                  className="p-0.5 rounded hover:bg-white/10"
                  title={tab.isPinned ? "Unpin" : "Pin"}
                >
                  {tab.isPinned ? <Pin className="w-3 h-3 text-primary" /> : <PinOff className="w-3 h-3 text-muted-foreground" />}
                </button>
              )}

              {/* Style button */}
              {onSetTabStyle && (
                <button
                  onClick={(e) => { e.stopPropagation(); startStyling(tab); }}
                  className="p-0.5 rounded hover:bg-white/10"
                  title="Customize"
                >
                  <Settings className="w-3 h-3 text-muted-foreground" />
                </button>
              )}

              {/* Close button — hidden for default & pinned tabs */}
              {tab.isDefault ? (
                <Home className="w-3 h-3 text-primary/50 flex-shrink-0" />
              ) : !tab.isPinned && tabs.length > 1 ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                  className="p-0.5 rounded hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
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