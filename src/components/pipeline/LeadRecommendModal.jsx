import { useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const XPS_PRODUCTS = [
  { name: "XPS Polyaspartic Coating System", url: "https://xtremepolishingsystems.com", category: "Coatings" },
  { name: "XPS Metallic Epoxy System", url: "https://xtremepolishingsystems.com", category: "Epoxy" },
  { name: "XPS Diamond Grinding Tools", url: "https://xtremepolishingsystems.com", category: "Equipment" },
  { name: "XPS Moisture Mitigation", url: "https://xtremepolishingsystems.com", category: "Prep" },
  { name: "XPS Polished Concrete System", url: "https://xtremepolishingsystems.com", category: "Polishing" },
  { name: "XPS Industrial Floor Coating", url: "https://xtremepolishingsystems.com", category: "Industrial" },
  { name: "XPS Decorative Flake System", url: "https://xtremepolishingsystems.com", category: "Decorative" },
  { name: "XPS Contractor Training Program", url: "https://xtremepolishingsystems.com", category: "Training" },
];

export default function LeadRecommendModal({ lead, onClose }) {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(null);

  const runRecommendation = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this lead's profile, recommend the best XPS products and services:

Company: ${lead.company}
Industry: ${lead.vertical || "Unknown"}
Existing Material: ${lead.existing_material || "Unknown"}
Equipment: ${lead.equipment_used || "Unknown"}
Location: ${lead.city}, ${lead.state}
Square Footage: ${lead.square_footage || "Unknown"}
AI Insight: ${lead.ai_insight || "None"}

Available XPS Products: ${XPS_PRODUCTS.map(p => `${p.name} (${p.category})`).join(", ")}

For each recommended product, explain why it's a good fit and the estimated value. Rank by priority.`,
      model: "gemini_3_flash",
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                category: { type: "string" },
                reason: { type: "string" },
                estimated_value: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          pitch_summary: { type: "string" }
        }
      }
    });
    setRecs(result);

    await base44.entities.Lead.update(lead.id, {
      ai_recommendation: result.pitch_summary || JSON.stringify(result.recommendations?.slice(0, 3))
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Product Recommendations</h3>
            <p className="text-xs text-muted-foreground">{lead.company}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {!recs && !loading && (
          <Button onClick={runRecommendation} className="w-full metallic-gold-bg text-background font-bold mb-4">
            🎯 Generate Recommendations
          </Button>
        )}

        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing best fit products...</p>
          </div>
        )}

        {recs && !loading && (
          <div className="space-y-3">
            {recs.recommendations?.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{rec.product_name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    rec.priority === "High" ? "bg-green-500/10 text-green-400" : 
                    rec.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground"
                  }`}>{rec.priority}</span>
                </div>
                <span className="text-[10px] text-primary font-medium">{rec.category} · {rec.estimated_value}</span>
                <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                <a href="https://xtremepolishingsystems.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2">
                  View Product <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}

            {recs.pitch_summary && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">Pitch Summary</div>
                <p className="text-sm text-foreground">{recs.pitch_summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}