import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import CallContactCard from "./CallContactCard";

const SOURCE_FILTERS = ["All", "Lead", "Contractor", "ContractorCompany", "CommercialJob"];
const SORT_OPTIONS = [
  { id: "priority", label: "Priority" },
  { id: "score", label: "AI Score" },
  { id: "company", label: "Company A-Z" },
  { id: "value", label: "Deal Value" },
];

export default function CallListTab({ queue, callLogs, onRefresh }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority");
  const [hideCompleted, setHideCompleted] = useState(false);

  const filtered = useMemo(() => {
    let list = [...queue];

    if (hideCompleted) {
      const completedIds = new Set(callLogs.filter(l => l.call_outcome === "Sold" || l.call_outcome === "No").map(l => l.source_id));
      list = list.filter(c => !completedIds.has(c.source_id));
    }

    if (sourceFilter !== "All") {
      list = list.filter(c => c.source_type === sourceFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.company_name.toLowerCase().includes(s) ||
        c.contact_name.toLowerCase().includes(s) ||
        (c.location || "").toLowerCase().includes(s) ||
        (c.vertical || "").toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "priority") return (b.priority || 0) - (a.priority || 0);
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "company") return (a.company_name || "").localeCompare(b.company_name || "");
      if (sortBy === "value") return (b.estimated_value || 0) - (a.estimated_value || 0);
      return 0;
    });

    return list;
  }, [queue, search, sourceFilter, sortBy, hideCompleted, callLogs]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 glass-input rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies, contacts, locations..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1">
          {SOURCE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                sourceFilter === f ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ContractorCompany" ? "GC" : f === "CommercialJob" ? "Job" : f}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="glass-input rounded-lg px-2.5 py-1.5 text-[10px] text-foreground"
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={hideCompleted} onChange={e => setHideCompleted(e.target.checked)} className="rounded" />
          Hide completed
        </label>
      </div>

      <div className="text-[10px] text-muted-foreground">{filtered.length} contacts in queue</div>

      {/* Contact list */}
      <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {filtered.map(contact => (
          <CallContactCard
            key={`${contact.source_type}-${contact.id}`}
            contact={contact}
            onOutcome={(c, outcome) => onRefresh?.()}
            onRefresh={onRefresh}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No contacts match your filters</div>
        )}
      </div>
    </div>
  );
}