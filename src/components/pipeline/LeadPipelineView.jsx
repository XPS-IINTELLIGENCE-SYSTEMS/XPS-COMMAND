import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Phone, MapPin, Star, MoreHorizontal, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, ScoreBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import AddLeadModal from "./AddLeadModal";

const STAGES = ["All", "Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];
const SCORE_FILTERS = ["All", "Hot", "Warm", "Cold"];
const STAGE_COLORS = {
  Incoming: "bg-blue-500/10 text-blue-400",
  Validated: "bg-cyan-500/10 text-cyan-400",
  Qualified: "bg-green-500/10 text-green-400",
  Prioritized: "bg-yellow-500/10 text-yellow-400",
  Contacted: "bg-purple-500/10 text-purple-400",
  Proposal: "bg-orange-500/10 text-orange-400",
  Negotiation: "bg-pink-500/10 text-pink-400",
  Won: "bg-emerald-500/10 text-emerald-400",
  Lost: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function LeadPipelineView({ forcedTab }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 500);
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Lead.subscribe((event) => {
      if (event.type === "create") setLeads(prev => [event.data, ...prev]);
      else if (event.type === "update") setLeads(prev => prev.map(l => l.id === event.id ? event.data : l));
      else if (event.type === "delete") setLeads(prev => prev.filter(l => l.id !== event.id));
    });
    return unsub;
  }, []);

  const filtered = leads.filter(l => {
    if (forcedTab && (l.lead_type || "XPress") !== forcedTab) return false;
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (scoreFilter === "Hot" && (l.score || 0) < 70) return false;
    if (scoreFilter === "Warm" && ((l.score || 0) < 40 || (l.score || 0) >= 70)) return false;
    if (scoreFilter === "Cold" && (l.score || 0) >= 40) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.company || "").toLowerCase().includes(s) ||
        (l.contact_name || "").toLowerCase().includes(s) ||
        (l.email || "").toLowerCase().includes(s) ||
        (l.city || "").toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <DataPageHeader title="Leads" subtitle={`${forcedTab || "All"} pipeline`} count={filtered.length} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Lead</Button>
        </div>
      </div>

      <DataSearchBar value={search} onChange={setSearch} placeholder="Search leads..." />

      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5">
        <FilterPills label="Status" options={STAGES} active={stageFilter} onChange={setStageFilter} />
        <FilterPills label="Rating" options={SCORE_FILTERS} active={scoreFilter} onChange={setScoreFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} message="No leads match your filters" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Business</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Industry</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-card/40 transition-colors cursor-pointer" onClick={() => setSelected(selected?.id === lead.id ? null : lead)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{lead.company}</div>
                      <div className="text-xs text-muted-foreground">{lead.contact_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground">{lead.email || "—"}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{lead.vertical || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{lead.city}{lead.state ? `, ${lead.state}` : ""}</td>
                    <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                    <td className="px-4 py-3"><StatusBadge status={lead.stage} colorMap={STAGE_COLORS} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lead.email && (
                          <button onClick={(e) => { e.stopPropagation(); window.open(`mailto:${lead.email}`); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {lead.phone && (
                          <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adding && <AddLeadModal onClose={() => setAdding(false)} defaultType={forcedTab || "XPress"} />}
    </div>
  );
}