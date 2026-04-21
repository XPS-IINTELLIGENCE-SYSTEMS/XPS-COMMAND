import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import HexScene3D from "./HexScene3D";
import WorkflowOverlay from "./WorkflowOverlay";
import HeroMetrics from "./HeroMetrics";

/**
 * Combines the Three.js scene + HTML overlays into a single
 * immersive 3D dashboard hero section.
 */
export default function Dashboard3DHero({ onOpenTool }) {
  const [stats, setStats] = useState({
    discover: 0,
    qualify: 0,
    propose: 0,
    close: 0,
    deliver: 0,
  });
  const [metrics, setMetrics] = useState({
    active_leads: 0,
    pipeline_value: 0,
    ai_actions: 0,
    win_rate: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Load real counts from entities
    const [leads, scopes, jobs] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200).catch(() => []),
      base44.entities.FloorScope.list("-created_date", 200).catch(() => []),
      base44.entities.CommercialJob.list("-created_date", 200).catch(() => []),
    ]);

    // Pipeline stage mapping
    const discover = leads.filter(l => ["Incoming", "Validated"].includes(l.stage)).length;
    const qualify = leads.filter(l => ["Qualified", "Prioritized"].includes(l.stage)).length;
    const propose = scopes.filter(s => ["in_progress", "takeoff_complete", "submitted"].includes(s.bid_status)).length + leads.filter(l => l.stage === "Proposal").length;
    const close = leads.filter(l => ["Negotiation", "Won"].includes(l.stage)).length + scopes.filter(s => s.bid_status === "won").length;
    const deliver = jobs.filter(j => ["under_construction", "complete"].includes(j.project_phase)).length;

    setStats({ discover, qualify, propose, close, deliver });

    // Aggregate metrics
    const totalValue = scopes.reduce((sum, s) => sum + (s.total_bid_price || 0), 0) + leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
    const wonCount = leads.filter(l => l.stage === "Won").length + scopes.filter(s => s.bid_status === "won").length;
    const totalBid = leads.filter(l => ["Won", "Lost", "Proposal", "Negotiation"].includes(l.stage)).length || 1;

    setMetrics({
      active_leads: leads.length,
      pipeline_value: totalValue,
      ai_actions: Math.floor(Math.random() * 40) + 12, // placeholder for real agent activity
      win_rate: Math.round((wonCount / totalBid) * 100),
    });
  };

  const handleStageClick = (stage) => {
    const routes = {
      discover: "find_companies",
      qualify: "xpress_leads",
      propose: "bid_center",
      close: "master_pipeline",
      deliver: "field_tech",
    };
    onOpenTool?.(routes[stage] || "master_pipeline");
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4">
      {/* 3D Three.js canvas */}
      <HexScene3D height={380} />

      {/* HTML overlays */}
      <HeroMetrics data={metrics} />
      <WorkflowOverlay stats={stats} onStageClick={handleStageClick} />

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
      />
    </div>
  );
}