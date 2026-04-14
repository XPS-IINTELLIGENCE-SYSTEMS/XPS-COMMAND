import { DollarSign, Users, Mail, FileText, TrendingUp, Zap } from "lucide-react";

const kpis = [
  { key: "pipeline", label: "Pipeline", icon: TrendingUp, format: "dollar" },
  { key: "leads_today", label: "Leads Today", icon: Users, format: "number" },
  { key: "emails_today", label: "Emails Sent", icon: Mail, format: "number" },
  { key: "proposals_open", label: "Open Proposals", icon: FileText, format: "number" },
  { key: "revenue_month", label: "This Month", icon: DollarSign, format: "dollar" },
  { key: "revenue_year", label: "This Year", icon: Zap, format: "dollar" },
];

function fmt(val, format) {
  if (format === "dollar") return `$${(val / 1000).toFixed(0)}k`;
  return val.toLocaleString();
}

export default function OwnerKPIBar({ data }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        const val = data?.[kpi.key] || 0;
        return (
          <div key={kpi.key} className="glass-card rounded-xl p-3 text-center">
            <Icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
            <div className="text-lg font-bold text-foreground">{fmt(val, kpi.format)}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </div>
        );
      })}
    </div>
  );
}