import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Database, Zap, BarChart3, RefreshCw, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemStatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails, jobs, scrapeJobs, members, joinRequests] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
      base44.entities.CommercialJob.list("-created_date", 200),
      base44.entities.ScrapeJob.list("-created_date", 50).catch(() => []),
      base44.entities.MemberProfile.list("-created_date", 200).catch(() => []),
      base44.entities.JoinRequest.filter({ status: "pending" }).catch(() => []),
    ]);
    setStats({ leads, proposals, invoices, emails, jobs, scrapeJobs, members, joinRequests });
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const s = stats;
  const items = [
    { label: "Total Leads", value: s.leads.length, icon: Users, color: "#d4af37" },
    { label: "Members", value: s.members.length, icon: Users, color: "#6366f1" },
    { label: "Pending Requests", value: s.joinRequests.length, icon: Zap, color: "#ef4444" },
    { label: "Proposals", value: s.proposals.length, icon: Database, color: "#22c55e" },
    { label: "Invoices", value: s.invoices.length, icon: BarChart3, color: "#f59e0b" },
    { label: "Jobs", value: s.jobs.length, icon: Briefcase, color: "#8b5cf6" },
    { label: "Scrape Jobs", value: s.scrapeJobs.length, icon: RefreshCw, color: "#06b6d4" },
    { label: "Emails Sent", value: s.emails.filter(e => e.status === "Sent").length, icon: Zap, color: "#ec4899" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">System Overview</h2>
        <Button variant="outline" size="sm" onClick={loadStats} className="h-7 text-xs gap-1">
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-border bg-card p-3">
              <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: item.color }} />
              <div className="text-xl font-extrabold text-foreground">{item.value}</div>
              <div className="text-[9px] text-muted-foreground">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}