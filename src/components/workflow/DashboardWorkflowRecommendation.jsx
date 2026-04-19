import { useState } from "react";
import { LayoutDashboard, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const DASHBOARD_TEMPLATE = {
  name: "Dashboard Optimization Workflow",
  description: "AI-recommended workflow that monitors your dashboard KPIs, alerts on anomalies, and auto-prioritizes daily tasks based on pipeline health.",
  trigger: "Daily 8:00 AM",
  color: "#d4af37",
  icon: LayoutDashboard,
  steps: [
    { id: "s1", type: "analyze_pipeline", label: "Analyze Pipeline Health", config: {} },
    { id: "s2", type: "score_leads", label: "Re-score Active Leads", config: {} },
    { id: "s3", type: "generate_brief", label: "Generate Executive Brief", config: {} },
    { id: "s4", type: "send_notification", label: "Send Morning Briefing", config: { channel: "email" } },
  ],
};

export default function DashboardWorkflowRecommendation({ onCreateFromTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState(null);

  const getAiRecommendation = async () => {
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI sales workflow advisor for XPS Intelligence, an epoxy flooring sales platform.
      Recommend a single dashboard workflow that would help a flooring sales professional start their day.
      The workflow should focus on pipeline health, lead prioritization, and daily task optimization.
      Be concise and actionable. Format as a short paragraph (3-4 sentences).`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation: { type: "string" },
          workflow_name: { type: "string" },
          key_benefit: { type: "string" },
        },
      },
    });
    setAiRec(res);
    setAiLoading(false);
  };

  return (
    <div className="mb-8">
      <div
        className="rounded-xl p-5 cursor-pointer transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(0,0,0,0.45))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 24px rgba(212,175,55,0.06)",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.15)" }}>
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[15px] font-bold metallic-gold flex items-center gap-2">
                Dashboard Workflow
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">AI Recommended</span>
              </div>
              <div className="text-[12px] text-white/50">Auto-optimize your daily dashboard with AI-driven pipeline analysis</div>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <p className="text-[13px] text-white/70 mb-4">{DASHBOARD_TEMPLATE.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {DASHBOARD_TEMPLATE.steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
                  <span className="text-primary font-bold">{i + 1}</span> {s.label}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => onCreateFromTemplate(DASHBOARD_TEMPLATE)}
                className="gap-2 metallic-gold-bg text-black font-bold hover:brightness-110"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Create This Workflow
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={getAiRecommendation}
                disabled={aiLoading}
                className="gap-2"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiLoading ? "Thinking..." : "Get AI Advice"}
              </Button>
            </div>

            {aiRec && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[11px] font-bold text-primary mb-1">{aiRec.workflow_name || "AI Recommendation"}</div>
                <p className="text-[12px] text-white/70 leading-relaxed">{aiRec.recommendation}</p>
                {aiRec.key_benefit && (
                  <div className="mt-2 text-[11px] text-primary/80 font-medium">Key Benefit: {aiRec.key_benefit}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}