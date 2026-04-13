import { useState } from "react";
import { MapPin, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function TerritoryTool({ workflowColor }) {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyze = async () => {
    if (!location) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the territory "${location}" for epoxy flooring & concrete polishing business. Identify: top commercial areas, major industries, competition level, estimated market size, and top prospects to target. Be specific.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          market_size: { type: "string" }, competition: { type: "string" },
          top_areas: { type: "array", items: { type: "string" } },
          top_industries: { type: "array", items: { type: "string" } },
          recommendations: { type: "string" }
        }
      },
      model: "gemini_3_flash"
    });
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">TERRITORY / LOCATION</label>
        <div className="flex gap-2">
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Phoenix metro, AZ" className="bg-white/[0.04] border-white/[0.1] text-white flex-1" />
          <Button onClick={analyze} disabled={loading || !location} className="gap-2" style={{ backgroundColor: workflowColor }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze
          </Button>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 py-6 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing territory...</div>}

      {analysis && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
              <div className="text-xs text-white/40 mb-1">MARKET SIZE</div>
              <div className="text-sm text-white font-medium">{analysis.market_size}</div>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
              <div className="text-xs text-white/40 mb-1">COMPETITION</div>
              <div className="text-sm text-white font-medium">{analysis.competition}</div>
            </div>
          </div>
          {analysis.top_areas?.length > 0 && (
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
              <div className="text-xs text-white/40 mb-2">TOP AREAS</div>
              <div className="flex flex-wrap gap-1.5">{analysis.top_areas.map((a, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs bg-white/[0.06] text-white/80">{a}</span>
              ))}</div>
            </div>
          )}
          {analysis.top_industries?.length > 0 && (
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
              <div className="text-xs text-white/40 mb-2">TOP INDUSTRIES</div>
              <div className="flex flex-wrap gap-1.5">{analysis.top_industries.map((a, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs bg-white/[0.06] text-white/80">{a}</span>
              ))}</div>
            </div>
          )}
          <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
            <div className="text-xs text-white/40 mb-1">RECOMMENDATIONS</div>
            <div className="text-sm text-white/80">{analysis.recommendations}</div>
          </div>
        </div>
      )}
    </div>
  );
}