import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function LeadScorerTool({ workflowColor }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    base44.entities.Lead.list("-created_date", 50).then(l => {
      setLeads((l || []).filter(lead => !lead.score));
      setLoading(false);
    });
  }, []);

  const scoreAll = async () => {
    setScoring(true);
    for (const lead of leads.slice(0, 10)) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Score this lead for XPS (epoxy flooring company): ${lead.company}, ${lead.vertical || "unknown"} industry, ${lead.city || ""} ${lead.state || ""}. Square footage: ${lead.square_footage || "unknown"}. Return a score 0-100 and a short reason.`,
        response_json_schema: { type: "object", properties: { score: { type: "number" }, reason: { type: "string" } } }
      });
      await base44.entities.Lead.update(lead.id, { score: result.score || 50, ai_insight: result.reason || "" });
    }
    setScoring(false);
    setScored(true);
  };

  if (loading) return <div className="flex items-center gap-2 py-8 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white font-semibold">{leads.length} unscored leads</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {leads.slice(0, 10).map(l => (
          <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div>
              <div className="text-sm text-white font-medium">{l.company}</div>
              <div className="text-xs text-white/40">{l.vertical || "Unknown"} · {l.city || ""}</div>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={scoreAll} disabled={scoring || leads.length === 0 || scored} className="gap-2 w-full" style={{ backgroundColor: scored ? "#10b981" : workflowColor }}>
        {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
        {scored ? "All Scored ✓" : scoring ? "Scoring..." : `Score Top ${Math.min(10, leads.length)} Leads`}
      </Button>
    </div>
  );
}