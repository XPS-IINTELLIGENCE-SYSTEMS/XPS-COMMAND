import { cn } from "@/lib/utils";
import { TrendingUp, Target, Award } from "lucide-react";

const TIER_CONFIG = {
  aggressive: { label: "Aggressive", icon: TrendingUp, color: "#f59e0b", desc: "Win-focused, lower margin" },
  optimal:    { label: "Optimal",    icon: Target,     color: "#22c55e", desc: "Best balance of win rate & profit" },
  premium:    { label: "Premium",    icon: Award,      color: "#8b5cf6", desc: "Maximum margin, premium clients" },
};

export default function PricingTierCard({ tierKey, tier, sqft, isRecommended }) {
  const config = TIER_CONFIG[tierKey] || TIER_CONFIG.optimal;
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      isRecommended
        ? "bg-primary/8 border-primary/30 ring-1 ring-primary/20"
        : "bg-white/[0.03] border-white/8 hover:border-white/15"
    )}>
      {isRecommended && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 block">Recommended</span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}18` }}>
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{config.label}</h4>
          <p className="text-[11px] text-white/40">{config.desc}</p>
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        ${tier.price_per_sqft?.toFixed(2)}<span className="text-sm text-white/40">/sqft</span>
      </div>
      {sqft > 0 && (
        <div className="text-sm text-white/60 mb-3">Total: ${tier.total?.toLocaleString() || (tier.price_per_sqft * sqft).toLocaleString()}</div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-white/5">
          <span className="text-white/40">Win Rate</span>
          <span className="block text-white font-semibold">{tier.win_probability}%</span>
        </div>
        <div className="p-2 rounded bg-white/5">
          <span className="text-white/40">Margin</span>
          <span className="block text-white font-semibold">{tier.margin_pct}%</span>
        </div>
      </div>
      {tier.rationale && (
        <p className="text-[11px] text-white/40 mt-2 leading-relaxed">{tier.rationale}</p>
      )}
    </div>
  );
}