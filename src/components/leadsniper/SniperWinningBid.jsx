import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react";

export default function SniperWinningBid({ scope, allScopes, onUpdate }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeScope = async () => {
    setAnalyzing(true);

    // Build historical context from won bids
    const wonBids = allScopes.filter(s => s.bid_status === "won" && s.total_bid_price > 0);
    const historicalContext = wonBids.slice(0, 15).map(s => ({
      project_type: s.project_type,
      sqft: s.total_flooring_sqft,
      price_per_sqft: s.price_per_sqft,
      total_price: s.total_bid_price,
      material_cost: s.material_cost,
      labor_cost: s.labor_cost,
      margin: s.gross_margin_pct,
    }));

    const lostBids = allScopes.filter(s => s.bid_status === "lost").slice(0, 10).map(s => ({
      project_type: s.project_type,
      sqft: s.total_flooring_sqft,
      total_price: s.total_bid_price,
      loss_reason: s.loss_reason,
    }));

    let zones = [];
    try { zones = JSON.parse(scope.extracted_zones || "[]"); } catch {}
    let specials = [];
    try { specials = JSON.parse(scope.special_requirements || "[]"); } catch {}

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert flooring estimator for Xtreme Polishing Systems (XPS), a national epoxy & polished concrete contractor.

CURRENT SCOPE TO BID:
- Project: ${scope.project_name}
- Type: ${scope.project_type}
- Location: ${scope.project_city}, ${scope.project_state}
- Total SF: ${scope.total_flooring_sqft || "Unknown"}
- Specified System: ${scope.specified_system || "Not specified"}
- Zones: ${JSON.stringify(zones)}
- Special Requirements: ${specials.join(", ") || "None"}
- Bid Due: ${scope.bid_due_date}

HISTORICAL WIN DATA (our won bids):
${JSON.stringify(historicalContext, null, 1)}

LOST BIDS (for context on where we priced too high):
${JSON.stringify(lostBids, null, 1)}

Based on this data, provide:
1. A recommended "Winning Bid" price that is competitive but maintains healthy margin
2. A price range (low=aggressive, high=comfortable margin)
3. Estimated material list with quantities and costs
4. Labor estimate
5. Margin analysis with opportunities to improve margin
6. Risk factors that could affect pricing
7. Key differentiators to highlight in our proposal

Use XPS standard pricing: epoxy $3-8/sf, polished concrete $2-6/sf, urethane $5-12/sf, polyaspartic $4-9/sf depending on prep, coats, and conditions.`,
      response_json_schema: {
        type: "object",
        properties: {
          winning_bid_price: { type: "number" },
          price_low: { type: "number" },
          price_high: { type: "number" },
          price_per_sqft: { type: "number" },
          estimated_margin_pct: { type: "number" },
          materials: { type: "array", items: { type: "object", properties: {
            item: { type: "string" }, quantity: { type: "string" }, unit_cost: { type: "number" }, total_cost: { type: "number" }
          }}},
          total_material_cost: { type: "number" },
          total_labor_cost: { type: "number" },
          total_equipment_cost: { type: "number" },
          margin_opportunities: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
          differentiators: { type: "array", items: { type: "string" } },
          confidence_level: { type: "string", description: "low, medium, high" },
          reasoning: { type: "string" },
        }
      },
      model: "claude_sonnet_4_6"
    });

    setResult(analysis);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">AI Winning Bid Analyzer</span>
        </div>
        <Button size="sm" onClick={analyzeScope} disabled={analyzing} className="text-xs h-7 metallic-gold-bg text-background">
          {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
          {analyzing ? "Analyzing..." : "Generate Winning Bid"}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Price Recommendation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <PriceCard label="Winning Bid" value={`$${result.winning_bid_price?.toLocaleString()}`} color="#d4af37" large />
            <PriceCard label="Per SqFt" value={`$${result.price_per_sqft?.toFixed(2)}`} color="#06b6d4" />
            <PriceCard label="Est. Margin" value={`${result.estimated_margin_pct?.toFixed(1)}%`} color="#22c55e" />
            <PriceCard label="Confidence" value={result.confidence_level || "—"} color={result.confidence_level === "high" ? "#22c55e" : result.confidence_level === "medium" ? "#f59e0b" : "#ef4444"} />
          </div>

          {/* Price Range */}
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[10px] text-muted-foreground mb-1">Price Range</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-400 font-bold">${result.price_low?.toLocaleString()}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full relative">
                <div className="absolute inset-y-0 rounded-full metallic-gold-bg"
                  style={{
                    left: `${((result.price_low / result.price_high) * 100) - 10}%`,
                    right: `10%`,
                  }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background"
                  style={{ left: `${((result.winning_bid_price - result.price_low) / (result.price_high - result.price_low)) * 80 + 10}%` }}
                />
              </div>
              <span className="text-xs text-green-400 font-bold">${result.price_high?.toLocaleString()}</span>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">{result.reasoning}</div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Materials */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Package className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px] font-bold text-foreground">Material List</span>
                <span className="text-[9px] text-muted-foreground ml-auto">${result.total_material_cost?.toLocaleString()}</span>
              </div>
              <div className="space-y-1 max-h-[140px] overflow-y-auto">
                {(result.materials || []).map((m, i) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground truncate">{m.item} ({m.quantity})</span>
                    <span className="text-foreground font-medium">${m.total_cost?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 mt-2 pt-1 flex justify-between text-[10px]">
                <span className="text-muted-foreground">Labor</span>
                <span className="text-foreground font-medium">${result.total_labor_cost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Equipment</span>
                <span className="text-foreground font-medium">${result.total_equipment_cost?.toLocaleString()}</span>
              </div>
            </div>

            {/* Margin Opportunities & Risks */}
            <div className="space-y-2">
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[11px] font-bold text-green-400">Margin Opportunities</span>
                </div>
                <ul className="space-y-0.5">
                  {(result.margin_opportunities || []).map((m, i) => (
                    <li key={i} className="text-[9px] text-muted-foreground">• {m}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-[11px] font-bold text-red-400">Risk Factors</span>
                </div>
                <ul className="space-y-0.5">
                  {(result.risk_factors || []).map((r, i) => (
                    <li key={i} className="text-[9px] text-muted-foreground">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Differentiators */}
          {(result.differentiators || []).length > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <span className="text-[11px] font-bold text-primary">Proposal Differentiators</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {result.differentiators.map((d, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PriceCard({ label, value, color, large }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
      <div className={`font-bold ${large ? "text-lg" : "text-sm"}`} style={{ color }}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}