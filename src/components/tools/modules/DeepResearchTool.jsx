import { useState } from "react";
import { Target, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function DeepResearchTool({ workflowColor }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const research = async () => {
    if (!query) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Do deep research on "${query}" for XPS (an epoxy flooring/concrete polishing company). Include: company overview, decision makers, recent news, estimated revenue, facility details, and how XPS products could help them.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          overview: { type: "string" }, decision_makers: { type: "string" },
          recent_news: { type: "string" }, revenue_estimate: { type: "string" },
          opportunity: { type: "string" }, score: { type: "number" }
        }
      },
      model: "gemini_3_flash"
    });
    setResult(res);
    await base44.entities.ResearchResult.create({
      query, ai_summary: res.overview || "", ai_insights: res.opportunity || "",
      category: "Company Research", status: "Complete"
    });
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Company name or topic..." className="bg-white/[0.04] border-white/[0.1] text-white flex-1" />
        <Button onClick={research} disabled={loading || !query} className="gap-2" style={{ backgroundColor: workflowColor }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />} Research
        </Button>
      </div>
      {loading && <div className="flex items-center gap-2 py-6 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Researching...</div>}
      {result && (
        <div className="space-y-3">
          {[["OVERVIEW", result.overview], ["DECISION MAKERS", result.decision_makers], ["RECENT NEWS", result.recent_news], ["REVENUE EST.", result.revenue_estimate], ["OPPORTUNITY", result.opportunity]].map(([label, val]) => val && (
            <div key={label} className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
              <div className="text-xs text-white/40 mb-1">{label}</div>
              <div className="text-sm text-white/80">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}