import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";

const CATEGORIES = ["All", "Company", "Job/Project", "Social Media", "Competitor", "Market Intel", "Contact", "Other"];
const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES = ["All", "New", "Reviewed", "Actioned", "Archived"];

export default function DataBank() {
  const [entries, setEntries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [dbEntries, allLeads] = await Promise.all([
      base44.entities.DataBankEntry.list("-created_date", 200),
      base44.entities.Lead.list("-score", 200),
    ]);
    setEntries(dbEntries);
    setLeads(allLeads);
    setLoading(false);
  };

  // Merge leads into data bank view
  const allData = [
    ...entries.map(e => ({ ...e, _type: "databank" })),
    ...leads.map(l => ({
      id: l.id,
      title: l.company,
      category: l.lead_type === "Jobs" ? "Job/Project" : "Company",
      source_type: l.ingestion_source === "Scraper" ? "Lead Engine" : "Manual",
      summary: l.ai_insight || "",
      location: l.location || `${l.city || ""}, ${l.state || ""}`,
      industry: l.vertical || "",
      score: l.score || 0,
      priority: l.priority >= 9 ? "Critical" : l.priority >= 7 ? "High" : l.priority >= 5 ? "Medium" : "Low",
      status: l.stage === "Won" ? "Actioned" : l.pipeline_status === "Incoming" ? "New" : "Reviewed",
      company_name: l.company,
      contact_name: l.contact_name,
      contact_email: l.email,
      contact_phone: l.phone,
      estimated_value: l.estimated_value || 0,
      created_date: l.created_date,
      _type: "lead",
    })),
  ];

  const filtered = allData
    .filter(d => category === "All" || d.category === category)
    .filter(d => priority === "All" || d.priority === priority)
    .filter(d => status === "All" || d.status === status)
    .filter(d => !search || (d.title || "").toLowerCase().includes(search.toLowerCase()) || (d.company_name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "score" ? (b.score || 0) - (a.score || 0) : new Date(b.created_date || 0) - new Date(a.created_date || 0));

  return (
    <div className="min-h-screen bg-background hex-bg relative">
      <PageHexGlow />
      <div className="relative z-[1]">
        <GlobalNav />
      </div>

      <div className="relative z-[1] max-w-6xl mx-auto px-6 py-6">
        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search data bank..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          <PillFilter label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
          <PillFilter label="Priority" options={PRIORITIES} value={priority} onChange={setPriority} />
          <PillFilter label="Status" options={STATUSES} value={status} onChange={setStatus} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground">
            <option value="score">Sort: Score</option>
            <option value="date">Sort: Newest</option>
          </select>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mb-6 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{filtered.length}</strong> records</span>
          <span><strong className="text-primary">{filtered.filter(d => d.priority === "Critical" || d.priority === "High").length}</strong> high priority</span>
          <span><strong className="text-green-400">${(filtered.reduce((s, d) => s + (d.estimated_value || 0), 0) / 1000).toFixed(0)}k</strong> total value</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No records match your filters</div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Entry</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((d, i) => (
                  <tr key={`${d._type}-${d.id}-${i}`} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{d.title || d.company_name || "—"}</div>
                      {d.contact_name && <div className="text-[11px] text-muted-foreground">{d.contact_name}</div>}
                    </td>
                    <td className="px-4 py-3"><CategoryBadge cat={d.category} /></td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground">{d.location || "—"}</td>
                    <td className="px-4 py-3"><ScoreBadge score={d.score} /></td>
                    <td className="px-4 py-3"><PriorityBadge p={d.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge s={d.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{d.estimated_value ? `$${(d.estimated_value / 1000).toFixed(0)}k` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PillFilter({ label, options, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground">
      {options.map(o => <option key={o} value={o}>{o === "All" ? `${label}: All` : o}</option>)}
    </select>
  );
}

function ScoreBadge({ score }) {
  const s = score || 0;
  const c = s >= 80 ? 'text-green-400 bg-green-400/10' : s >= 60 ? 'text-yellow-400 bg-yellow-400/10' : s >= 40 ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c}`}>{s}</span>;
}

function PriorityBadge({ p }) {
  const colors = { Critical: "text-red-400 bg-red-400/10", High: "text-orange-400 bg-orange-400/10", Medium: "text-yellow-400 bg-yellow-400/10", Low: "text-muted-foreground bg-secondary" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[p] || colors.Medium}`}>{p}</span>;
}

function StatusBadge({ s }) {
  const colors = { New: "text-blue-400 bg-blue-400/10", Reviewed: "text-yellow-400 bg-yellow-400/10", Actioned: "text-green-400 bg-green-400/10", Archived: "text-muted-foreground bg-secondary" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[s] || colors.New}`}>{s}</span>;
}

function CategoryBadge({ cat }) {
  return <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{cat}</span>;
}