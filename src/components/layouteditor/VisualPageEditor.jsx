import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, Eye, Pencil, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WidgetPalette from "./WidgetPalette";
import LayoutCanvas from "./LayoutCanvas";
import WidgetConfigPanel from "./WidgetConfigPanel";

export default function VisualPageEditor({ pageId, onBack }) {
  const [page, setPage] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [configWidget, setConfigWidget] = useState(null);
  const [showPalette, setShowPalette] = useState(true);

  useEffect(() => { loadPage(); }, [pageId]);

  const loadPage = async () => {
    const pages = await base44.entities.CustomPage.filter({ id: pageId });
    if (pages.length > 0) {
      setPage(pages[0]);
      setWidgets(pages[0].layout ? JSON.parse(pages[0].layout) : []);
    }
    setLoading(false);
  };

  const savePage = async () => {
    if (!page) return;
    setSaving(true);
    await base44.entities.CustomPage.update(page.id, { layout: JSON.stringify(widgets) });
    setSaving(false);
  };

  const addWidget = (widgetDef) => {
    const newWidget = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      widgetType: widgetDef.id,
      config: { ...widgetDef.defaultConfig },
      w: 12, h: 2,
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (widgetId) => setWidgets(prev => prev.filter(w => w.id !== widgetId));

  const duplicateWidget = (widgetId) => {
    const original = widgets.find(w => w.id === widgetId);
    if (!original) return;
    const clone = { ...original, id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, config: { ...original.config } };
    const index = widgets.findIndex(w => w.id === widgetId);
    const newWidgets = [...widgets];
    newWidgets.splice(index + 1, 0, clone);
    setWidgets(newWidgets);
  };

  const reorderWidgets = (from, to) => {
    const reordered = [...widgets];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setWidgets(reordered);
  };

  const resizeWidget = (widgetId) => {
    setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, w: (w.w || 12) > 6 ? 6 : 12 } : w));
  };

  const handleConfigSave = (newConfig) => {
    setWidgets(prev => prev.map(w => w.id === configWidget.id ? { ...w, config: newConfig } : w));
    setConfigWidget(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!page) return <div className="text-center py-20 text-muted-foreground">Page not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></button>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">{page.title}</h2>
            <p className="text-[11px] text-muted-foreground">{page.description || "Visual page editor"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)} className={`text-xs ${editMode ? "metallic-gold-bg text-background" : ""}`}>
            {editMode ? <Pencil className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {editMode ? "Editing" : "Preview"}
          </Button>
          <Button size="sm" onClick={savePage} disabled={saving} className="text-xs metallic-gold-bg text-background">
            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {editMode && showPalette && (
          <div className="w-64 flex-shrink-0 bg-card border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-foreground">Widgets</h3>
              <button onClick={() => setShowPalette(false)} className="text-[9px] text-muted-foreground hover:text-foreground">Hide</button>
            </div>
            <WidgetPalette onAddWidget={addWidget} />
          </div>
        )}
        {editMode && !showPalette && (
          <button onClick={() => setShowPalette(true)} className="px-2 py-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
            <Plus className="w-4 h-4 text-primary" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <LayoutCanvas widgets={widgets} editMode={editMode} onReorder={reorderWidgets} onRemove={removeWidget} onDuplicate={duplicateWidget} onConfigure={setConfigWidget} onResize={resizeWidget} />
        </div>
      </div>

      {configWidget && <WidgetConfigPanel widget={configWidget} onSave={handleConfigSave} onClose={() => setConfigWidget(null)} />}
    </div>
  );
}