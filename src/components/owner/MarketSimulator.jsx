import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, TrendingUp, Users, DollarSign, Target } from "lucide-react";

const SEGMENTS = ["Warehouse", "Retail", "Restaurant", "Fitness", "Healthcare", "Industrial", "Automotive", "Brewery", "Food Processing", "Office", "Education"];
const HORIZONS = [{ v: "30", l: "30 Days" }, { v: "60", l: "60 Days" }, { v: "90", l: "90 Days" }, { v: "180", l: "180 Days" }];

export default function MarketSimulator() {
  const [state, setState] = useState("Florida");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("50");
  const [segment, setSegment] = useState("Warehouse");
  const [horizon, setHorizon] = useState("90");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState([]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an epoxy flooring market analyst. Simulate a market opportunity for:
State: ${state}, City: ${city || "statewide"}, Radius: ${radius} miles
Industry Segment: ${segment}
Time Horizon: ${horizon} days

Provide realistic estimates for the epoxy/polished concrete flooring market. Consider:
- Average commercial building size for this segment
- Typical flooring replacement cycle
- New construction permits in this area
- Competitive landscape density

Return detailed analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            addressable_market_sqft: { type: "number" },
            revenue_opportunity: { type: "number" },
            competitive_density: { type: "string" },
            avg_project_size_sqft: { type: "number" },
            avg_project_value: { type: "number" },
            estimated_projects: { type: "number" },
            entry_strategy: { type: "string" },
            resource_requirements: { type: "string" },
            key_risks: { type: "string" },
            confidence_level: { type: "string" },
          }
        }
      });
      setResult({ ...res, params: { state, city, radius, segment, horizon } });
    } catch (e) {
      setResult({ error: e?.message || "Simulation failed. Please try again." });
    }
    setLoading(false);
  };

  const saveScenario = () => {
    if (result && !result.error) setSaved(p => [...p, { ...result, id: Date.now() }]);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Market Simulation Engine</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <Input placeholder="State" value={state} onChange={e => setState(e.target.value)} className="bg-transparent" />
        <Input placeholder="City (optional)" value={city} onChange={e => setCity(e.target.value)} className="bg-transparent" />
        <Input placeholder="Radius (mi)" value={radius} onChange={e => setRadius(e.target.value)} className="bg-transparent" />
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={horizon} onValueChange={setHorizon}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{HORIZONS.map(h => <SelectItem key={h.v} value={h.v}>{h.l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={runSimulation} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
          Run Simulation
        </Button>
        {result && !result.error && <Button variant="outline" onClick={saveScenario}>Save Scenario</Button>}
      </div>

      {result && !result.error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">${(result.revenue_opportunity / 1000000).toFixed(1)}M</div>
            <div className="text-[10px] text-muted-foreground">Revenue Opportunity</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{(result.addressable_market_sqft / 1000000).toFixed(1)}M</div>
            <div className="text-[10px] text-muted-foreground">Addressable sqft</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{result.estimated_projects}</div>
            <div className="text-[10px] text-muted-foreground">Est. Projects</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">${(result.avg_project_value / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-muted-foreground">Avg Project Value</div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="space-y-2 text-sm">
          <div><span className="font-semibold text-foreground">Competition:</span> <span className="text-muted-foreground">{result.competitive_density}</span></div>
          <div><span className="font-semibold text-foreground">Entry Strategy:</span> <span className="text-muted-foreground">{result.entry_strategy}</span></div>
          <div><span className="font-semibold text-foreground">Resources:</span> <span className="text-muted-foreground">{result.resource_requirements}</span></div>
          <div><span className="font-semibold text-foreground">Risks:</span> <span className="text-muted-foreground">{result.key_risks}</span></div>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">SAVED SCENARIOS ({saved.length})</h4>
          <div className="space-y-1">
            {saved.map(s => (
              <div key={s.id} className="text-xs text-muted-foreground flex justify-between">
                <span>{s.params.state} · {s.params.segment} · {s.params.horizon}d</span>
                <span className="font-semibold text-primary">${(s.revenue_opportunity / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}