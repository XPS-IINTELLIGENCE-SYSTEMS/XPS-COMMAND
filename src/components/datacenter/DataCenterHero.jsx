import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SystemStatusBar from "./SystemStatusBar";
import MetricGaugeRow from "./MetricGaugeRow";
import NetworkTopology from "./NetworkTopology";
import LiveDataStream from "./LiveDataStream";
import ThreatMatrix from "./ThreatMatrix";

export default function DataCenterHero({ onOpenTool }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const [leads, jobs, contractors, intel, proposals, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200).catch(() => []),
      base44.entities.CommercialJob.list("-created_date", 200).catch(() => []),
      base44.entities.ContractorCompany.list("-created_date", 200).catch(() => []),
      base44.entities.IntelRecord.list("-created_date", 200).catch(() => []),
      base44.entities.Proposal.list("-created_date", 50).catch(() => []),
      base44.entities.OutreachEmail.list("-created_date", 100).catch(() => []),
    ]);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now - 7 * 86400000).toISOString();

    const leadsThisWeek = leads.filter(l => l.created_date >= weekAgo).length;
    const activeLeads = leads.filter(l => !["Won", "Lost"].includes(l.stage)).length;
    const hotLeads = leads.filter(l => l.score >= 70).length;
    const wonDeals = leads.filter(l => l.stage === "Won").length;
    const pipelineValue = leads.reduce((s, l) => s + (l.estimated_value || 0), 0);
    const activeJobs = jobs.filter(j => !["complete", "lost"].includes(j.project_phase)).length;
    const jobsValue = jobs.reduce((s, j) => s + (j.estimated_flooring_value || 0), 0);
    const activeGCs = contractors.filter(c => c.bid_list_status === "active").length;
    const emailsSent = emails.filter(e => e.status === "Sent" || e.status === "Opened" || e.status === "Replied").length;
    const proposalsSent = proposals.filter(p => p.status !== "Draft").length;
    const proposalsWon = proposals.filter(p => p.status === "Approved").length;
    const intelFresh = intel.filter(i => i.data_freshness === "live" || i.data_freshness === "recent").length;

    const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;

    setStats({
      totalLeads: leads.length,
      leadsThisWeek,
      activeLeads,
      hotLeads,
      wonDeals,
      pipelineValue,
      totalJobs: jobs.length,
      activeJobs,
      jobsValue,
      totalGCs: contractors.length,
      activeGCs,
      totalIntel: intel.length,
      intelFresh,
      emailsSent,
      proposalsSent,
      proposalsWon,
      avgScore,
      // For gauges
      systemHealth: Math.min(100, Math.round((intelFresh / Math.max(intel.length, 1)) * 100)),
      pipelineHealth: Math.min(100, Math.round((activeLeads / Math.max(leads.length, 1)) * 100)),
      conversionRate: leads.length > 0 ? Math.round((wonDeals / leads.length) * 100) : 0,
      enrichmentRate: Math.min(100, Math.round((leads.filter(l => l.ai_insight).length / Math.max(leads.length, 1)) * 100)),
    });
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(0,5,15,0.95), rgba(0,10,25,0.9))" }}>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-[11px] text-cyan-400/60 font-mono tracking-widest uppercase">Initializing Systems...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, rgba(0,5,15,0.97), rgba(0,8,20,0.95))" }}>
      {/* Scan line animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.015) 2px, rgba(0,255,255,0.015) 4px)" }} />
        <ScanLine />
      </div>

      <div className="relative z-10">
        {/* System status header */}
        <SystemStatusBar stats={stats} />

        {/* Metric gauges */}
        <MetricGaugeRow stats={stats} />

        {/* Middle section: Topology + Data Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-cyan-900/30">
          <NetworkTopology stats={stats} onOpenTool={onOpenTool} />
          <div className="border-t lg:border-t-0 lg:border-l border-cyan-900/30">
            <LiveDataStream stats={stats} />
          </div>
        </div>

        {/* Bottom: Threat Matrix */}
        <ThreatMatrix stats={stats} />
      </div>
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute left-0 right-0 h-[2px] animate-scan-down" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.15) 50%, transparent 100%)", animationDuration: "4s", animationIterationCount: "infinite", animationTimingFunction: "linear" }} />
  );
}