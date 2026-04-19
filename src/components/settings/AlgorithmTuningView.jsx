import { useState, useEffect } from "react";
import { Sliders, Save, RefreshCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const SCORING_FACTORS = [
  { key: "sqft_weight", label: "Square Footage Weight", desc: "How much sqft impacts lead score" },
  { key: "revenue_weight", label: "Revenue Weight", desc: "Weight of estimated revenue" },
  { key: "location_weight", label: "Location Proximity Weight", desc: "Closeness to XPS territories" },
  { key: "industry_weight", label: "Industry Fit Weight", desc: "Match to target verticals" },
  { key: "engagement_weight", label: "Engagement Weight", desc: "Response rate & interaction" },
  { key: "recency_weight", label: "Recency Weight", desc: "How recently lead was active" },
];

export default function AlgorithmTuningView() {
  const [weights, setWeights] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const settings = await base44.entities.SiteSettings.filter({ setting_key: "algorithm_weights" });
      if (settings.length > 0) {
        try { setWeights(JSON.parse(settings[0].setting_value)); } catch { setDefaults(); }
      } else { setDefaults(); }
    })();
  }, []);

  const setDefaults = () => {
    const defaults = {};
    SCORING_FACTORS.forEach(f => { defaults[f.key] = 50; });
    setWeights(defaults);
  };

  const save = async () => {
    setSaving(true);
    const existing = await base44.entities.SiteSettings.filter({ setting_key: "algorithm_weights" });
    const data = { setting_key: "algorithm_weights", setting_value: JSON.stringify(weights), category: "features" };
    if (existing.length > 0) await base44.entities.SiteSettings.update(existing[0].id, data);
    else await base44.entities.SiteSettings.create(data);
    toast({ title: "Saved", description: "Algorithm weights updated." });
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Algorithm Tuning</h1>
          <p className="text-sm text-muted-foreground">Adjust scoring weights and AI behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={setDefaults}><RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Reset</Button>
          <Button size="sm" onClick={save} disabled={saving}><Save className="w-3.5 h-3.5 mr-1.5" /> Save</Button>
        </div>
      </div>

      <div className="space-y-4">
        {SCORING_FACTORS.map(f => (
          <div key={f.key} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-foreground">{f.label}</div>
                <div className="text-[11px] text-muted-foreground">{f.desc}</div>
              </div>
              <span className="text-sm font-bold text-primary">{weights[f.key] || 50}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights[f.key] || 50}
              onChange={e => setWeights(prev => ({ ...prev, [f.key]: parseInt(e.target.value) }))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-secondary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}