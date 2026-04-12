import { useState } from "react";
import { FileText, Download, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const pastReports = [
  { month: "March 2026", date: "Apr 1, 2026", highlights: "278 leads · $97K revenue · 32% conversion" },
  { month: "February 2026", date: "Mar 1, 2026", highlights: "243 leads · $81K revenue · 30% conversion" },
  { month: "January 2026", date: "Feb 1, 2026", highlights: "210 leads · $68K revenue · 29% conversion" },
];

export default function MonthlySummary() {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a concise monthly performance summary for March 2026 for Xtreme Polishing Systems' sales intelligence platform:

Key Metrics:
- Total Leads: 278 (↑14.4% MoM)
- Revenue: $97,000 (↑19.8% MoM) 
- Conversion Rate: 32% (↑2pp MoM)
- Workflows Executed: 1,847 runs
- AI Scoring Accuracy: 87%
- Email Open Rate: 42%, Reply Rate: 18%
- Top Lead Source: Web Scraping (68%)
- Competitor Gaps Found: 3

Write an executive summary (3-4 paragraphs), key wins (3 bullets), areas for improvement (2 bullets), and next month recommendations (3 bullets). Be specific with numbers.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_wins: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });
      setSummary(res);
    } catch (err) {
      console.error("Summary gen failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 metallic-gold-icon" />
          <div>
            <h3 className="text-xs font-semibold text-white">Monthly Performance Summary</h3>
            <p className="text-[9px] text-muted-foreground">AI-generated executive reports</p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-7 text-[10px] gap-1.5 metallic-gold-bg text-background hover:brightness-110"
          onClick={generateSummary}
          disabled={generating}
        >
          {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
          {generating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      {/* Generated summary */}
      {summary && (
        <div className="mb-4 p-4 rounded-lg bg-secondary/30 border border-primary/20 space-y-3">
          <div className="text-[11px] font-semibold text-white">March 2026 Executive Summary</div>
          <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line">{summary.executive_summary}</p>

          {summary.key_wins?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-xps-green mb-1">Key Wins</div>
              {summary.key_wins.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <CheckCircle2 className="w-3 h-3 text-xps-green flex-shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {summary.improvements?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-xps-orange mb-1">Areas for Improvement</div>
              {summary.improvements.map((im, i) => (
                <div key={i} className="text-[10px] text-muted-foreground mb-1 pl-4">• {im}</div>
              ))}
            </div>
          )}

          {summary.recommendations?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-xps-blue mb-1">Recommendations</div>
              {summary.recommendations.map((r, i) => (
                <div key={i} className="text-[10px] text-muted-foreground mb-1 pl-4">• {r}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past reports */}
      <div className="text-[10px] font-semibold text-white/70 mb-2">Past Reports</div>
      <div className="space-y-1.5">
        {pastReports.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border hover:border-white/10 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white font-medium">{r.month}</div>
              <div className="text-[9px] text-muted-foreground">{r.highlights}</div>
            </div>
            <div className="text-[9px] text-muted-foreground">{r.date}</div>
            <button className="p-1 rounded hover:bg-secondary">
              <Download className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}