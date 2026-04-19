import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Phone, Star, DollarSign } from "lucide-react";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, ScoreBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";

const CRM_STAGES = ["All", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];
const STAGE_COLORS = {
  Contacted: "bg-purple-500/10 text-purple-400",
  Proposal: "bg-orange-500/10 text-orange-400",
  Negotiation: "bg-pink-500/10 text-pink-400",
  Won: "bg-emerald-500/10 text-emerald-400",
  Lost: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function CRMView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Lead.list("-created_date", 500);
      setLeads((data || []).filter(l => ["Contacted", "Proposal", "Negotiation", "Won", "Lost"].includes(l.stage)));
      setLoading(false);
    })();
  }, []);

  const filtered = leads.filter(l => {
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.company || "").toLowerCase().includes(s) || (l.contact_name || "").toLowerCase().includes(s);
    }
    return true;
  });

  const totalValue = filtered.reduce((s, l) => s + (l.estimated_value || 0), 0);

  if (loading) return <DataLoading />;

  return (
    <div>
      <DataPageHeader title="CRM" subtitle={`Deals & contacts · $${totalValue.toLocaleString()} pipeline`} count={filtered.length} />
      <DataSearchBar value={search} onChange={setSearch} placeholder="Search contacts & deals..." />
      <FilterPills label="Stage" options={CRM_STAGES} active={stageFilter} onChange={setStageFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} message="No deals match your filters" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Value</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{lead.company}</div>
                      <div className="text-xs text-muted-foreground">{lead.vertical || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{lead.contact_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{lead.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {lead.estimated_value ? (
                        <span className="font-semibold text-foreground">${lead.estimated_value.toLocaleString()}</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                    <td className="px-4 py-3"><StatusBadge status={lead.stage} colorMap={STAGE_COLORS} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lead.email && <a href={`mailto:${lead.email}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Mail className="w-3.5 h-3.5" /></a>}
                        {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Phone className="w-3.5 h-3.5" /></a>}
                        <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Star className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}