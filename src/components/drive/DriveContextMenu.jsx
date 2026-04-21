import { Star, Trash2, Pencil, Share2, FolderOpen, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";

export default function DriveContextMenu({ item, onStar, onTrash, onRestore, onRename, onShare, isTrashView }) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.name);

  const commitRename = () => {
    if (draft.trim() && draft.trim() !== item.name) onRename(item, draft.trim());
    setRenaming(false);
  };

  if (renaming) {
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
        className="bg-transparent text-xs text-foreground outline-none border-b border-primary w-full"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {isTrashView ? (
        <>
          {onRestore && (
            <button onClick={(e) => { e.stopPropagation(); onRestore(item); }} className="p-1 rounded hover:bg-white/10" title="Restore">
              <RotateCcw className="w-3.5 h-3.5 text-green-400" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onTrash(item); }} className="p-1 rounded hover:bg-white/10" title="Delete forever">
            <XCircle className="w-3.5 h-3.5 text-destructive" />
          </button>
        </>
      ) : (
        <>
          <button onClick={(e) => { e.stopPropagation(); onStar(item); }} className="p-1 rounded hover:bg-white/10" title="Star">
            <Star className={`w-3.5 h-3.5 ${item.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onShare(item); }} className="p-1 rounded hover:bg-white/10" title="Share">
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setRenaming(true); }} className="p-1 rounded hover:bg-white/10" title="Rename">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onTrash(item); }} className="p-1 rounded hover:bg-white/10" title="Trash">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </>
      )}
    </div>
  );
}