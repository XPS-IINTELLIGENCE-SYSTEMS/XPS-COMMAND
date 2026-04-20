import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, FileText, Trash2, Pencil, Eye, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageCreatorModal from "./PageCreatorModal";
import VisualPageEditor from "./VisualPageEditor";
import { ICON_MAP } from "../dashboard/dashboardDefaults";

export default function PageManagerView() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);

  useEffect(() => { loadPages(); }, []);

  const loadPages = async () => {
    const results = await base44.entities.CustomPage.list("-created_date", 100);
    setPages(results || []);
    setLoading(false);
  };

  const handleCreate = async ({ title, slug, template, widgets }) => {
    await base44.entities.CustomPage.create({
      title,
      slug,
      template,
      layout: JSON.stringify(widgets),
      is_published: false,
      owner_email: (await base44.auth.me())?.email || "",
    });
    setShowCreator(false);
    loadPages();
  };

  const handleDelete = async (id) => {
    await base44.entities.CustomPage.delete(id);
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleTogglePublish = async (page) => {
    await base44.entities.CustomPage.update(page.id, { is_published: !page.is_published });
    loadPages();
  };

  // If editing a page, show the visual editor
  if (editingPageId) {
    return <VisualPageEditor pageId={editingPageId} onBack={() => { setEditingPageId(null); loadPages(); }} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Page Builder</h2>
            <p className="text-[11px] text-muted-foreground">Create custom pages with drag & drop widgets</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowCreator(true)} className="text-xs metallic-gold-bg text-background">
          <Plus className="w-3 h-3 mr-1" /> New Page
        </Button>
      </div>

      {/* Page list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Layout className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">No custom pages yet</p>
          <p className="text-[11px] text-muted-foreground/70 mb-4">Create your first page with the button above</p>
          <Button size="sm" onClick={() => setShowCreator(true)} className="text-xs metallic-gold-bg text-background">
            <Plus className="w-3 h-3 mr-1" /> Create Page
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages.map(page => {
            const Icon = ICON_MAP[page.icon_name] || FileText;
            const widgetCount = page.layout ? JSON.parse(page.layout).length : 0;
            return (
              <div key={page.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: (page.color || "#d4af37") + "15" }}>
                      <Icon className="w-4 h-4" style={{ color: page.color || "#d4af37" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{page.title}</p>
                      <p className="text-[10px] text-muted-foreground">{page.template} • {widgetCount} widgets</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${page.is_published ? "bg-green-500/15 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                    {page.is_published ? "Published" : "Draft"}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => setEditingPageId(page.id)} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleTogglePublish(page)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-medium">
                    <Eye className="w-3 h-3" /> {page.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => handleDelete(page.id)} className="flex items-center gap-1 text-[10px] text-destructive hover:text-destructive/80 font-medium ml-auto">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreator && <PageCreatorModal onClose={() => setShowCreator(false)} onCreate={handleCreate} />}
    </div>
  );
}