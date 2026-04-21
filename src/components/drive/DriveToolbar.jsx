import { LayoutGrid, List, Search, ArrowUpDown, Star, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DriveToolbar({
  viewMode, onViewChange, sortBy, sortDir, onSortChange,
  search, onSearchChange, selectedCount, onBulkTrash, onBulkStar, onClearSelection,
}) {
  const toggleSort = (field) => {
    if (sortBy === field) onSortChange(field, sortDir === "asc" ? "desc" : "asc");
    else onSortChange(field, "asc");
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-shrink-0 flex-wrap"
      style={{ background: "rgba(0,0,0,0.2)" }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search in Drive..."
          className="pl-9 h-8 text-xs"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1">
        {["name", "updated", "size", "type"].map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              sortBy === field ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field && <span className="ml-0.5">{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-[11px] text-primary font-medium">{selectedCount} selected</span>
          <button onClick={onBulkStar} className="p-1 rounded hover:bg-white/10"><Star className="w-3.5 h-3.5 text-yellow-400" /></button>
          <button onClick={onBulkTrash} className="p-1 rounded hover:bg-white/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
          <button onClick={onClearSelection} className="p-1 rounded hover:bg-white/10"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center gap-0.5 ml-auto">
        <button
          onClick={() => onViewChange("grid")}
          className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}