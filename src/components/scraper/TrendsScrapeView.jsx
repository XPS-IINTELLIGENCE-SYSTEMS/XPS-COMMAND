import { useState } from "react";
import { Globe, Loader2, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const TOPICS = ["Market Trends", "Economic Outlook", "Construction Industry", "Flooring Industry", "AI in Construction", "Green Building", "Custom"];

export default function TrendsScrapeView() {
  const [topic, setTopic] = useState("Market Trends");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const run = async () => {
    setLoading(true);
    const q = topic === "Custom" ? custom : topic;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a comprehensive trend analysis for: "${q}"
Include: current trends, consensus forecasts, economic indicators, market size, growth rate, key players, opportunities for a flooring/epoxy contractor business.
Focus on actionable insights for XPS Xtreme Polishing Systems.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          trends: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, description: { type: "string" }, impact: { type: "string" }, timeframe: { type: "string" }
          }}},
          economic_indicators: { type: "string" },
          consensus: { type: "string" },
          opportunities: { type: "string" },
          risks: { type: "string" }
        }
      }
    });
    setResults(res);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Trends & Economics Scraper</h1>
      <p className="text-sm text-muted-foreground mb-6">Market trends, consensus, economic data, and industry forecasts</p>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${topic === t ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {t}
            </button>
          ))}
        </div>
        {topic === "Custom" && (
          <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Enter topic..."
            className="w-full h-10 px-4 mb-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
        )}
        <Button onClick={run} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Analyze Trends
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {results.trends?.map((t, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-foreground">{t.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.impact === "High" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{t.impact} Impact</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              <span className="text-[10px] text-primary mt-1 block">{t.timeframe}</span>
            </div>
          ))}
          {results.consensus && <div className="glass-card rounded-xl p-4"><h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Consensus View</h3><p className="text-sm text-foreground">{results.consensus}</p></div>}
          {results.economic_indicators && <div className="glass-card rounded-xl p-4"><h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Economic Indicators</h3><p className="text-sm text-foreground">{results.economic_indicators}</p></div>}
          {results.opportunities && <div className="glass-card rounded-xl p-4 border-primary/20"><h3 className="text-xs font-bold text-primary uppercase mb-2">Opportunities</h3><p className="text-sm text-foreground">{results.opportunities}</p></div>}
        </div>
      )}
    </div>
  );
}