import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MetricCard({ label, value, change, changeLabel, icon: Icon, color }) {
  const isUp = change > 0;
  const isDown = change < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? "text-xps-green" : isDown ? "text-xps-red" : "text-muted-foreground";

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: (color || "#d4af37") + "18", border: `1px solid ${color || "#d4af37"}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: color || "#d4af37" }} />
        </div>
        <div className={cn("flex items-center gap-1 text-[10px] font-medium", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {changeLabel && (
        <div className="text-[9px] text-muted-foreground/60 mt-0.5">{changeLabel}</div>
      )}
    </div>
  );
}