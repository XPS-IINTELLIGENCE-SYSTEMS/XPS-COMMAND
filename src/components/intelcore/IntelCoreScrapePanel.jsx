import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Zap, Building2, Share2, MapPin } from "lucide-react";

const ACTIONS = [
  { id: "full", label: "Full Scan", desc: "All XPS brands + social + 60+ locations", icon: Zap, color: "#d4af37" },
  { id: "brands", label: "Brands", desc: "XPS, NCP, CPU, Xpress, Epoxy Network, XPS Intel", icon: Building2, color: "#6366f1" },
  { id: "social", label: "Social & Video", desc: "FB, IG, YouTube, TikTok, LinkedIn for all brands", icon: Share2, color: "#ec4899" },
  { id: "locations", label: "60+ Locations", desc: "All XPS franchise/dealer locations nationwide", icon: MapPin, color: "#0ea5e9" },
];

export default function IntelCoreScrapePanel({ onComplete }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);

  const run = async (action) => {
    setRunning(action);
    setResult(null);
    try {
      const res = await base44.functions.invoke("xpsIntelCore", { action });
      setResult(res.data);
      onComplete?.();
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ACTIONS.map(a => (
          <button key={a.id} onClick={() => run(a.id)} disabled={!!running}
            className={`glass-card rounded-lg p-3 text-left transition-all hover:border-white/15 ${running === a.id ? "ring-1 ring-primary" : ""}`}>
            <div className="flex items-center gap-2 mb-1">
              {running === a.id ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: a.color }} /> : <a.icon className="w-4 h-4" style={{ color: a.color }} />}
              <span className="text-[11px] font-bold text-foreground">{a.label}</span>
            </div>
            <p className="text-[9px] text-muted-foreground leading-tight">{a.desc}</p>
          </button>
        ))}
      </div>
      {running && (
        <div className="flex items-center gap-2 text-[10px] text-primary p-2 glass-card rounded-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Scraping in progress — this may take 1-3 minutes...</span>
        </div>
      )}
      {result && !running && (
        <div className={`rounded-lg p-3 text-[10px] ${result.error ? "bg-red-500/10 border border-red-500/30" : "bg-green-500/10 border border-green-500/30"}`}>
          {result.error ? <span className="text-red-400">Error: {result.error}</span> : (
            <div className="space-y-1">
              <span className="font-bold text-green-400">✅ {result.stats?.total || 0} records ingested</span>
              <div className="flex gap-4 text-muted-foreground">
                <span>Brands: {result.stats?.brands || 0}</span>
                <span>Social: {result.stats?.social || 0}</span>
                <span>Locations: {result.stats?.locations || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}