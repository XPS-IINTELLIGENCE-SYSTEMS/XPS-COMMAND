import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Users, Building2, Briefcase, FileText, Database, Bot, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_TOOLS } from "../dashboard/dashboardDefaults";

const SEARCH_ENTITIES = [
  { name: "Lead", icon: Users, fields: ["company", "contact_name", "email", "city", "state"], color: "#d4af37" },
  { name: "ContractorCompany", icon: Building2, fields: ["company_name", "city", "state", "email"], color: "#22c55e" },
  { name: "CommercialJob", icon: Briefcase, fields: ["job_name", "city", "state", "gc_name"], color: "#6366f1" },
  { name: "FloorScope", icon: FileText, fields: ["project_name", "gc_company_name", "project_city"], color: "#ec4899" },
  { name: "IntelRecord", icon: Database, fields: ["title", "content", "tags", "industry"], color: "#06b6d4" },
  { name: "AgentJob", icon: Bot, fields: ["job_description", "goal", "agent_type"], color: "#8b5cf6" },
];

export default function GlobalSearchModal({ onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(() => runSearch(query.trim()), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const runSearch = async (q) => {
    setLoading(true);
    const allResults = [];

    // Search tools
    const toolMatches = DEFAULT_TOOLS.filter(t =>
      t.label.toLowerCase().includes(q.toLowerCase()) || t.desc.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5).map(t => ({ type: "tool", id: t.id, title: t.label, subtitle: t.desc, icon: Wrench, color: t.color }));
    allResults.push(...toolMatches);

    // Search entities in parallel
    const searches = SEARCH_ENTITIES.map(async (entity) => {
      const items = await base44.entities[entity.name]?.list?.("-created_date", 100).catch(() => []);
      return (items || []).filter(item => {
        return entity.fields.some(f => {
          const val = item[f];
          return val && String(val).toLowerCase().includes(q.toLowerCase());
        });
      }).slice(0, 5).map(item => ({
        type: "entity",
        entityName: entity.name,
        id: item.id,
        title: item[entity.fields[0]] || item.title || item.name || "Untitled",
        subtitle: entity.fields.slice(1).map(f => item[f]).filter(Boolean).join(" • "),
        icon: entity.icon,
        color: entity.color,
      }));
    });

    const entityResults = await Promise.allSettled(searches);
    entityResults.forEach(r => { if (r.status === "fulfilled") allResults.push(...r.value); });

    setResults(allResults.slice(0, 20));
    setLoading(false);
  };

  const handleSelect = (result) => {
    if (result.type === "tool") {
      onNavigate?.(result.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, leads, jobs, knowledge..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim() && !loading && (
            <p className="text-center text-xs text-muted-foreground py-8">No results for "{query}"</p>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">Type to search across all data</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Tip: Press ⌘K anytime to open search</p>
            </div>
          )}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={`${r.type}-${r.id}-${i}`}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (r.color || "#d4af37") + "15" }}>
                  <Icon className="w-4 h-4" style={{ color: r.color || "#d4af37" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded capitalize">{r.type === "tool" ? "Tool" : r.entityName}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[9px] text-muted-foreground/60">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}