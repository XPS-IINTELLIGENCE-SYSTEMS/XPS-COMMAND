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
    const weekAgo = new Date(now - 7 * 86400000).toISOString();
    const leadsThisWeek = leads.filter(l => l.created_date >= weekAgo).length;
    const activeLeads = leads.filter(l => !["Won", "Lost"].includes(l.stage)).length;
    const hotLeads = leads.filter(l => l.score >= 70).length;
    const wonDeals = leads.filter(l => l.stage === "Won").length;
    const pipelineValue = leads.reduce((s, l) => s + (l.estimated_value || 0), 0);
    const activeJobs = jobs.filter(j => !["complete", "lost"].includes(j.project_phase)).length;
    const activeGCs = contractors.filter(c => c.bid_list_status === "active").length;
    const emailsSent = emails.filter(e => ["Sent", "Opened", "Replied"].includes(e.status)).length;
    const proposalsSent = proposals.filter(p => p.status !== "Draft").length;
    const proposalsWon = proposals.filter(p => p.status === "Approved").length;
    const intelFresh = intel.filter(i => i.data_freshness === "live" || i.data_freshness === "recent").length;

    setStats({
      totalLeads: leads.length, leadsThisWeek, activeLeads, hotLeads, wonDeals, pipelineValue,
      totalJobs: jobs.length, activeJobs,
      totalGCs: contractors.length, activeGCs,
      totalIntel: intel.length, intelFresh,
      emailsSent, proposalsSent, proposalsWon,
      systemHealth: Math.min(100, Math.round((intelFresh / Math.max(intel.length, 1)) * 100)),
      pipelineHealth: Math.min(100, Math.round((activeLeads / Math.max(leads.length, 1)) * 100)),
      conversionRate: leads.length > 0 ? Math.round((wonDeals / leads.length) * 100) : 0,
      enrichmentRate: Math.min(100, Math.round((leads.filter(l => l.ai_insight).length / Math.max(leads.length, 1)) * 100)),
    });
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="dc-panel rounded-2xl">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#d4af37]/40 uppercase">Initializing Systems</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dc-panel rounded-2xl overflow-hidden relative">
      {/* Hex grid overlay */}
      <div className="dc-hex-overlay" />
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <div className="absolute left-0 right-0 h-px animate-scan-down" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.12) 50%, transparent 100%)" }} />
      </div>

      <div className="relative z-[2]">
        <SystemStatusBar stats={stats} />
        <MetricGaugeRow stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 dc-divider-t">
          <NetworkTopology stats={stats} onOpenTool={onOpenTool} />
          <div className="dc-divider-t lg:dc-divider-t-0 lg:dc-divider-l">
            <LiveDataStream stats={stats} />
          </div>
        </div>
        <ThreatMatrix stats={stats} />
      </div>
    </div>
  );
}