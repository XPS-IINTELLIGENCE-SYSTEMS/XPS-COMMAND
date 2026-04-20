import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_CATALOG, MISSING_CAPABILITIES } from "./systemCatalog";

export default function SystemIndexView() {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const [activeTab, setActiveTab] = useState("catalog"); // catalog | missing

  const toggleCat = (cat) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const filtered = useMemo(() => {
    if (!search) return SYSTEM_CATALOG;
    const q = search.toLowerCase();
    return SYSTEM_CATALOG.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.examples || []).some(e => e.toLowerCase().includes(q))
      )
    })).filter(cat => cat.items.length > 0);
  }, [search]);

  const filteredMissing = useMemo(() => {
    if (!search) return MISSING_CAPABILITIES;
    const q = search.toLowerCase();
    return MISSING_CAPABILITIES.filter(m =>
      m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }, [search]);

  const totalTools = SYSTEM_CATALOG.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold metallic-gold">System Index & Instructions</h1>
          <p className="text-xs text-muted-foreground">{totalTools} tools · {SYSTEM_CATALOG.length} categories · {MISSING_CAPABILITIES.length} gaps identified</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools, capabilities, agents..." className="pl-10 text-sm" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("catalog")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === "catalog" ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
          <CheckCircle2 className="w-3 h-3 inline mr-1" /> Active Capabilities ({totalTools})
        </button>
        <button onClick={() => setActiveTab("missing")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === "missing" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
          <AlertTriangle className="w-3 h-3 inline mr-1" /> Missing ({MISSING_CAPABILITIES.length})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <div className="space-y-2">
          {filtered.map(cat => {
            const isOpen = expandedCats[cat.category] !== false; // default open
            return (
              <div key={cat.category} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => toggleCat(cat.category)} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-bold text-foreground flex-1">{cat.category}</span>
                  <Badge variant="secondary" className="text-[10px]">{cat.items.length}</Badge>
                </button>
                {isOpen && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {cat.items.map(item => (
                      <div key={item.id} className="px-5 py-3 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            {item.maxCapabilities && <p className="text-[10px] text-primary mt-1">Max: {item.maxCapabilities}</p>}
                          </div>
                          <Badge className="text-[9px] flex-shrink-0" style={{ backgroundColor: item.color + "20", color: item.color, border: `1px solid ${item.color}40` }}>
                            {item.type}
                          </Badge>
                        </div>
                        {item.examples?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.examples.map((ex, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-secondary text-[9px] text-muted-foreground">{ex}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMissing.map((item, i) => (
            <div key={i} className="p-4 bg-card border border-destructive/20 rounded-xl hover:border-destructive/40 transition-colors">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-destructive/80 mt-1">Priority: {item.priority} · Category: {item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}