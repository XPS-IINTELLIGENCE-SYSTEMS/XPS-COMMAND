import { Loader2, FolderOpen } from "lucide-react";
import DriveItemIcon from "./DriveItemIcon";
import DriveContextMenu from "./DriveContextMenu";
import { format } from "date-fns";

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DriveList({
  items, loading, selectedIds, onSelect, onOpen,
  onStar, onTrash, onRestore, onRename, onShare, isTrashView,
}) {
  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderOpen className="w-16 h-16 text-muted-foreground/15 mb-4" />
        <p className="text-sm text-muted-foreground">{isTrashView ? "Trash is empty" : "This folder is empty"}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_80px] gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        <span>Name</span>
        <span>Modified</span>
        <span>Size</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onOpen(item)}
          className={`group grid grid-cols-[1fr_100px_100px_80px] gap-2 items-center px-3 py-2 cursor-pointer border-b border-border/50 transition-colors hover:bg-white/[0.03] ${
            selectedIds.includes(item.id) ? "bg-primary/5" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}>
              <DriveItemIcon type={item.type} size="sm" folderColor={item.color} />
            </div>
            <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
            {item.is_starred && <span className="text-yellow-400 text-xs">★</span>}
          </div>
          <span className="text-xs text-muted-foreground">
            {item.updated_date ? format(new Date(item.updated_date), "MMM d") : "—"}
          </span>
          <span className="text-xs text-muted-foreground">{item.type === "folder" ? "—" : formatSize(item.size_bytes)}</span>
          <DriveContextMenu item={item} onStar={onStar} onTrash={onTrash} onRestore={onRestore} onRename={onRename} onShare={onShare} isTrashView={isTrashView} />
        </div>
      ))}
    </div>
  );
}