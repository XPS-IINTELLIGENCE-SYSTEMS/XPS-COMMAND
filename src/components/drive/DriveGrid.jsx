import { Loader2, FolderOpen } from "lucide-react";
import DriveItemIcon from "./DriveItemIcon";
import DriveContextMenu from "./DriveContextMenu";
import { format } from "date-fns";

export default function DriveGrid({
  items, loading, selectedIds, onSelect, onOpen,
  onStar, onTrash, onRestore, onRename, onShare, isTrashView,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderOpen className="w-16 h-16 text-muted-foreground/15 mb-4" />
        <p className="text-sm text-muted-foreground">
          {isTrashView ? "Trash is empty" : "This folder is empty"}
        </p>
        {!isTrashView && (
          <p className="text-xs text-muted-foreground/50 mt-1">Click "New" to create files and folders</p>
        )}
      </div>
    );
  }

  // Separate folders and files
  const folders = items.filter(i => i.type === "folder");
  const files = items.filter(i => i.type !== "folder");

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {folders.map((item) => (
              <DriveGridCard key={item.id} item={item} selected={selectedIds.includes(item.id)}
                onSelect={onSelect} onOpen={onOpen} onStar={onStar} onTrash={onTrash}
                onRestore={onRestore} onRename={onRename} onShare={onShare} isTrashView={isTrashView} />
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Files</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {files.map((item) => (
              <DriveGridCard key={item.id} item={item} selected={selectedIds.includes(item.id)}
                onSelect={onSelect} onOpen={onOpen} onStar={onStar} onTrash={onTrash}
                onRestore={onRestore} onRename={onRename} onShare={onShare} isTrashView={isTrashView} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DriveGridCard({ item, selected, onSelect, onOpen, onStar, onTrash, onRestore, onRename, onShare, isTrashView }) {
  return (
    <div
      onClick={() => onOpen(item)}
      className={`group glass-card rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}>
          <DriveItemIcon type={item.type} folderColor={item.color} />
        </div>
        <DriveContextMenu item={item} onStar={onStar} onTrash={onTrash} onRestore={onRestore} onRename={onRename} onShare={onShare} isTrashView={isTrashView} />
      </div>
      <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {item.updated_date ? format(new Date(item.updated_date), "MMM d, yyyy") : ""}
      </div>
    </div>
  );
}