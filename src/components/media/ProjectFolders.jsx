import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Loader2, Plus, Trash2, Download, ExternalLink, Image, Video, FileText, Search, X, CreditCard, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

function AssetCard({ asset }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden group relative">
      {asset.url ? (
        <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-card flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
        {asset.url && (
          <a href={asset.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20 hover:bg-white/30">
            <Download className="w-4 h-4 text-white" />
          </a>
        )}
      </div>
      <div className="p-1.5 bg-card">
        <p className="text-[9px] font-medium text-foreground truncate">{asset.name}</p>
        <p className="text-[8px] text-muted-foreground">{asset.category || asset.type}</p>
      </div>
    </div>
  );
}

export default function ProjectFolders() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Branding Package");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.MediaProject.list("-created_date", 100);
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    await base44.entities.MediaProject.create({ name: newName, project_type: newType, status: "Draft", assets: "[]" });
    setNewName("");
    setCreating(false);
    load();
    toast({ title: "Project created!" });
  };

  const deleteProject = async (id) => {
    await base44.entities.MediaProject.delete(id);
    setSelected(null);
    load();
    toast({ title: "Project deleted" });
  };

  const filtered = projects.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.project_type?.toLowerCase().includes(search.toLowerCase())
  );

  const parseAssets = (p) => {
    try { return JSON.parse(p.assets || "[]"); } catch { return []; }
  };

  const statusColor = { Draft: "text-blue-400 bg-blue-500/10", "In Progress": "text-yellow-400 bg-yellow-500/10", Review: "text-purple-400 bg-purple-500/10", Complete: "text-green-400 bg-green-500/10", Archived: "text-muted-foreground bg-muted" };

  if (selected) {
    const assets = parseAssets(selected);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">{selected.name}</h2>
            <p className="text-[10px] text-muted-foreground">{selected.project_type} · {assets.length} assets</p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => deleteProject(selected.id)} className="gap-1">
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>

        {selected.description && <p className="text-xs text-muted-foreground">{selected.description}</p>}

        {/* Brand colors */}
        {selected.brand_colors && (() => {
          try {
            const colors = JSON.parse(selected.brand_colors);
            return colors.length > 0 ? (
              <div className="flex gap-2">
                {colors.map((c, i) => <div key={i} className="w-8 h-8 rounded-lg border border-white/20" style={{ backgroundColor: c }} />)}
              </div>
            ) : null;
          } catch { return null; }
        })()}

        {/* Assets grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {assets.map((asset, i) => <AssetCard key={i} asset={asset} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-xs">No assets yet — create content in other tabs to save here</div>
        )}

        {/* Brand guidelines */}
        {selected.brand_guidelines && (
          <div className="p-3 rounded-xl bg-card/50 border border-border">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Brand Guidelines</label>
            <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{selected.brand_guidelines}</p>
          </div>
        )}

        {selected.marketing_strategy && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <label className="text-[10px] font-semibold text-primary uppercase">Marketing Strategy</label>
            <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{selected.marketing_strategy}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Project Folders</h2>
        </div>
        <Button size="sm" onClick={() => setCreating(!creating)} className="gap-1">
          <Plus className="w-3 h-3" /> New Project
        </Button>
      </div>

      {creating && (
        <div className="glass-card rounded-xl p-4 flex gap-2 items-end">
          <div className="flex-1">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name" className="text-sm mb-2" />
            <select value={newType} onChange={e => setNewType(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm text-foreground">
              {["Branding Package", "Social Campaign", "Video Project", "Business Cards", "Logo & Icons", "Marketing Kit", "Website Mockup", "Custom"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Button onClick={createProject} disabled={!newName.trim()}>Create</Button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
          No projects yet. Assets you create in other tabs will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(p => {
            const assets = parseAssets(p);
            const firstImage = assets.find(a => a.url);
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className="glass-card rounded-xl p-4 text-left hover:border-primary/30 transition-all">
                <div className="flex gap-3">
                  {firstImage ? (
                    <img src={firstImage.url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{p.project_type}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${statusColor[p.status] || ""}`}>{p.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{assets.length} assets{p.client_name ? ` · ${p.client_name}` : ""}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}