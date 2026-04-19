import { useState, useEffect } from "react";
import { Shield, ArrowLeft, Loader2, Users, Database, Zap, BarChart3, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";

export default function AdminControl() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails, jobs, scrapeJobs] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
      base44.entities.CommercialJob.list("-created_date", 200),
      base44.entities.ScrapeJob.list("-created_date", 50).catch(() => []),
    ]);
    setStats({ leads, proposals, invoices, emails, jobs, scrapeJobs });
    setLoading(false);
  };

  if (loading || !stats) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const { leads, proposals, invoices, emails, jobs, scrapeJobs } = stats;

  const systemStats = [
    { label: "Total Leads", value: leads.length, icon: Users, color: "#d4af37" },
    { label: "Proposals", value: proposals.length, icon: Database, color: "#6366f1" },
    { label: "Invoices", value: invoices.length, icon: BarChart3, color: "#22c55e" },
    { label: "Emails Sent", value: emails.filter(e => e.status === "Sent").length, icon: Zap, color: "#ef4444" },
    { label: "Commercial Jobs", value: jobs.length, icon: Database, color: "#f59e0b" },
    { label: "Scrape Jobs", value: scrapeJobs.length, icon: RefreshCw, color: "#8b5cf6" },
  ];

  const pipelineBreakdown = [
    { label: "Incoming", count: leads.filter(l => l.stage === "Incoming").length },
    { label: "Validated", count: leads.filter(l => l.stage === "Validated").length },
    { label: "Qualified", count: leads.filter(l => l.stage === "Qualified").length },
    { label: "Contacted", count: leads.filter(l => l.stage === "Contacted").length },
    { label: "Proposal", count: leads.filter(l => l.stage === "Proposal").length },
    { label: "Won", count: leads.filter(l => l.stage === "Won").length },
    { label: "Lost", count: leads.filter(l => l.stage === "Lost").length },
  ];

  const sourceBreakdown = {};
  leads.forEach(l => { const s = l.ingestion_source || "Unknown"; sourceBreakdown[s] = (sourceBreakdown[s] || 0) + 1; });

  return (
    <div className="min-h-screen bg-background hex-bg relative">
      <PageHexGlow />
      <div className="relative z-[1] border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Admin Control</h1>
            <p className="text-[11px] text-muted-foreground">System overview & management</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadStats}><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <div className="relative z-[1] max-w-6xl mx-auto px-6 py-8">
        {/* System Stats */}
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-4">System Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {systemStats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
                <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Breakdown */}
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-4">Pipeline Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-10">
          {pipelineBreakdown.map(p => (
            <div key={p.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="text-lg font-bold text-foreground">{p.count}</div>
              <div className="text-[10px] text-muted-foreground">{p.label}</div>
            </div>
          ))}
        </div>

        {/* Source Breakdown */}
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-4">Lead Sources</h2>
        <div className="rounded-xl border border-border bg-card p-5 mb-10">
          <div className="space-y-2">
            {Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{source}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full metallic-gold-bg" style={{ width: `${Math.min(100, (count / leads.length) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scrape Jobs */}
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-4">Recent Scrape Jobs</h2>
        {scrapeJobs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No scrape jobs found</div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Job</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Results</th>
                  <th className="text-left px-4 py-3">Last Run</th>
                </tr>
              </thead>
              <tbody>
                {scrapeJobs.slice(0, 10).map(j => (
                  <tr key={j.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{j.name || j.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${j.status === 'Completed' ? 'text-green-400 bg-green-400/10' : j.status === 'Failed' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.results_count || 0}</td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground">{j.last_run ? new Date(j.last_run).toLocaleDateString() : "—"}</td>
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