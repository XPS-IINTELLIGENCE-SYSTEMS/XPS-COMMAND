import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Phone, Plus, RefreshCcw, Brain, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, ScoreBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import AddLeadModal from "./AddLeadModal";
import LeadInsightModal from "./LeadInsightModal";
import LeadRecommendModal from "./LeadRecommendModal";
import LeadDetailPanel from "./LeadDetailPanel";
import LeadFilterBar from "./LeadFilterBar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLeadCard from "../mobile/MobileLeadCard";
import PullToRefresh from "../shared/PullToRefresh";

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
const BID_STAGE_COLORS = {
  "Not Started": "bg-secondary text-muted-foreground",
  "Planning": "bg-blue-500/10 text-blue-400",
  "Pre-Bid": "bg-cyan-500/10 text-cyan-400",
  "Bid Submitted": "bg-yellow-500/10 text-yellow-400",
  "Under Review": "bg-purple-500/10 text-purple-400",
  "Awarded": "bg-emerald-500/10 text-emerald-400",
  "Lost Bid": "bg-red-500/10 text-red-400",
  "No Bid": "bg-secondary text-muted-foreground",
  default: "bg-secondary text-muted-foreground",
};

export default function LeadPipelineView({ forcedTab }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("leadId") || null;
  });
  const [insightLead, setInsightLead] = useState(null);
  const [recommendLead, setRecommendLead] = useState(null);

  // Sync selected lead ID with URL for hardware back button support
  const setSelected = useCallback((lead) => {
    const id = lead?.id || null;
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("leadId", id);
    } else {
      url.searchParams.delete("leadId");
    }
    window.history.pushState({}, "", url.toString());
  }, []);

  // Listen for popstate (hardware back button)
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedId(params.get("leadId") || null);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const selected = selectedId ? leads.find(l => l.id === selectedId) || null : null;
  const [advFilters, setAdvFilters] = useState({ stateFilter: "All", specialtyFilter: "All", verticalFilter: "All", bidStageFilter: "All" });
  const [sortBy, setSortBy] = useState("date_desc");

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
    if (advFilters.stateFilter !== "All" && (l.state || "") !== advFilters.stateFilter) return false;
    if (advFilters.specialtyFilter !== "All" && (l.specialty || "") !== advFilters.specialtyFilter) return false;
    if (advFilters.verticalFilter !== "All" && (l.vertical || "") !== advFilters.verticalFilter) return false;
    if (advFilters.bidStageFilter !== "All" && (l.bid_stage || "Not Started") !== advFilters.bidStageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.company || "").toLowerCase().includes(s) ||
        (l.contact_name || "").toLowerCase().includes(s) ||
        (l.email || "").toLowerCase().includes(s) ||
        (l.city || "").toLowerCase().includes(s);
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date_asc": return new Date(a.created_date || 0) - new Date(b.created_date || 0);
      case "date_desc": return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      case "value_desc": return (b.estimated_value || 0) - (a.estimated_value || 0);
      case "value_asc": return (a.estimated_value || 0) - (b.estimated_value || 0);
      case "priority_desc": return (b.priority || 0) - (a.priority || 0);
      case "priority_asc": return (a.priority || 0) - (b.priority || 0);
      case "score_desc": return (b.score || 0) - (a.score || 0);
      case "score_asc": return (a.score || 0) - (b.score || 0);
      default: return 0;
    }
  });

  const isMobile = useIsMobile();

  if (loading) return <DataLoading />;

  return (
    <PullToRefresh onRefresh={load}>
    <div>
      <div className="flex items-center justify-between mb-4">
        <DataPageHeader title="Leads" subtitle={`${forcedTab || "All"} pipeline`} count={filtered.length} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Lead</Button>
        </div>
      </div>

      <DataSearchBar value={search} onChange={setSearch} placeholder="Search leads..." />

      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-3">
        <FilterPills label="Status" options={STAGES} active={stageFilter} onChange={setStageFilter} />
        <FilterPills label="Rating" options={SCORE_FILTERS} active={scoreFilter} onChange={setScoreFilter} />
      </div>

      <LeadFilterBar filters={advFilters} onFiltersChange={setAdvFilters} sortBy={sortBy} onSortChange={setSortBy} />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} message="No leads match your filters" />
      ) : isMobile ? (
        <div className="space-y-2">
          {filtered.map(lead => (
            <MobileLeadCard
              key={lead.id}
              lead={lead}
              stageColors={STAGE_COLORS}
              bidStageColors={BID_STAGE_COLORS}
              onInsight={setInsightLead}
              onRecommend={setRecommendLead}
              onClick={() => setSelected(selectedId === lead.id ? null : lead)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Business</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Industry</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Specialty</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Value</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Bid Stage</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-card/40 transition-colors cursor-pointer" onClick={() => setSelected(selectedId === lead.id ? null : lead)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{lead.company}</div>
                      <div className="text-xs text-muted-foreground">{lead.contact_name}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-xs text-muted-foreground">{lead.email || "—"}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{lead.vertical || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{lead.specialty || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{lead.city}{lead.state ? `, ${lead.state}` : ""}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs font-medium text-foreground">{lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ScoreBadge score={lead.score} />
                        {lead.sentiment_label && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            lead.sentiment_label === "On Fire" ? "bg-red-500/15 text-red-400" :
                            lead.sentiment_label === "Hot" ? "bg-orange-500/15 text-orange-400" :
                            lead.sentiment_label === "Warm" ? "bg-yellow-500/15 text-yellow-400" :
                            lead.sentiment_label === "Lukewarm" ? "bg-blue-400/15 text-blue-300" :
                            "bg-blue-600/15 text-blue-500"
                          }`}>{lead.sentiment_label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lead.stage} colorMap={STAGE_COLORS} /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={lead.bid_stage || "Not Started"} colorMap={BID_STAGE_COLORS} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setInsightLead(lead); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Deep Insight">
                          <Brain className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRecommendLead(lead); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Recommendations">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead detail side panel / overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative h-full w-full max-w-md">
            <LeadDetailPanel
              lead={selected}
              onClose={() => setSelected(null)}
              onDelete={async (id) => {
                await base44.entities.Lead.delete(id);
                setSelected(null);
                load();
              }}
            />
          </div>
        </div>
      )}

      {adding && <AddLeadModal onClose={() => setAdding(false)} defaultType={forcedTab || "XPress"} />}
      {insightLead && <LeadInsightModal lead={insightLead} onClose={() => setInsightLead(null)} onUpdate={load} />}
      {recommendLead && <LeadRecommendModal lead={recommendLead} onClose={() => setRecommendLead(null)} />}
    </div>
    </PullToRefresh>
  );
}