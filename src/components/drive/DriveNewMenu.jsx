import { useState } from "react";
import { X, Folder, FileText, Table2, Presentation, Link2, Upload, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const ITEM_TYPES = [
  { type: "folder", label: "New Folder", icon: Folder, color: "#d4af37" },
  { type: "document", label: "Document", icon: FileText, color: "#6366f1" },
  { type: "spreadsheet", label: "Spreadsheet", icon: Table2, color: "#22c55e" },
  { type: "presentation", label: "Presentation", icon: Presentation, color: "#f59e0b" },
  { type: "workspace", label: "Workspace", icon: Briefcase, color: "#d4af37" },
  { type: "link", label: "Link / URL", icon: Link2, color: "#06b6d4" },
];

export default function DriveNewMenu({ onClose, onCreate, onUploadComplete, currentFolder }) {
  const [step, setStep] = useState("pick"); // pick, name, upload
  const [selectedType, setSelectedType] = useState(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePick = (type) => {
    setSelectedType(type);
    setName(type === "folder" ? "Untitled Folder" : `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    setStep("name");
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(selectedType, name.trim());
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const ext = file.name.split(".").pop()?.toLowerCase();
    const typeMap = { pdf: "pdf", png: "image", jpg: "image", jpeg: "image", gif: "image", mp4: "video", mov: "video", doc: "document", docx: "document", xlsx: "spreadsheet", csv: "spreadsheet", pptx: "presentation" };
    onUploadComplete({
      name: file.name,
      type: typeMap[ext] || "document",
      file_url,
      size_bytes: file.size,
      parent_id: currentFolder || undefined,
    });
    setUploading(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-4 md:left-60 top-[20vh] z-50 w-72 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        {step === "pick" && (
          <div>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Create New</span>
              <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-2">
              {/* Upload file */}
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Upload File</span>
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
              <div className="border-t border-border my-1" />
              {ITEM_TYPES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handlePick(item.type)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + "20" }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "name" && (
          <div className="p-4 space-y-3">
            <div className="text-sm font-bold text-foreground">Name your {selectedType}</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("pick")}>Back</Button>
              <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>Create</Button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        )}
      </div>
    </>
  );
}