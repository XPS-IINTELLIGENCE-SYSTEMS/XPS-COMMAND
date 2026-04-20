import { Building2, Users, Send, Trophy, DollarSign, TrendingUp, Clock, Crosshair } from "lucide-react";

const METRICS = [
  { key: "totalGCs", label: "GCs Found", icon: Building2, color: "#d4af37" },
  { key: "contacted", label: "Contacted", icon: Send, color: "#06b6d4" },
  { key: "activeGCs", label: "On Bid Lists", icon: Users, color: "#22c55e" },
  { key: "scopesThisMonth", label: "Scopes Received", icon: Crosshair, color: "#8b5cf6" },
  { key: "bidsSubmitted", label: "Bids Out", icon: Clock, color: "#f59e0b" },
  { key: "bidsWon", label: "Won", icon: Trophy, color: "#22c55e" },
  { key: "winRate", label: "Win Rate", icon: TrendingUp, color: "#d4af37", format: "percent" },
  { key: "contractValue", label: "Revenue Won", icon: DollarSign, color: "#22c55e", format: "currency" },
];

export default function SniperMetrics({ metrics }) {
  const fmt = (val, format) => {
    if (format === "currency") return `$${(val || 0).toLocaleString()}`;
    if (format === "percent") return `${(val || 0).toFixed(1)}%`;
    return (val || 0).toLocaleString();
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {METRICS.map(m => (
        <div key={m.key} className="glass-card rounded-xl p-2.5 text-center">
          <m.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: m.color }} />
          <div className="text-base sm:text-lg font-bold text-foreground leading-tight">{fmt(metrics[m.key], m.format)}</div>
          <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.label}</div>
        </div>
      ))}
    </div>
  );
}