import { Ruler, DollarSign, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ZONE_COLORS = [
  "#d4af37", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#ef4444", "#84cc16",
];

export default function CanvasTakeoffSummary({ zones, scaleFactor, onSendToProposal }) {
  if (!zones || zones.length === 0) return null;

  const polygonArea = (pts) => {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
  };

  const zoneData = zones.map((z, i) => {
    const pxArea = polygonArea(z.points);
    const sqft = Math.round(pxArea * (scaleFactor || 1));
    return { ...z, sqft, color: ZONE_COLORS[i % ZONE_COLORS.length] };
  });

  const totalSqft = zoneData.reduce((s, z) => s + z.sqft, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" /> Takeoff Summary
        </h3>
        <span className="text-xs text-white/40">{zoneData.length} zones · {totalSqft.toLocaleString()} sqft total</span>
      </div>

      {/* Zone list */}
      <div className="grid gap-2">
        {zoneData.map((z, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/8">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: z.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{z.name}</div>
              <div className="text-xs text-white/40">{z.system}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-primary">{z.sqft.toLocaleString()} sqft</div>
              <div className="text-[10px] text-white/30">{z.points.length} points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">Total Floor Area</p>
          <p className="text-2xl font-bold text-primary">{totalSqft.toLocaleString()} sqft</p>
        </div>
        <Ruler className="w-6 h-6 text-primary/40" />
      </div>

      {/* Send to proposal */}
      <Button onClick={() => onSendToProposal?.(zoneData, totalSqft)} className="w-full h-11 metallic-gold-bg text-black font-bold gap-2">
        <Sparkles className="w-4 h-4" /> Send to AI Proposal Generator <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}