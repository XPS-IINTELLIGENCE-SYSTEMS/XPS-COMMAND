import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Users, RefreshCcw, Loader2, Search, Database, Phone, Trophy, Clock, Filter, ArrowUpDown, Download, Bot, Shield, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CRMAutoPopulateBtn from "../crm/CRMAutoPopulateBtn";
import CRMContactCard from "../crm/CRMContactCard";
import CRMStatsBar from "../crm/CRMStatsBar";

const STAGES = ["All", "Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];
const TYPES = ["All", "XPress", "Jobs"];
const SORT_OPTIONS = [
  { id: "score", label: "AI Score" },
  { id: "priority", label: "Priority" },
  { id: "value", label: "Deal Value" },
  { id: "company", label: "Company A-Z" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

export default function CRMView() {
  const [leads, setLeads] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [showPopulateResult, setShowPopulateResult] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [l, c] = await Promise.all([
      base44.entities.Lead.list("-score", 1000),
      base44.entities.CallLog.list("-created_date", 500).catch(() => []),
    ]);
    setLeads(l || []);
    setCallLogs(c || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Lead.subscribe((event) => {
      if (event.type === "create") setLeads(prev => [event.data, ...prev]);
      else if (event.type === "update") setLeads(prev => prev.map(l => l.id === event.id ? event.data : l));
      else if (event.type === "delete") setLeads(prev => prev.filter(l => l.id !== event.id));
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = [...leads];
    if (stageFilter !== "All") list = list.filter(l => l.stage === stageFilter);
    if (typeFilter !== "All") list = list.filter(l => (l.lead_type || "XPress") === typeFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(l =>
        (l.company || "").toLowerCase().includes(s) ||
        (l.contact_name || "").toLowerCase().includes(s) ||
        (l.location || "").toLowerCase().includes(s) ||
        (l.vertical || "").toLowerCase().includes(s) ||
        (l.email || "").toLowerCase().includes(s) ||
        (l.phone || "").includes(s)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "priority") return (b.priority || 0) - (a.priority || 0);
      if (sortBy === "value") return (b.estimated_value || 0) - (a.estimated_value || 0);
      if (sortBy === "company") return (a.company || "").localeCompare(b.company || "");
      if (sortBy === "newest") return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      if (sortBy === "oldest") return new Date(a.created_date || 0) - new Date(b.created_date || 0);
      return 0;
    });
    return list;
  }, [leads, search, stageFilter, typeFilter, sortBy]);

  const exportCSV = () => {
    const headers = ["Company", "Contact", "Email", "Phone", "Stage", "Type", "Score", "Value", "Location", "Vertical"];
    const rows = filtered.map(l => [l.company, l.contact_name, l.email, l.phone, l.stage, l.lead_type, l.score, l.estimated_value, l.location, l.vertical]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "crm_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Users className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-black metallic-gold">XPS CRM Hub</h1>
            <p className="text-[11px] text-muted-foreground">Unified Contact & Deal Management — All Databases Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CRMAutoPopulateBtn onComplete={loadAll} />
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs gap-1">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CRMStatsBar leads={leads} callLogs={callLogs} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 glass-input rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, contacts, phones, emails..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {STAGES.map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${stageFilter === s ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${typeFilter === t ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="glass-input rounded-lg px-2.5 py-1.5 text-[10px] text-foreground">
          {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="text-[10px] text-muted-foreground ml-auto">{filtered.length} contacts</div>
      </div>

      {/* Contact list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No contacts match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Use Auto-Populate to scan all databases and build your CRM</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
          {filtered.map(lead => (
            <CRMContactCard key={lead.id} lead={lead} onRefresh={loadAll} />
          ))}
        </div>
      )}
    </div>
  );
}