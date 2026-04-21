import { useState } from "react";
import { X, Save, ExternalLink, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DriveItemIcon from "./DriveItemIcon";
import { format } from "date-fns";

export default function DriveItemModal({ item, onClose, onUpdate }) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [content, setContent] = useState(item.content || "");
  const [tags, setTags] = useState(item.tags || "");

  const handleSave = () => {
    onUpdate({ name, description, content, tags });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-[8vh] md:bottom-[8vh] md:w-[640px] z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <DriveItemIcon type={item.type} size="sm" folderColor={item.color} />
          <Input value={name} onChange={(e) => setName(e.target.value)} className="text-base font-semibold flex-1" />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 px-5 py-2 text-[11px] text-muted-foreground border-b border-border">
          <span>Type: {item.type}</span>
          {item.created_date && <span>Created: {format(new Date(item.created_date), "MMM d, yyyy")}</span>}
          {item.updated_date && <span>Modified: {format(new Date(item.updated_date), "MMM d, yyyy")}</span>}
          {item.created_by && <span>By: {item.created_by}</span>}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, tag3..." />
          </div>

          {/* Content / Notes (for documents/workspaces) */}
          {["document", "workspace", "folder"].includes(item.type) && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Content / Notes</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none min-h-[200px] focus:ring-1 focus:ring-primary"
                placeholder="Write content here..."
              />
            </div>
          )}

          {/* File preview */}
          {item.file_url && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">File</label>
              <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Open file
              </a>
            </div>
          )}

          {item.link_url && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Link</label>
              <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> {item.link_url}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5"><Save className="w-3.5 h-3.5" /> Save</Button>
        </div>
      </div>
    </>
  );
}