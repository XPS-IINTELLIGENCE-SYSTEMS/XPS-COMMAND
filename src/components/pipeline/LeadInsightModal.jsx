import { useState } from "react";
import { X, Loader2, Building2, Users, Clock, Wrench, Layers, Star, AlertTriangle, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function LeadInsightModal({ lead, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);

  const runInsight = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Research this company and provide deep business intelligence:
Company: ${lead.company}
Contact: ${lead.contact_name || "Unknown"}
Location: ${lead.city || ""}, ${lead.state || ""}
Website: ${lead.website || "Unknown"}
Industry: ${lead.vertical || "Flooring/Construction"}

Provide detailed intelligence including:
1. Estimated employee count
2. Estimated years in business
3. Equipment they likely use
4. Materials they currently work with
5. Google rating estimate (1-5 stars)
6. Their specialties/services
7. Pain points they likely face
8. XPS product recommendations that would help them

Be specific and actionable.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          employee_count: { type: "number" },
          years_in_business: { type: "number" },
          equipment_used: { type: "string" },
          materials_used: { type: "string" },
          google_rating: { type: "number" },
          specialties: { type: "string" },
          pain_points: { type: "string" },
          product_recommendations: { type: "string" },
          summary: { type: "string" }
        }
      }
    });
    setInsight(result);

    // Save to lead
    await base44.entities.Lead.update(lead.id, {
      employee_count: result.employee_count || lead.employee_count,
      years_in_business: result.years_in_business || lead.years_in_business,
      equipment_used: result.equipment_used || lead.equipment_used,
      existing_material: result.materials_used || lead.existing_material,
      ai_insight: result.summary,
      ai_recommendation: result.product_recommendations,
    });
    if (onUpdate) onUpdate();
    setLoading(false);
  };

  const data = insight || {};

  const rows = [
    { icon: Users, label: "Employees", value: data.employee_count || lead.employee_count || "—" },
    { icon: Clock, label: "Years in Business", value: data.years_in_business || lead.years_in_business || "—" },
    { icon: Wrench, label: "Equipment Used", value: data.equipment_used || lead.equipment_used || "—" },
    { icon: Layers, label: "Materials Used", value: data.materials_used || lead.existing_material || "—" },
    { icon: Star, label: "Google Rating", value: data.google_rating ? `${data.google_rating}/5 ⭐` : "—" },
    { icon: Building2, label: "Specialties", value: data.specialties || "—" },
    { icon: AlertTriangle, label: "Pain Points", value: data.pain_points || "—" },
    { icon: ShoppingBag, label: "XPS Product Recs", value: data.product_recommendations || lead.ai_recommendation || "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{lead.company}</h3>
            <p className="text-xs text-muted-foreground">{lead.contact_name} · {lead.city}, {lead.state}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {!insight && !loading && (
          <Button onClick={runInsight} className="w-full metallic-gold-bg text-background font-bold mb-4">
            🔍 Run Deep Insight Analysis
          </Button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing {lead.company}...</p>
          </div>
        )}

        {(insight || lead.ai_insight) && !loading && (
          <div className="space-y-3">
            {rows.map(r => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{r.label}</div>
                    <div className="text-sm text-foreground mt-0.5">{r.value}</div>
                  </div>
                </div>
              );
            })}

            {data.summary && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">AI Summary</div>
                <p className="text-sm text-foreground">{data.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}