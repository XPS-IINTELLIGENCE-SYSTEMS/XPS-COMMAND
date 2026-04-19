import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Mail, Clock, ExternalLink } from "lucide-react";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";

const STATUSES = ["All", "Draft", "Queued", "Sent", "Opened", "Replied", "Failed"];
const STATUS_COLORS = {
  Draft: "bg-secondary text-muted-foreground",
  Queued: "bg-yellow-500/10 text-yellow-400",
  Sent: "bg-blue-500/10 text-blue-400",
  Opened: "bg-green-500/10 text-green-400",
  Replied: "bg-emerald-500/10 text-emerald-400",
  Failed: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function ContactView() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    (async () => {
      const data = await base44.entities.OutreachEmail.list("-created_date", 200);
      setEmails(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = emails.filter(e => {
    if (statusFilter !== "All" && e.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (e.to_name || "").toLowerCase().includes(s) || (e.to_email || "").toLowerCase().includes(s) || (e.subject || "").toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return <DataLoading />;

  return (
    <div>
      <DataPageHeader title="Outreach" subtitle="Email campaigns & communications" count={filtered.length} />
      <DataSearchBar value={search} onChange={setSearch} placeholder="Search emails..." />
      <FilterPills label="Status" options={STATUSES} active={statusFilter} onChange={setStatusFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={Send} message="No outreach emails yet" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Recipient</th>
                  <th className="text-left px-4 py-3 font-semibold">Subject</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(email => (
                  <tr key={email.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{email.to_name || email.to_email}</div>
                      <div className="text-xs text-muted-foreground">{email.to_email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">{email.subject}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{email.email_type || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={email.status} colorMap={STATUS_COLORS} /></td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                      {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : "—"}
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