import { useState } from "react";
import { Search, Building2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATUS_COLORS = {
  not_contacted: "bg-secondary text-muted-foreground",
  contacted: "bg-blue-500/20 text-blue-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-cyan-500/20 text-cyan-400",
  active: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  cold: "bg-secondary text-muted-foreground",
};

export default function SniperDatabase({ gcs }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created_date");
  const [sortDir, setSortDir] = useState("desc");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const states = [...new Set(gcs.map(g => g.state))].sort();
  const statuses = [...new Set(gcs.map(g => g.bid_list_status))].sort();

  const filtered = gcs.filter(gc => {
    if (search && !gc.company_name?.toLowerCase().includes(search.toLowerCase()) && !gc.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (stateFilter && gc.state !== stateFilter) return false;
    if (statusFilter && gc.bid_list_status !== statusFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey] || "";
    const bVal = b[sortKey] || "";
    if (sortDir === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-2.5 h-2.5 inline" /> : <ChevronDown className="w-2.5 h-2.5 inline" />;
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">GC Database</span>
          <span className="text-[10px] text-muted-foreground ml-1">{filtered.length} of {gcs.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="h-8 pl-7 text-xs glass-input" />
          </div>
          <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="h-8 rounded-lg px-2 text-xs bg-secondary border border-border text-foreground">
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 rounded-lg px-2 text-xs bg-secondary border border-border text-foreground">
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("company_name")}>Company <SortIcon col="company_name" /></th>
              <th className="py-2 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("city")}>City <SortIcon col="city" /></th>
              <th className="py-2 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("state")}>State <SortIcon col="state" /></th>
              <th className="py-2 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("bid_list_status")}>Status <SortIcon col="bid_list_status" /></th>
              <th className="py-2 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("annual_revenue_estimate")}>Revenue <SortIcon col="annual_revenue_estimate" /></th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Phone</th>
              <th className="py-2 px-3">Follow-Up</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 200).map(gc => (
              <tr
                key={gc.id}
                className="border-b border-border/20 hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => setExpanded(expanded === gc.id ? null : gc.id)}
              >
                <td className="py-2 px-3 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    {gc.company_name}
                    {gc.website && (
                      <a href={gc.website} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="text-primary/60 hover:text-primary">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {expanded === gc.id && (
                    <div className="mt-2 p-2 rounded-lg bg-white/[0.03] text-[10px] text-muted-foreground space-y-1">
                      {gc.employee_count && <div>Employees: ~{gc.employee_count.toLocaleString()}</div>}
                      {gc.project_types && <div>Types: {(() => { try { return JSON.parse(gc.project_types).join(", "); } catch { return gc.project_types; } })()}</div>}
                      {gc.preconstruction_contact_name && <div>Precon: {gc.preconstruction_contact_name}</div>}
                      {gc.preconstruction_email && <div>Precon Email: {gc.preconstruction_email}</div>}
                      {gc.discovered_date && <div>Discovered: {new Date(gc.discovered_date).toLocaleDateString()}</div>}
                      {gc.bid_list_request_sent_date && <div>Outreach Sent: {new Date(gc.bid_list_request_sent_date).toLocaleDateString()}</div>}
                      {gc.last_follow_up_date && <div>Last Follow-Up: {new Date(gc.last_follow_up_date).toLocaleDateString()}</div>}
                      {gc.notes && <div>Notes: {gc.notes}</div>}
                    </div>
                  )}
                </td>
                <td className="py-2 px-3 text-muted-foreground">{gc.city || "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{gc.state}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${STATUS_COLORS[gc.bid_list_status] || STATUS_COLORS.cold}`}>
                    {gc.bid_list_status}
                  </span>
                </td>
                <td className="py-2 px-3 text-muted-foreground">
                  {gc.annual_revenue_estimate ? `$${(gc.annual_revenue_estimate / 1e6).toFixed(0)}M` : "—"}
                </td>
                <td className="py-2 px-3 text-muted-foreground truncate max-w-[140px]">{gc.email || "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{gc.phone || "—"}</td>
                <td className="py-2 px-3 text-center">
                  {gc.follow_up_stage > 0 ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Stage {gc.follow_up_stage}/4</span>
                  ) : gc.bid_list_status === "contacted" ? (
                    <span className="text-[9px] text-blue-400">Initial sent</span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">No contractors match your filters</div>
        )}
      </div>
    </div>
  );
}