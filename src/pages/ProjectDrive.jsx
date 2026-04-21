import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GlobalNav from "../components/navigation/GlobalNav";
import PageHexGlow from "../components/PageHexGlow";
import DriveToolbar from "../components/drive/DriveToolbar";
import DriveBreadcrumb from "../components/drive/DriveBreadcrumb";
import DriveGrid from "../components/drive/DriveGrid";
import DriveList from "../components/drive/DriveList";
import DriveNewMenu from "../components/drive/DriveNewMenu";
import DriveItemModal from "../components/drive/DriveItemModal";
import DriveShareModal from "../components/drive/DriveShareModal";
import DriveSidebar from "../components/drive/DriveSidebar";
import DriveUploadButton from "../components/drive/DriveUploadButton";

export default function ProjectDrive() {
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("drive-view") || "grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [folderPath, setFolderPath] = useState([]); // breadcrumb trail
  const [sidebarView, setSidebarView] = useState("my_drive"); // my_drive, starred, trash, recent
  const [search, setSearch] = useState("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sharingItem, setSharingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => { localStorage.setItem("drive-view", viewMode); }, [viewMode]);

  // Build query filter based on sidebar view
  const buildFilter = () => {
    if (sidebarView === "trash") return { is_trashed: true };
    if (sidebarView === "starred") return { is_starred: true, is_trashed: false };
    if (sidebarView === "recent") return { is_trashed: false };
    // my_drive — show items in current folder
    const filter = { is_trashed: false };
    if (currentFolder) {
      filter.parent_id = currentFolder;
    }
    return filter;
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["projects", sidebarView, currentFolder],
    queryFn: () => base44.entities.Project.filter(buildFilter(), "-updated_date", 200),
  });

  // For "my_drive" root, only show items without parent_id
  const filteredItems = (() => {
    let list = items;
    if (sidebarView === "my_drive" && !currentFolder) {
      list = list.filter(i => !i.parent_id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name?.toLowerCase().includes(q) || i.tags?.toLowerCase().includes(q));
    }
    // Sort
    list = [...list].sort((a, b) => {
      // Folders first
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      let cmp = 0;
      if (sortBy === "name") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortBy === "updated") cmp = new Date(b.updated_date) - new Date(a.updated_date);
      else if (sortBy === "size") cmp = (a.size_bytes || 0) - (b.size_bytes || 0);
      else if (sortBy === "type") cmp = (a.type || "").localeCompare(b.type || "");
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  })();

  // Mutations
  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const handleCreateItem = (type, name) => {
    createMut.mutate({ name, type, parent_id: currentFolder || undefined, color: type === "folder" ? "#d4af37" : undefined });
    setShowNewMenu(false);
  };

  const handleOpenFolder = (item) => {
    if (item.type === "folder") {
      setFolderPath(prev => [...prev, { id: item.id, name: item.name }]);
      setCurrentFolder(item.id);
      setSelectedIds([]);
    } else {
      setEditingItem(item);
    }
  };

  const handleNavigateBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      const target = folderPath[index];
      setCurrentFolder(target.id);
      setFolderPath(prev => prev.slice(0, index + 1));
    }
    setSelectedIds([]);
  };

  const handleToggleStar = (item) => {
    updateMut.mutate({ id: item.id, data: { is_starred: !item.is_starred } });
  };

  const handleTrash = (item) => {
    updateMut.mutate({ id: item.id, data: { is_trashed: true } });
  };

  const handleRestore = (item) => {
    updateMut.mutate({ id: item.id, data: { is_trashed: false } });
  };

  const handleDeleteForever = (item) => {
    deleteMut.mutate(item.id);
  };

  const handleEmptyTrash = () => {
    items.filter(i => i.is_trashed).forEach(i => deleteMut.mutate(i.id));
  };

  const handleRename = (item, newName) => {
    updateMut.mutate({ id: item.id, data: { name: newName } });
  };

  const handleChangeSidebar = (view) => {
    setSidebarView(view);
    if (view !== "my_drive") {
      setCurrentFolder(null);
      setFolderPath([]);
    }
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkTrash = () => {
    selectedIds.forEach(id => updateMut.mutate({ id, data: { is_trashed: true } }));
    setSelectedIds([]);
  };

  const handleBulkStar = () => {
    selectedIds.forEach(id => updateMut.mutate({ id, data: { is_starred: true } }));
    setSelectedIds([]);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden hex-bg">
      <PageHexGlow />
      <GlobalNav />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <DriveSidebar
          activeView={sidebarView}
          onChangeView={handleChangeSidebar}
          onNewClick={() => setShowNewMenu(true)}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <DriveToolbar
            viewMode={viewMode}
            onViewChange={setViewMode}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir); }}
            search={search}
            onSearchChange={setSearch}
            selectedCount={selectedIds.length}
            onBulkTrash={handleBulkTrash}
            onBulkStar={handleBulkStar}
            onClearSelection={() => setSelectedIds([])}
          />

          {/* Breadcrumb */}
          {sidebarView === "my_drive" && (
            <DriveBreadcrumb path={folderPath} onNavigate={handleNavigateBreadcrumb} />
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {sidebarView === "trash" && filteredItems.length > 0 && (
              <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="text-xs text-destructive">Items in trash are deleted after 30 days</span>
                <button onClick={handleEmptyTrash} className="text-xs font-semibold text-destructive hover:underline ml-auto">Empty Trash</button>
              </div>
            )}

            {viewMode === "grid" ? (
              <DriveGrid
                items={filteredItems}
                loading={isLoading}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onOpen={handleOpenFolder}
                onStar={handleToggleStar}
                onTrash={sidebarView === "trash" ? handleDeleteForever : handleTrash}
                onRestore={sidebarView === "trash" ? handleRestore : undefined}
                onRename={handleRename}
                onShare={setSharingItem}
                isTrashView={sidebarView === "trash"}
              />
            ) : (
              <DriveList
                items={filteredItems}
                loading={isLoading}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onOpen={handleOpenFolder}
                onStar={handleToggleStar}
                onTrash={sidebarView === "trash" ? handleDeleteForever : handleTrash}
                onRestore={sidebarView === "trash" ? handleRestore : undefined}
                onRename={handleRename}
                onShare={setSharingItem}
                isTrashView={sidebarView === "trash"}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewMenu && (
        <DriveNewMenu
          onClose={() => setShowNewMenu(false)}
          onCreate={handleCreateItem}
          onUploadComplete={(item) => { createMut.mutate(item); setShowNewMenu(false); }}
          currentFolder={currentFolder}
        />
      )}
      {editingItem && (
        <DriveItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={(data) => { updateMut.mutate({ id: editingItem.id, data }); setEditingItem({ ...editingItem, ...data }); }}
        />
      )}
      {sharingItem && (
        <DriveShareModal
          item={sharingItem}
          onClose={() => setSharingItem(null)}
          onUpdate={(data) => updateMut.mutate({ id: sharingItem.id, data })}
        />
      )}
    </div>
  );
}