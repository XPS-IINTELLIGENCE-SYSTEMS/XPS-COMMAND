import { useState, useEffect } from "react";
import { Brain, Sparkles, Loader2, RefreshCw, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const fallbackInsights = [
  { type: "trend", icon: TrendingUp, color: "#22c55e", title: "Lead Volume Accelerating", text: "Lead acquisition grew 14.4% month-over-month. The web scraping and mass ingestion workflows are driving 68% of new leads." },
  { type: "alert", icon: AlertTriangle, color: "#f97316", title: "Outreach Conversion Dip", text: "Email outreach conversion dropped from 34% to 28% in the last 2 weeks. Consider refreshing AI-generated pitch templates." },
  { type: "insight", icon: Lightbulb, color: "#d4af37", title: "Top Performing Workflow", text: "The 'Lead Gen Pipeline' workflow has a 94% success rate with 278 leads processed in March. AI scoring node accuracy is at 87%." },
  { type: "trend", icon: TrendingUp, color: "#3b82f6", title: "Revenue Trajectory", text: "At current growth rate (18.6% MoM), projected Q2 revenue is $312K. Competitor analysis node identifies 3 emerging market gaps." },
  { type: "insight", icon: Lightbulb, color: "#8b5cf6", title: "Agent Efficiency", text: "Sales Agent handles 3.2x more outreach than manual. Data Analyst agent reduced scoring time from 45min to 2min per batch." },
];

export default function TrendInsights() {
  const [insights, setInsights] = useState(fallbackInsights);
  const [generating, setGenerating] = useState(false);

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI sales intelligence analyst for Xtreme Polishing Systems, an epoxy flooring company. Generate 5 analytical insights based on these metrics:
- 278 leads in March (up 14.4% from Feb)
- Revenue: $97K in March (up 19.8% MoM)
- Conversion rate: 32%
- Top workflow: Lead Generation Pipeline (94% success)
- Web scraping processing 450+ pages/day
- AI scoring accuracy: 87%
- Email outreach open rate: 42%, reply rate: 18%
- Competitor analysis found 3 market gaps

For each insight provide: type (trend/alert/insight), title (short), text (2-3 sentences with specific numbers).`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["trend", "alert", "insight"] },
                  title: { type: "string" },
                  text: { type: "string" },
                },
              },
            },
          },
        },
      });
      if (res?.insights?.length) {
        setInsights(
          res.insights.map((ins) => ({
            ...ins,
            icon: ins.type === "trend" ? TrendingUp : ins.type === "alert" ? AlertTriangle : Lightbulb,
            color: ins.type === "trend" ? "#22c55e" : ins.type === "alert" ? "#f97316" : "#d4af37",
          }))
        );
      }
    } catch (err) {
      console.error("Insight generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 metallic-gold-icon" />
          <div>
            <h3 className="text-xs font-semibold text-white">AI Trend Insights</h3>
            <p className="text-[9px] text-muted-foreground">Automated analysis from workflow data</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1.5"
          onClick={generateInsights}
          disabled={generating}
        >
          {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {generating ? "Analyzing..." : "Refresh AI"}
        </Button>
      </div>

      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-white/10 transition-colors">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: ins.color + "18", border: `1px solid ${ins.color}30` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: ins.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-white mb-0.5">{ins.title}</div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">{ins.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}