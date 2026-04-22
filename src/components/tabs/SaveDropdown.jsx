import { useState } from "react";
import { Save, ChevronDown, HardDrive, Database, Folder, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SaveDropdown({ tab, onSave }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (destination) => {
    setSaving(true);
    try {
      let result;
      
      switch (destination) {
        case "drive":
          // Save to Google Drive
          result = await base44.functions.invoke("saveToGoogleDrive", {
            tabId: tab.id,
            tabName: tab.name,
            content: tab.content || {},
          });
          alert("Saved to Google Drive ✓");
          break;
          
        case "database":
          // Save to database
          result = await base44.functions.invoke("saveToDashboardDB", {
            tabId: tab.id,
            tabName: tab.name,
            content: tab.content || {},
          });
          alert("Saved to Database ✓");
          break;
          
        case "computer":
          // Download to computer
          const json = JSON.stringify(tab, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${tab.name}.json`;
          a.click();
          URL.revokeObjectURL(url);
          alert("Downloaded to computer ✓");
          break;
          
        case "project":
          // Save to project
          result = await base44.functions.invoke("saveToProject", {
            tabId: tab.id,
            tabName: tab.name,
            projectId: tab.projectId,
          });
          alert("Saved to Project ✓");
          break;
      }
      
      onSave?.(destination);
      setOpen(false);
    } catch (error) {
      alert(`Save failed: ${error.message}`);
    }
    setSaving(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card hover:bg-white/10 text-[11px] font-bold text-foreground transition-all disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" />
        Save
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="absolute top-full left-0 mt-2 w-48 z-50 glass-card rounded-lg border border-white/[0.06] overflow-hidden shadow-xl">
            <button
              onClick={() => handleSave("drive")}
              disabled={saving}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left"
            >
              <HardDrive className="w-3.5 h-3.5 text-primary" /> Google Drive
            </button>
            <button
              onClick={() => handleSave("database")}
              disabled={saving}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Database className="w-3.5 h-3.5 text-accent" /> Database
            </button>
            <button
              onClick={() => handleSave("project")}
              disabled={saving}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" /> Project
            </button>
            <button
              onClick={() => handleSave("computer")}
              disabled={saving}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Download className="w-3.5 h-3.5 text-green-400" /> Computer
            </button>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}