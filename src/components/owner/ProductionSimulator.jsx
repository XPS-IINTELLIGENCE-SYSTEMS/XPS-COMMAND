import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Hammer, DollarSign, Clock, Package } from "lucide-react";

const PROJECT_TYPES = ["Warehouse", "Healthcare", "Food Processing", "Automotive", "Fitness", "Retail", "Restaurant", "Office", "Brewery", "Residential Garage"];
const SYSTEMS = ["Epoxy (100% Solids)", "Polyaspartic", "Polished Concrete", "Urethane Cement", "MMA", "Metallic Epoxy", "ESD Flooring", "Decorative Flake"];

export default function ProductionSimulator() {
  const [projectType, setProjectType] = useState("Warehouse");
  const [sqft, setSqft] = useState("10000");
  const [location, setLocation] = useState("Florida");
  const [timeline, setTimeline] = useState("30");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSim = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an epoxy flooring production estimator for Xtreme Polishing Systems. Simulate production requirements and profitability for ALL major flooring system types for this project:

Project: ${projectType}, ${sqft} sqft, ${location}, ${timeline}-day timeline

For EACH system (Epoxy 100% Solids, Polyaspartic, Polished Concrete, Urethane Cement, MMA, Metallic Epoxy), provide:
- Material cost, labor cost, equipment cost
- Total project cost and recommended pricing
- Profit margin
- Labor hours and crew size
- Key advantages for this project type

Use realistic industry pricing for 2024-2025.`,
        response_json_schema: {
          type: "object",
          properties: {
            systems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  material_cost: { type: "number" },
                  labor_cost: { type: "number" },
                  equipment_cost: { type: "number" },
                  total_cost: { type: "number" },
                  recommended_price: { type: "number" },
                  profit_margin_pct: { type: "number" },
                  labor_hours: { type: "number" },
                  crew_size: { type: "number" },
                  advantages: { type: "string" },
                  cost_per_sqft: { type: "number" },
                  price_per_sqft: { type: "number" },
                }
              }
            },
            recommended_system: { type: "string" },
            recommendation_reason: { type: "string" },
          }
        }
      });
      setResults(res);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Hammer className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Production Simulation</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PROJECT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Sq ft" value={sqft} onChange={e => setSqft(e.target.value)} className="bg-transparent" />
        <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="bg-transparent" />
        <Input placeholder="Days" value={timeline} onChange={e => setTimeline(e.target.value)} className="bg-transparent" />
      </div>

      <Button onClick={runSim} disabled={loading} className="gap-2 mb-4">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
        Simulate All Systems
      </Button>

      {results?.systems && (
        <>
          {results.recommended_system && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
              <div className="text-xs font-semibold text-primary mb-1">RECOMMENDED: {results.recommended_system}</div>
              <div className="text-xs text-muted-foreground">{results.recommendation_reason}</div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2">System</th>
                  <th className="text-right py-2 px-2">$/sqft</th>
                  <th className="text-right py-2 px-2">Total Cost</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">Margin</th>
                  <th className="text-right py-2 px-2">Hours</th>
                </tr>
              </thead>
              <tbody>
                {results.systems.map((s, i) => (
                  <tr key={i} className={`border-b border-border/50 ${s.name === results.recommended_system ? "bg-primary/5" : ""}`}>
                    <td className="py-2 px-2 font-medium text-foreground">{s.name}</td>
                    <td className="py-2 px-2 text-right">${s.cost_per_sqft?.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">${(s.total_cost / 1000).toFixed(0)}k</td>
                    <td className="py-2 px-2 text-right text-primary font-semibold">${(s.recommended_price / 1000).toFixed(0)}k</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ color: s.profit_margin_pct > 40 ? "#22c55e" : s.profit_margin_pct > 25 ? "#eab308" : "#ef4444" }}>
                      {s.profit_margin_pct}%
                    </td>
                    <td className="py-2 px-2 text-right">{s.labor_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}