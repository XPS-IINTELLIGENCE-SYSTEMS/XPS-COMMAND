import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Loader2, Radar, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ProspectCard from "./ProspectCard";
import RegistryScrapePanel from "./RegistryScrapePanel";

const SPECIALTY_FILTERS = [
  "All", "Epoxy", "Decorative Concrete", "Polished Concrete", "Concrete Coatings",
  "Garage Coatings", "Polyaspartic", "Polyurea", "Stained Concrete", "Metallic Epoxy",
  "Industrial Coatings", "General Flooring",
];

const STATUS_FILTERS = [
  "All", "Not Contacted", "Attempted", "Contacted", "Interested", "Demo Scheduled", "Sold", "Not Interested",
];

const SORT_OPTIONS = [
  { id: "priority", label: "Priority (Newest First)" },
  { id: "formation", label: "Formation Date" },
  { id: "years_asc", label: "Newest Companies" },
  { id: "years_desc", label: "Most Established" },
  { id: "name", label: "Company A-Z" },
  { id: "state", label: "State" },
];

export default function ProspectDatabaseTab({ prospects, callLogs, onRefresh }) {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority");
  const [showScraper, setShowScraper] = useState(false);

  // Get unique states
  const states = useMemo(() => {
    const s = new Set(prospects.map(p => p.state).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [prospects]);

  const filtered = useMemo(() => {
    let list = [...prospects];

    if (specialtyFilter !== "All") list = list.filter(p => p.specialty === specialtyFilter);
    if (statusFilter !== "All") list = list.filter(p => p.cold_call_status === statusFilter);
    if (stateFilter !== "All") list = list.filter(p => p.state === stateFilter);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        (p.company_name || "").toLowerCase().includes(s) ||
        (p.owner_name || "").toLowerCase().includes(s) ||
        (p.city || "").toLowerCase().includes(s) ||
        (p.state || "").toLowerCase().includes(s) ||
        (p.specialty || "").toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "priority") return (b.cold_call_priority || 0) - (a.cold_call_priority || 0);
      if (sortBy === "formation") return new Date(b.formation_date || 0) - new Date(a.formation_date || 0);
      if (sortBy === "years_asc") return (a.years_in_business || 999) - (b.years_in_business || 999);
      if (sortBy === "years_desc") return (b.years_in_business || 0) - (a.years_in_business || 0);
      if (sortBy === "name") return (a.company_name || "").localeCompare(b.company_name || "");
      if (sortBy === "state") return (a.state || "").localeCompare(b.state || "");
      return 0;
    });

    return list;
  }, [prospects, search, specialtyFilter, statusFilter, stateFilter, sortBy]);

  const stats = useMemo(() => ({
    total: prospects.length,
    notContacted: prospects.filter(p => p.cold_call_status === "Not Contacted").length,
    interested: prospects.filter(p => p.cold_call_status === "Interested" || p.cold_call_status === "Demo Scheduled").length,
    sold: prospects.filter(p => p.cold_call_status === "Sold").length,
    newCompanies: prospects.filter(p => (p.years_in_business || 99) < 2).length,
  }), [prospects]);

  const exportCSV = () => {
    const headers = ["Company", "Owner", "Phone", "Email", "State", "City", "Specialty", "Years", "Priority", "Status"];
    const rows = filtered.map(p => [
      p.company_name, p.owner_name, p.phone, p.email, p.state, p.city,
      p.specialty, p.years_in_business, p.cold_call_priority, p.cold_call_status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prospect_companies.csv"; a.click();
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Total Prospects", value: stats.total, color: "#d4af37" },
          { label: "Not Contacted", value: stats.notContacted, color: "#ef4444" },
          { label: "New (<2yr)", value: stats.newCompanies, color: "#f59e0b" },
          { label: "Interested", value: stats.interested, color: "#3b82f6" },
          { label: "Sold", value: stats.sold, color: "#22c55e" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-2 text-center">
            <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[8px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="metallic-gold-bg text-background gap-1.5" onClick={() => setShowScraper(!showScraper)}>
          <Radar className="w-3.5 h-3.5" />
          {showScraper ? "Hide Scraper" : "Scrape Registries"}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {showScraper && <RegistryScrapePanel onComplete={onRefresh} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 glass-input rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies, owners, cities..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground">
          {SPECIALTY_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground">
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground">
          {STATUS_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground">
          {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="text-[10px] text-muted-foreground">{filtered.length} prospects</div>

      {/* Prospect list */}
      <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto">
        {filtered.map(prospect => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            callLogs={callLogs}
            onRefresh={onRefresh}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Radar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No prospects found</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Click "Scrape Registries" to discover companies</p>
          </div>
        )}
      </div>
    </div>
  );
}