import { useState } from "react";
import { Loader2, Sparkles, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import PricingTierCard from "./PricingTierCard";
import BidResultsPanel from "./BidResultsPanel";

const SERVICE_TYPES = [
  "Epoxy Floor Coating", "Polished Concrete", "Decorative Epoxy", "Industrial Epoxy",
  "Metallic Epoxy", "Garage Coating", "Healthcare Flooring", "Polyaspartic", "Polyurea"
];

const COMPLEXITY_LEVELS = ["low", "medium", "high", "very_high"];

export default function DynamicPricingView() {
  const [serviceType, setServiceType] = useState("Epoxy Floor Coating");
  const [sqft, setSqft] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [projectType, setProjectType] = useState("commercial");
  const [complexity, setComplexity] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPricing = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    const res = await base44.functions.invoke("dynamicPricing", {
      service_type: serviceType,
      square_footage: Number(sqft) || 0,
      city,
      state,
      project_type: projectType,
      complexity
    });

    if (res.data?.success) {
      setResult(res.data);
    } else {
      setError(res.data?.error || "Pricing analysis failed");
    }
    setProcessing(false);
  };

  const pricing = result?.pricing;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold metallic-gold">Dynamic Pricing</h2>
          <p className="text-xs text-white/50">AI analyzes costs, competition & complexity to recommend optimal bid pricing</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Service Type</label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Square Footage</label>
          <Input type="number" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="5000" className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">City</label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Phoenix" className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">State</label>
          <Input value={state} onChange={e => setState(e.target.value)} placeholder="AZ" className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Project Type</label>
          <Input value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="warehouse, retail, etc." className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Complexity</label>
          <Select value={complexity} onValueChange={setComplexity}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMPLEXITY_LEVELS.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={runPricing} disabled={processing} className="w-full metallic-gold-bg text-black font-bold h-11">
        {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing Market…</> : <><Sparkles className="w-4 h-4 mr-2" /> Get Pricing Recommendation</>}
      </Button>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

      {/* Results */}
      {pricing && (
        <div className="space-y-5">
          {/* Recommended price banner */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 text-center">
            <p className="text-xs text-primary/70 uppercase tracking-wider font-bold mb-1">Recommended Price</p>
            <p className="text-3xl font-bold metallic-gold">${pricing.recommended_price_per_sqft?.toFixed(2)}<span className="text-base text-white/40">/sqft</span></p>
            {Number(sqft) > 0 && <p className="text-sm text-white/60 mt-1">Total: ${(pricing.recommended_price_per_sqft * Number(sqft)).toLocaleString()}</p>}
            {pricing.confidence_score && <p className="text-xs text-white/40 mt-1">Confidence: {pricing.confidence_score}%</p>}
          </div>

          {/* Tier cards */}
          {pricing.price_tiers && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(pricing.price_tiers).map(([key, tier]) => (
                <PricingTierCard key={key} tierKey={key} tier={tier} sqft={Number(sqft) || 0} isRecommended={key === 'optimal'} />
              ))}
            </div>
          )}

          {/* Cost breakdown */}
          {pricing.cost_breakdown && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-white">Cost Breakdown (per sqft)</h4>
              </div>
              <div className="space-y-2 text-sm">
                {Object.entries(pricing.cost_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-white/50">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="text-white font-medium">${val?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market analysis */}
          {pricing.market_analysis && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-white">Market Analysis</h4>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{pricing.market_analysis}</p>
            </div>
          )}

          {/* Competitor range */}
          {pricing.competitor_price_range && (
            <div className="flex gap-3 text-center">
              <div className="flex-1 p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40">Market Low</p>
                <p className="text-lg font-bold text-white">${pricing.competitor_price_range.low?.toFixed(2)}</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40">Market Avg</p>
                <p className="text-lg font-bold text-primary">${pricing.competitor_price_range.avg?.toFixed(2)}</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40">Market High</p>
                <p className="text-lg font-bold text-white">${pricing.competitor_price_range.high?.toFixed(2)}</p>
              </div>
            </div>
          )}

          {pricing.recommendation && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-white/70">{pricing.recommendation}</div>
          )}

          {/* Internal data context */}
          {result.context && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/6 text-xs text-white/40">
              <strong>Internal data:</strong> {result.context.won_deals} won deals (avg ${result.context.avg_won_price?.toFixed(2)}/sqft), {result.context.lost_deals} lost deals (avg ${result.context.avg_lost_price?.toFixed(2)}/sqft)
            </div>
          )}
        </div>
      )}

      {/* Market Bid Results Scraper */}
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/8">
        <BidResultsPanel />
      </div>
    </div>
  );
}