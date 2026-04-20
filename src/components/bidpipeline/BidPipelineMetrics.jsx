import { Building2, Users, FileText, Send, Trophy, DollarSign, TrendingUp, Clock } from "lucide-react";

const METRIC_CONFIG = [
  { key: "totalGCs", label: "GCs in Database", icon: Building2, color: "#d4af37", format: "number" },
  { key: "activeGCs", label: "Active Bid Lists", icon: Users, color: "#22c55e", format: "number" },
  { key: "scopesThisMonth", label: "Scopes This Month", icon: FileText, color: "#06b6d4", format: "number" },
  { key: "bidsSubmitted", label: "Bids Submitted", icon: Send, color: "#8b5cf6", format: "number" },
  { key: "bidsWon", label: "Bids Won", icon: Trophy, color: "#f59e0b", format: "number" },
  { key: "winRate", label: "Win Rate", icon: TrendingUp, color: "#22c55e", format: "percent" },
  { key: "contractValue", label: "Value Won", icon: DollarSign, color: "#d4af37", format: "currency" },
  { key: "pipelineValue", label: "Pipeline Value", icon: Clock, color: "#06b6d4", format: "currency" },
];

function formatValue(val, format) {
  if (format === "currency") return `$${(val || 0).toLocaleString()}`;
  if (format === "percent") return `${(val || 0).toFixed(1)}%`;
  return (val || 0).toLocaleString();
}

export default function BidPipelineMetrics({ metrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {METRIC_CONFIG.map(m => (
        <div key={m.key} className="glass-card rounded-xl p-3 text-center">
          <m.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: m.color }} />
          <div className="text-lg font-bold text-foreground">{formatValue(metrics[m.key], m.format)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
        </div>
      ))}
    </div>
  );
}