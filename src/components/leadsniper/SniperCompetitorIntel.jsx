import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Swords, Plus, Loader2, X, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const PROJECT_TYPES = ["warehouse", "retail", "restaurant", "healthcare", "industrial", "education", "government", "hotel", "automotive", "fitness"];
const TYPE_COLORS = {
  warehouse: "#d4af37", retail: "#06b6d4", restaurant: "#f59e0b", healthcare: "#22c55e",
  industrial: "#8b5cf6", education: "#ec4899", government: "#ef4444", hotel: "#14b8a6",
  automotive: "#f97316", fitness: "#84cc16",
};
const THREAT_COLORS = { low: "bg-green-500/20 text-green-400", medium: "bg-yellow-500/20 text-yellow-400", high: "bg-orange-500/20 text-orange-400", critical: "bg-red-500/20 text-red-400" };

export default function SniperCompetitorIntel({ gcs, scopes }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company_name: "" });

  useEffect(() => {
    base44.entities.FlooringCompetitor.list("-created_date", 100)
      .then(setCompetitors)
      .catch(() => setCompetitors([]))
      .finally(() => setLoading(false));
  }, []);

  const addCompetitor = async () => {
    if (!form.company_name.trim()) return;
    setAdding(true);

    // Use LLM to research the competitor
    const research = await base44.integrations.Core.InvokeLLM({
      prompt: `Research this flooring/concrete contractor company: "${form.company_name}". Find their headquarters location, states they operate in, estimated annual revenue, employee count, specialties (epoxy, polished_concrete, urethane, polyaspartic, stained, decorative, metallic, coatings, grinding), project types they focus on (warehouse, retail, restaurant, healthcare, industrial, education, government, hotel, automotive, fitness), pricing tier (budget/mid_range/premium/enterprise), website, key strengths, and weaknesses.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          headquarters_city: { type: "string" },
          headquarters_state: { type: "string" },
          website: { type: "string" },
          estimated_annual_revenue: { type: "number" },
          employee_count: { type: "number" },
          states_active: { type: "array", items: { type: "string" } },
          specialties: { type: "array", items: { type: "string" } },
          project_focus: { type: "array", items: { type: "string" } },
          pricing_tier: { type: "string" },
          strengths: { type: "string" },
          weaknesses: { type: "string" },
        }
      },
      model: "gemini_3_flash"
    });

    const created = await base44.entities.FlooringCompetitor.create({
      company_name: form.company_name.trim(),
      headquarters_city: research.headquarters_city || "",
      headquarters_state: research.headquarters_state || "",
      website: research.website || "",
      estimated_annual_revenue: research.estimated_annual_revenue || 0,
      employee_count: research.employee_count || 0,
      states_active: JSON.stringify(research.states_active || []),
      specialties: JSON.stringify(research.specialties || []),
      project_focus: JSON.stringify(research.project_focus || []),
      pricing_tier: research.pricing_tier || "mid_range",
      threat_level: "medium",
      strengths: research.strengths || "",
      weaknesses: research.weaknesses || "",
      last_updated: new Date().toISOString(),
    });

    setCompetitors(prev => [created, ...prev]);
    setForm({ company_name: "" });
    setShowAdd(false);
    setAdding(false);
  };

  const deleteCompetitor = async (id) => {
    await base44.entities.FlooringCompetitor.delete(id);
    setCompetitors(prev => prev.filter(c => c.id !== id));
  };

  // Build comparison data
  const analysis = useMemo(() => {
    // Our pipeline coverage by project type
    const ourCoverage = {};
    PROJECT_TYPES.forEach(pt => { ourCoverage[pt] = 0; });
    gcs.forEach(gc => {
      let types = [];
      try { types = JSON.parse(gc.project_types || "[]"); } catch {}
      types.forEach(pt => { if (ourCoverage[pt] !== undefined) ourCoverage[pt]++; });
    });

    // Our state coverage
    const ourStates = {};
    gcs.forEach(gc => { ourStates[gc.state] = (ourStates[gc.state] || 0) + 1; });

    // Competitor coverage by project type
    const compCoverage = {};
    PROJECT_TYPES.forEach(pt => { compCoverage[pt] = 0; });
    competitors.forEach(c => {
      let focus = [];
      try { focus = JSON.parse(c.project_focus || "[]"); } catch {}
      focus.forEach(pt => { if (compCoverage[pt] !== undefined) compCoverage[pt]++; });
    });

    // Competitor state coverage
    const compStates = {};
    competitors.forEach(c => {
      let states = [];
      try { states = JSON.parse(c.states_active || "[]"); } catch {}
      states.forEach(st => { compStates[st] = (compStates[st] || 0) + 1; });
    });

    // Radar data: project type comparison
    const radarData = PROJECT_TYPES.map(pt => ({
      type: pt.replace(/_/g, " "),
      "XPS Pipeline": ourCoverage[pt],
      "Competitors": compCoverage[pt],
    }));

    // Revenue comparison bar chart
    const revenueData = competitors
      .filter(c => c.estimated_annual_revenue > 0)
      .sort((a, b) => b.estimated_annual_revenue - a.estimated_annual_revenue)
      .slice(0, 10)
      .map(c => ({
        name: c.company_name.length > 15 ? c.company_name.slice(0, 15) + "…" : c.company_name,
        revenue: c.estimated_annual_revenue,
      }));

    // Market gaps: types where competitors are strong but we have low coverage
    const gaps = PROJECT_TYPES
      .filter(pt => compCoverage[pt] > 0 && ourCoverage[pt] < 5)
      .map(pt => ({ type: pt, competitorPresence: compCoverage[pt], ourPresence: ourCoverage[pt] }));

    // Geographic gaps
    const geoGaps = Object.keys(compStates)
      .filter(st => !ourStates[st] || ourStates[st] < 3)
      .map(st => ({ state: st, competitors: compStates[st], ours: ourStates[st] || 0 }))
      .sort((a, b) => b.competitors - a.competitors)
      .slice(0, 10);

    return { radarData, revenueData, gaps, geoGaps };
  }, [competitors, gcs]);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Competitor Intelligence</span>
          <span className="text-[10px] text-muted-foreground">{competitors.length} tracked</span>
        </div>
        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {showAdd ? "Cancel" : "Add Competitor"}
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="flex gap-2">
          <Input
            value={form.company_name}
            onChange={e => setForm({ company_name: e.target.value })}
            placeholder="Competitor company name (AI will research)"
            className="h-8 text-xs glass-input flex-1"
            onKeyDown={e => e.key === "Enter" && addCompetitor()}
          />
          <Button size="sm" onClick={addCompetitor} disabled={adding || !form.company_name.trim()} className="text-xs h-8 metallic-gold-bg text-background">
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Research & Add"}
          </Button>
        </div>
      )}

      {/* Competitor Table */}
      {competitors.length > 0 && (
        <div className="overflow-x-auto max-h-[240px] overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 px-2">Company</th>
                <th className="py-1.5 px-2">HQ</th>
                <th className="py-1.5 px-2">Revenue</th>
                <th className="py-1.5 px-2">Employees</th>
                <th className="py-1.5 px-2">Specialties</th>
                <th className="py-1.5 px-2">Threat</th>
                <th className="py-1.5 px-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-white/[0.03]">
                  <td className="py-1.5 px-2 font-medium text-foreground">
                    {c.website ? <a href={c.website} target="_blank" rel="noopener" className="hover:text-primary">{c.company_name}</a> : c.company_name}
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground">{c.headquarters_city ? `${c.headquarters_city}, ${c.headquarters_state}` : "—"}</td>
                  <td className="py-1.5 px-2 text-foreground">{c.estimated_annual_revenue ? `$${(c.estimated_annual_revenue / 1e6).toFixed(1)}M` : "—"}</td>
                  <td className="py-1.5 px-2 text-muted-foreground">{c.employee_count || "—"}</td>
                  <td className="py-1.5 px-2 text-muted-foreground truncate max-w-[140px]">
                    {(() => { try { return JSON.parse(c.specialties || "[]").join(", "); } catch { return "—"; } })()}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${THREAT_COLORS[c.threat_level] || THREAT_COLORS.medium}`}>{c.threat_level}</span>
                  </td>
                  <td className="py-1.5 px-2">
                    <button onClick={() => deleteCompetitor(c.id)} className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts Row */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Project Focus Radar */}
          <div>
            <h3 className="text-[11px] font-bold text-foreground mb-2">Project Focus: XPS vs Competitors</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analysis.radarData}>
                  <PolarGrid stroke="hsl(240 6% 14%)" />
                  <PolarAngleAxis dataKey="type" tick={{ fontSize: 8, fill: "#888" }} />
                  <PolarRadiusAxis tick={{ fontSize: 8, fill: "#666" }} />
                  <Radar name="XPS Pipeline" dataKey="XPS Pipeline" stroke="#d4af37" fill="#d4af37" fillOpacity={0.2} />
                  <Radar name="Competitors" dataKey="Competitors" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Comparison */}
          {analysis.revenueData.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-foreground mb-2">Competitor Revenue</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.revenueData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9, fill: "#888" }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#888" }} width={100} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(240 8% 7%)", border: "1px solid hsl(240 6% 14%)", borderRadius: 8, fontSize: 11 }}
                      formatter={v => [`$${(v/1e6).toFixed(1)}M`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#ef4444" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Market Gaps */}
      {(analysis.gaps.length > 0 || analysis.geoGaps.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.gaps.length > 0 && (
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-3">
              <h3 className="text-[11px] font-bold text-orange-400 mb-2">Market Type Gaps</h3>
              <p className="text-[9px] text-muted-foreground mb-2">Competitors active here but we have low coverage</p>
              <div className="space-y-1">
                {analysis.gaps.map(g => (
                  <div key={g.type} className="flex items-center justify-between text-[10px]">
                    <span className="capitalize text-foreground">{g.type.replace(/_/g, " ")}</span>
                    <span className="text-orange-400">Us: {g.ourPresence} GCs vs {g.competitorPresence} competitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.geoGaps.length > 0 && (
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3 text-blue-400" />
                <h3 className="text-[11px] font-bold text-blue-400">Geographic Gaps</h3>
              </div>
              <p className="text-[9px] text-muted-foreground mb-2">States where competitors operate but we have few GCs</p>
              <div className="space-y-1">
                {analysis.geoGaps.map(g => (
                  <div key={g.state} className="flex items-center justify-between text-[10px]">
                    <span className="text-foreground">{g.state}</span>
                    <span className="text-blue-400">Us: {g.ours} GCs vs {g.competitors} competitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {competitors.length === 0 && !showAdd && (
        <p className="text-center text-[10px] text-muted-foreground py-4">No competitors tracked yet — click "Add Competitor" and AI will research them</p>
      )}
    </div>
  );
}