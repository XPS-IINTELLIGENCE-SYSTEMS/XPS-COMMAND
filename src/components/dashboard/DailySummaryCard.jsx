import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, X, Loader2, TrendingUp, Users, Send, Briefcase, Shield, AlertCircle, Zap } from "lucide-react";
import { format } from "date-fns";

export default function DailySummaryCard({ expanded, onToggleExpand }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSummary(); }, []);

  const loadSummary = async () => {
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");
    
    // Fetch today's data in parallel
    const [leads, jobs, bids, emails, runLogs, healthLogs] = await Promise.all([
      base44.entities.Lead.filter({ }, "-created_date", 50).catch(() => []),
      base44.entities.CommercialJob.filter({}, "-created_date", 20).catch(() => []),
      base44.entities.BidDocument.filter({}, "-created_date", 20).catch(() => []),
      base44.entities.OutreachEmail.filter({}, "-created_date", 20).catch(() => []),
      base44.entities.OvernightRunLog.filter({}, "-created_date", 5).catch(() => []),
      base44.entities.SystemHealth.filter({}, "-created_date", 3).catch(() => []),
    ]);

    // Filter to today's records
    const todayLeads = leads.filter(l => l.created_date?.startsWith(today));
    const todayJobs = jobs.filter(j => j.created_date?.startsWith(today));
    const todayBids = bids.filter(b => b.created_date?.startsWith(today));
    const todayEmails = emails.filter(e => e.created_date?.startsWith(today));
    const todayRuns = runLogs.filter(r => r.run_date === today);
    const latestHealth = healthLogs[0];

    // Stage breakdown
    const stageBreakdown = {};
    todayLeads.forEach(l => {
      stageBreakdown[l.stage || "Incoming"] = (stageBreakdown[l.stage || "Incoming"] || 0) + 1;
    });

    setSummary({
      date: today,
      leadsCreated: todayLeads.length,
      totalLeads: leads.length,
      jobsCreated: todayJobs.length,
      bidsCreated: todayBids.length,
      emailsSent: todayEmails.filter(e => e.status === "Sent").length,
      emailsQueued: todayEmails.filter(e => e.status === "Queued" || e.status === "Draft").length,
      automationRuns: todayRuns.length,
      automationResults: todayRuns.map(r => ({
        market: r.target_market,
        status: r.completion_status,
        summary: r.executive_summary,
        leads: r.leads_created || 0,
        errors: r.errors_count || 0,
      })),
      healthScore: latestHealth?.score || null,
      healthRecommendations: latestHealth?.recommendations ? 
        (typeof latestHealth.recommendations === "string" ? latestHealth.recommendations.substring(0, 300) : "") : "",
      stageBreakdown,
    });
    setLoading(false);
  };

  const todayFormatted = format(new Date(), "EEEE, MMMM d");

  // Collapsed card
  if (!expanded) {
    return (
      <button
        onClick={onToggleExpand}
        className="w-full glass-card rounded-xl p-3 text-left hover:border-primary/20 transition-all"
      >
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Daily Summary</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{todayFormatted}</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">Loading...</span>
          </div>
        ) : summary ? (
          <div className="flex items-center gap-4 mt-2">
            <StatMini icon={Users} value={summary.leadsCreated} label="Leads" color="#d4af37" />
            <StatMini icon={Briefcase} value={summary.jobsCreated} label="Jobs" color="#22c55e" />
            <StatMini icon={Send} value={summary.emailsSent} label="Sent" color="#06b6d4" />
            <StatMini icon={Shield} value={summary.healthScore || "—"} label="Health" color="#8b5cf6" />
          </div>
        ) : null}
      </button>
    );
  }

  // Expanded inline view
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 metallic-gold-icon" />
          <div>
            <h3 className="text-sm font-bold metallic-gold">Daily Summary</h3>
            <p className="text-[10px] text-muted-foreground">{todayFormatted}</p>
          </div>
        </div>
        <button onClick={onToggleExpand} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : summary ? (
        <div className="p-4 sm:p-5 space-y-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon={Users} value={summary.leadsCreated} label="New Leads Today" sub={`${summary.totalLeads} total`} color="#d4af37" />
            <KpiCard icon={Briefcase} value={summary.jobsCreated} label="New Jobs" sub="" color="#22c55e" />
            <KpiCard icon={Send} value={summary.emailsSent} label="Emails Sent" sub={`${summary.emailsQueued} queued`} color="#06b6d4" />
            <KpiCard icon={Shield} value={summary.healthScore || "—"} label="Health Score" sub="/100" color="#8b5cf6" />
          </div>

          {/* Bids */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Bid Activity
            </h4>
            <div className="rounded-xl p-3 text-xs text-muted-foreground bg-white/[0.03] border border-white/[0.06]">
              {summary.bidsCreated > 0 
                ? `${summary.bidsCreated} new bid document${summary.bidsCreated > 1 ? "s" : ""} created today`
                : "No new bids created today"
              }
            </div>
          </div>

          {/* Lead Pipeline Breakdown */}
          {Object.keys(summary.stageBreakdown).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2">Today's Leads by Stage</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.stageBreakdown).map(([stage, count]) => (
                  <div key={stage} className="rounded-lg px-3 py-1.5 text-[10px] bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-muted-foreground">{stage}:</span>{" "}
                    <span className="font-bold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automation Runs */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" /> Automation Runs ({summary.automationRuns})
            </h4>
            {summary.automationResults.length === 0 ? (
              <div className="rounded-xl p-3 text-xs text-muted-foreground bg-white/[0.03] border border-white/[0.06]">No automation runs today yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summary.automationResults.map((run, i) => (
                  <div key={i} className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${run.status === "complete" ? "bg-green-500" : run.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                      <span className="text-xs font-semibold text-foreground">{run.market}</span>
                      <span className="text-[9px] text-muted-foreground ml-auto">{run.status}</span>
                    </div>
                    {run.summary && <p className="text-[10px] text-muted-foreground">{run.summary}</p>}
                    <div className="flex gap-3 mt-1.5 text-[9px] text-muted-foreground">
                      {run.leads > 0 && <span className="text-green-400">{run.leads} leads</span>}
                      {run.errors > 0 && <span className="text-red-400">{run.errors} errors</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Recommendations */}
          {summary.healthRecommendations && (
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary" /> AI Recommendations
              </h4>
              <div className="rounded-xl p-3 text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap bg-white/[0.03] border border-white/[0.06]">
                {summary.healthRecommendations}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatMini({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-xs font-bold text-foreground">{value}</span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, sub, color }) {
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
      <div className="text-xl font-bold text-foreground">{value}<span className="text-[10px] text-muted-foreground">{sub}</span></div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}