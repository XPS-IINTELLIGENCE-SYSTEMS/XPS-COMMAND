import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sprout, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "../shared/DataPageLayout";

export default function SeedsSourcesView() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", type: "Website", notes: "" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SiteSettings.filter({ category: "features" });
    const seedSettings = data.find(d => d.setting_key === "seed_sources");
    if (seedSettings) {
      try { setSources(JSON.parse(seedSettings.setting_value)); } catch { setSources([]); }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (updated) => {
    const existing = await base44.entities.SiteSettings.filter({ setting_key: "seed_sources" });
    const data = { setting_key: "seed_sources", setting_value: JSON.stringify(updated), category: "features" };
    if (existing.length > 0) await base44.entities.SiteSettings.update(existing[0].id, data);
    else await base44.entities.SiteSettings.create(data);
    setSources(updated);
  };

  const addSource = async () => {
    if (!form.name.trim()) return;
    const updated = [...sources, { ...form, id: Date.now().toString(), created: new Date().toISOString() }];
    await save(updated);
    setForm({ name: "", url: "", type: "Website", notes: "" });
    setAdding(false);
    toast({ title: "Source Added" });
  };

  const removeSource = async (id) => {
    await save(sources.filter(s => s.id !== id));
    toast({ title: "Removed" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seeds & Sources</h1>
          <p className="text-sm text-muted-foreground">Manage lead sources, seed lists, and data origins</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Source</Button>
      </div>

      {adding && (
        <div className="glass-card rounded-xl p-5 mb-6 space-y-3">
          <input placeholder="Source name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full h-9 px-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
          <input placeholder="URL (optional)" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            className="w-full h-9 px-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
          <div className="flex gap-3">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="h-9 px-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground">
              <option>Website</option><option>Google Maps</option><option>LinkedIn</option><option>Permit DB</option><option>Registry</option><option>Referral</option><option>Trade Show</option><option>Other</option>
            </select>
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="flex-1 h-9 px-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={addSource}>Save Source</Button>
          </div>
        </div>
      )}

      {sources.length === 0 ? <EmptyState icon={Sprout} message="No seed sources configured yet" /> : (
        <div className="space-y-3">
          {sources.map(s => (
            <div key={s.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.type}{s.url ? ` · ${s.url}` : ""}{s.notes ? ` · ${s.notes}` : ""}</div>
              </div>
              <button onClick={() => removeSource(s.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}