import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";

// AI-powered tooltip that shows recommendations when hovering a tool card
const TOOL_RECOMMENDATIONS = {
  xpress_leads: ["Add AI auto-prioritization", "Enable real-time lead alerts", "Connect Zillow property data"],
  find_companies: ["Add Google Maps enrichment", "Enable review aggregation", "Add D&B credit scoring"],
  find_jobs: ["Connect permit database feeds", "Add SAM.gov deep integration", "Enable bid deadline alerts"],
  data_bank: ["Add CSV bulk import/export", "Enable data deduplication", "Add merge duplicate records"],
  crm: ["Add deal stage automation", "Enable pipeline forecasting", "Connect QuickBooks sync"],
  get_work: ["Add email deliverability monitoring", "Enable A/B testing", "Add multi-channel sequences"],
  win_work: ["Add e-signature (DocuSign)", "Enable dynamic pricing", "Add win/loss analysis"],
  bid_center: ["Add automated takeoff from plans", "Enable competitive bid tracking", "Add subcontractor matching"],
  workflows: ["Add conditional branching", "Enable webhook triggers", "Add approval workflows"],
  scheduler: ["Add smart scheduling based on results", "Enable retry on failure", "Add notification on completion"],
  research: ["Add RAG knowledge engine", "Enable source verification", "Add citation tracking"],
  knowledge: ["Index all docs into vector store", "Enable semantic search", "Add auto-categorization"],
  competition: ["Add real-time price monitoring", "Enable alert on competitor changes", "Add market share estimation"],
  media_hub: ["Add auto-thumbnail generation", "Enable brand consistency checker", "Add content calendar"],
  analytics: ["Add revenue forecasting", "Enable cohort analysis", "Add ROI per channel tracking"],
  agent_builder: ["Add agent testing sandbox", "Enable prompt A/B testing", "Add performance benchmarks"],
  agent_fleet: ["Add multi-agent orchestration", "Enable agent-to-agent handoffs", "Add fleet analytics"],
  connectors: ["Add Stripe payments", "Enable DocuSign integration", "Add QuickBooks connector"],
};

export default function ToolCardTooltip({ tool, visible, position }) {
  if (!visible || !tool) return null;
  const recommendations = TOOL_RECOMMENDATIONS[tool.id] || [
    "Add AI automation",
    "Enable real-time alerts",
    "Connect external data sources",
  ];
  const Icon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];

  return (
    <div
      className="fixed z-[100] w-64 p-3 rounded-xl glass-card shadow-2xl pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: "translateY(-100%)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tool.color}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: tool.color }} />
        </div>
        <div>
          <div className="text-xs font-bold text-foreground">{tool.label}</div>
          <div className="text-[9px] text-muted-foreground">{tool.desc}</div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-2 mt-1">
        <div className="flex items-center gap-1 text-[9px] font-bold text-primary mb-1.5">
          <Sparkles className="w-2.5 h-2.5" /> AI Recommendations
        </div>
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-foreground/80 py-0.5">
            <ArrowRight className="w-2 h-2 text-primary/60 flex-shrink-0" />
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
}