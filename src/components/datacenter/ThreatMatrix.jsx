import { AlertTriangle, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";

export default function ThreatMatrix({ stats }) {
  const alerts = [
    {
      level: stats.hotLeads > 0 ? "info" : "warning",
      icon: TrendingUp,
      label: `${stats.hotLeads} hot leads awaiting contact`,
      action: "ENGAGE",
      color: stats.hotLeads > 0 ? "#d4af37" : "#ef4444",
    },
    {
      level: stats.enrichmentRate >= 60 ? "ok" : "warning",
      icon: stats.enrichmentRate >= 60 ? CheckCircle : AlertTriangle,
      label: `AI enrichment at ${stats.enrichmentRate}% — ${stats.enrichmentRate < 60 ? "below threshold" : "nominal"}`,
      action: stats.enrichmentRate < 60 ? "ENRICH" : "OK",
      color: stats.enrichmentRate >= 60 ? "#22c55e" : "#f59e0b",
    },
    {
      level: stats.systemHealth >= 70 ? "ok" : "warning",
      icon: Shield,
      label: `Intel freshness: ${stats.systemHealth}% — ${stats.intelFresh} live records`,
      action: stats.systemHealth < 70 ? "SCRAPE" : "OK",
      color: stats.systemHealth >= 70 ? "#22c55e" : "#f59e0b",
    },
    {
      level: "info",
      icon: Clock,
      label: `${stats.activeJobs} active jobs | ${stats.proposalsSent} proposals sent | ${stats.emailsSent} emails delivered`,
      action: "MONITOR",
      color: "#06b6d4",
    },
  ];

  return (
    <div className="px-4 py-3 border-t border-cyan-900/30" style={{ background: "rgba(0,10,20,0.3)" }}>
      <div className="flex items-center gap-1 mb-2">
        <div className="w-1 h-1 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-[9px] font-mono text-cyan-400/60 tracking-widest uppercase">Alert Matrix</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: a.color }} />
              <span className="text-[10px] font-mono text-white/60 flex-1">{a.label}</span>
              <span
                className="text-[8px] font-mono font-bold px-2 py-0.5 rounded tracking-widest"
                style={{ color: a.color, background: `${a.color}15` }}
              >
                {a.action}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}