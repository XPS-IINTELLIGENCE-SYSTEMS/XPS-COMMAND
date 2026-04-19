import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, DollarSign } from "lucide-react";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";

const STATUSES = ["All", "Draft", "Sent", "Viewed", "Approved", "Rejected", "Expired"];
const STATUS_COLORS = {
  Draft: "bg-secondary text-muted-foreground",
  Sent: "bg-blue-500/10 text-blue-400",
  Viewed: "bg-cyan-500/10 text-cyan-400",
  Approved: "bg-emerald-500/10 text-emerald-400",
  Rejected: "bg-red-500/10 text-red-400",
  Expired: "bg-yellow-500/10 text-yellow-400",
  default: "bg-secondary text-muted-foreground",
};

export default function CloseView() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Proposal.list("-created_date", 200);
      setProposals(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = proposals.filter(p => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (p.client_name || "").toLowerCase().includes(s) || (p.title || "").toLowerCase().includes(s) || (p.service_type || "").toLowerCase().includes(s);
    }
    return true;
  });

  const totalValue = filtered.reduce((s, p) => s + (p.total_value || 0), 0);

  if (loading) return <DataLoading />;

  return (
    <div>
      <DataPageHeader title="Proposals" subtitle={`Deal pipeline · $${totalValue.toLocaleString()} total`} count={filtered.length} />
      <DataSearchBar value={search} onChange={setSearch} placeholder="Search proposals..." />
      <FilterPills label="Status" options={STATUSES} active={statusFilter} onChange={setStatusFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} message="No proposals yet" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Proposal</th>
                  <th className="text-left px-4 py-3 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Service</th>
                  <th className="text-left px-4 py-3 font-semibold">Value</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.square_footage ? `${p.square_footage.toLocaleString()} sqft` : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{p.client_name}</div>
                      <div className="text-xs text-muted-foreground">{p.client_email || ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{p.service_type || "—"}</td>
                    <td className="px-4 py-3 font-semibold">${(p.total_value || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} colorMap={STATUS_COLORS} /></td>
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