import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompetitiveIntelCenter() {
  const [competitors, setCompetitors] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [comps, mfrs] = await Promise.all([
      base44.entities.CompetitorProfile.list("-threat_level", 20),
      base44.entities.ManufacturerProfile.list("-data_completeness_score", 20),
    ]);
    setCompetitors(comps);
    setManufacturers(mfrs);
    setLoading(false);
  };

  const threatColor = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Competitive Intelligence</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
      </div>

      {/* Threat matrix */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {["critical", "high", "medium", "low"].map(level => {
          const count = competitors.filter(c => c.threat_level === level).length;
          return (
            <div key={level} className="rounded-xl p-2.5 text-center" style={{ background: `${threatColor[level]}15` }}>
              <div className="text-lg font-bold" style={{ color: threatColor[level] }}>{count}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{level} Threat</div>
            </div>
          );
        })}
      </div>

      {/* Competitor list */}
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">TOP COMPETITORS</h4>
      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {competitors.slice(0, 10).map(c => (
          <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
            <div>
              <div className="text-sm font-medium text-foreground">{c.company_name}</div>
              <div className="text-[10px] text-muted-foreground">{c.website}</div>
            </div>
            <div className="flex items-center gap-2">
              {c.change_detected && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" title="Change detected" />}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${threatColor[c.threat_level]}20`, color: threatColor[c.threat_level] }}>
                {c.threat_level}
              </span>
              {c.domain_authority && <span className="text-[10px] text-muted-foreground">DA: {c.domain_authority}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Manufacturer profiles */}
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">MANUFACTURER PROFILES ({manufacturers.length})</h4>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {manufacturers.slice(0, 8).map(m => (
          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
            <div>
              <div className="text-xs font-medium text-foreground">{m.company_name}</div>
              <div className="text-[10px] text-muted-foreground">{m.market_position?.slice(0, 60)}</div>
            </div>
            <div className="text-[10px] text-primary font-semibold">{m.data_completeness_score || 0}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}