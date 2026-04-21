import { Shield, BarChart3, Zap, TrendingUp, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BUCKET_META = {
  low_risk: { label: 'Low Risk', icon: Shield, color: '#22c55e', bg: 'bg-green-500/10' },
  mid_risk: { label: 'Mid Risk', icon: BarChart3, color: '#f59e0b', bg: 'bg-yellow-500/10' },
  high_risk: { label: 'High Risk', icon: Zap, color: '#ef4444', bg: 'bg-red-500/10' },
  day_trading: { label: 'Day Trading', icon: TrendingUp, color: '#8b5cf6', bg: 'bg-purple-500/10' },
  business_venture: { label: 'Ventures', icon: Briefcase, color: '#d4af37', bg: 'bg-primary/10' },
};

export default function BucketCards({ portfolios, selectedBucket, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {portfolios.map((p) => {
        const meta = BUCKET_META[p.bucket] || BUCKET_META.low_risk;
        const Icon = meta.icon;
        const pnlPct = p.initial_balance ? ((p.total_gain_loss || 0) / p.initial_balance * 100) : 0;
        const isUp = (p.total_gain_loss || 0) >= 0;
        const isSelected = selectedBucket === p.bucket;

        return (
          <button key={p.id} onClick={() => onSelect(p.bucket === selectedBucket ? null : p.bucket)}
            className={`glass-card rounded-xl p-3 text-left transition-all border-l-2 ${isSelected ? 'ring-1 ring-primary/40 bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
            style={{ borderLeftColor: meta.color }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${meta.bg}`}>
                <Icon className="w-3 h-3" style={{ color: meta.color }} />
              </div>
              <span className="text-[10px] font-bold text-foreground">{meta.label}</span>
            </div>
            <div className="text-base font-black text-foreground">${(p.current_balance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            <div className={`text-[10px] font-semibold mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}{pnlPct.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[9px] ${(p.day_gain_loss || 0) >= 0 ? 'text-green-400/60' : 'text-red-400/60'}`}>
                Cycle: {(p.day_gain_loss || 0) >= 0 ? '+' : ''}${(p.day_gain_loss || 0).toFixed(0)}
              </span>
              <Badge variant="secondary" className="text-[7px] px-1 py-0">{p.total_trades || 0}</Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}