import { useState, useRef } from "react";
import { X, Check, Pin, Save, Database, Copy, Trash2, Plus, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function DashboardCreatorModal({ mode, onClose }) {
  const [title, setTitle] = useState("My Dashboard");
  const [color, setColor] = useState("#d4af37");
  const [icon, setIcon] = useState("⭐");
  const [sections, setSections] = useState([
    { id: "sec_1", title: "Section 1", type: "blank", color: "#3b82f6" }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [isPinned, setIsPinned] = useState(false);

  const colors = ["#d4af37", "#3b82f6", "#14b8a6", "#8b5cf6", "#f59e0b", "#06b6d4", "#10b981", "#ec4899"];
  const icons = ["⭐", "📊", "🎯", "⚡", "🔥", "📱", "🛠️", "🎨"];

  const addSection = () => {
    const newSection = {
      id: `sec_${Date.now()}`,
      title: "New Section",
      type: "blank",
      color: "#3b82f6"
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id, updates) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const saveDashboard = async () => {
    setSaving(true);
    try {
      // Create custom dashboard configuration
      const config = {
        title,
        icon,
        color,
        mode,
        sections: sections.map(s => ({ id: s.id, title: s.title, type: s.type, color: s.color })),
        dataSource,
        isPinned,
        createdAt: new Date().toISOString(),
      };

      // Save to user profile or custom entity
      const me = await base44.auth.me();
      const customDashboards = me.custom_dashboards ? JSON.parse(me.custom_dashboards) : [];
      customDashboards.push(config);
      
      await base44.auth.updateMe({
        custom_dashboards: JSON.stringify(customDashboards)
      });

      // Show success
      alert(`✓ Dashboard "${title}" saved!`);
      onClose();
    } catch (error) {
      alert(`Error saving dashboard: ${error.message}`);
    }
    setSaving(false);
  };

  const getModeLabel = () => {
    const labels = {
      auto: "Auto Dashboard",
      full_page: "Full Page",
      section: "Section Only",
      ui_builder: "UI Builder",
      focus_dashboard: "Focus Mode",
      tool_creator: "Tool Creator"
    };
    return labels[mode] || mode;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden border border-white/[0.06] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Create Dashboard</h2>
              <p className="text-[11px] text-muted-foreground">{getModeLabel()} Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {/* Title & Icon */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase">Dashboard Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Dashboard"
              className="w-full px-3 py-2 rounded-lg glass-input text-foreground text-sm"
            />
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-all ${color === c ? "ring-2 ring-offset-1" : ""}`}
                    style={{ backgroundColor: c, ringColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-all ${icon === ic ? "ring-2 ring-primary ring-offset-1" : "hover:bg-white/10"}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase">Sections</label>
              <button
                onClick={addSection}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg hover:bg-white/10 text-primary"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sections.map(sec => (
                <div key={sec.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 group hover:bg-white/10 transition-colors">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                    className="flex-1 px-2 py-1 rounded bg-transparent text-xs font-medium text-foreground outline-none border border-transparent hover:border-border"
                    placeholder="Section title"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => deleteSection(sec.id)} className="p-1 rounded hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Populate From</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDataSource("database")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${dataSource === "database" ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"}`}
              >
                <Database className="w-3 h-3 inline mr-1" /> Database
              </button>
              <button
                onClick={() => setDataSource("hubspot")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${dataSource === "hubspot" ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"}`}
              >
                🔗 HubSpot
              </button>
              <button
                onClick={() => setDataSource("supabase")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${dataSource === "supabase" ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"}`}
              >
                🔗 Supabase
              </button>
            </div>
          </div>

          {/* Features Info */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground p-3 rounded-lg bg-white/5">
            <div>✓ Drag & drop sections</div>
            <div>✓ Add/modify/delete</div>
            <div>✓ Change title & color</div>
            <div>✓ Change icon & font</div>
            <div>✓ Pin for quick access</div>
            <div>✓ Save & share</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-lg transition-all ${isPinned ? "text-primary bg-primary/20" : "text-muted-foreground hover:bg-white/10"}`}
            title="Pin dashboard"
          >
            <Pin className="w-4 h-4" />
          </button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={saveDashboard}
            disabled={saving}
            className="metallic-gold-bg text-background font-bold"
          >
            {saving ? "Saving..." : "Save Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
}