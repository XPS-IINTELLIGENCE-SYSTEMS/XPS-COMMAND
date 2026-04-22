import { useState } from "react";
import { Save, ChevronDown, Download } from "lucide-react";

export default function SaveDropdown({ tab, onSave }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (destination) => {
    setSaving(true);
    try {
      switch (destination) {
        case "computer":
          // Download to computer
          const json = JSON.stringify(tab, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${tab.name || 'workspace'}.json`;
          a.click();
          URL.revokeObjectURL(url);
          alert("Downloaded to computer ✓");
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
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-medium glass-card hover:scale-105 text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
        Save
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="absolute top-full left-0 mt-2 w-48 z-50 glass-card rounded-lg border border-white/[0.06] overflow-hidden shadow-xl">
            <button
              onClick={() => handleSave("computer")}
              disabled={saving}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left"
            >
              <Download className="w-3.5 h-3.5 text-green-400" /> Download JSON
            </button>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}