import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PAGE_TEMPLATES from "./PageTemplates";

export default function PageCreatorModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const template = PAGE_TEMPLATES.find(t => t.id === selectedTemplate);
    const widgets = (template?.widgets || []).map((w, i) => ({
      id: `widget_${Date.now()}_${i}`,
      ...w,
    }));
    await onCreate({ title: title.trim(), slug, template: selectedTemplate, widgets });
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Create New Page</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Page Name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 text-xs" placeholder="My Custom Dashboard" autoFocus />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Choose Template</label>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_TEMPLATES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:bg-secondary"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${selectedTemplate === t.id ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{t.label}</p>
                      <p className="text-[9px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 text-xs">Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={!title.trim() || creating} className="flex-1 text-xs metallic-gold-bg text-background">
            {creating ? "Creating..." : "Create Page"}
          </Button>
        </div>
      </div>
    </div>
  );
}