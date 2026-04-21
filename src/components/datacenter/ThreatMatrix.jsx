import { AlertTriangle, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";

export default function ThreatMatrix({ stats }) {
  const alerts = [
    {
      icon: TrendingUp,
      label: `${stats.hotLeads} hot leads awaiting contact`,
      action: stats.hotLeads > 0 ? "ENGAGE" : "CLEAR",
      warn: stats.hotLeads > 0,
    },
    {
      icon: stats.enrichmentRate >= 60 ? CheckCircle : AlertTriangle,
      label: `AI enrichment at ${stats.enrichmentRate}% — ${stats.enrichmentRate < 60 ? "below threshold" : "nominal"}`,
      action: stats.enrichmentRate < 60 ? "ENRICH" : "OK",
      warn: stats.enrichmentRate < 60,
    },
    {
      icon: Shield,
      label: `Intel freshness: ${stats.systemHealth}% — ${stats.intelFresh} live records`,
      action: stats.systemHealth < 70 ? "SCRAPE" : "OK",
      warn: stats.systemHealth < 70,
    },
    {
      icon: Clock,
      label: `${stats.activeJobs} active jobs | ${stats.proposalsSent} proposals | ${stats.emailsSent} emails`,
      action: "MONITOR",
      warn: false,
    },
  ];

  return (
    <div className="px-4 py-3 dc-divider-t" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="flex items-center gap-1 mb-2">
        <div className="w-1 h-1 rounded-full bg-[#d4af37]/60 animate-pulse" />
        <span className="text-[8px] font-mono text-[#d4af37]/40 tracking-[0.3em] uppercase">Alert Matrix</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: a.warn ? "rgba(212,175,55,0.03)" : "rgba(0,0,0,0.2)",
                border: `1px solid ${a.warn ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.02)"}`,
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: a.warn ? "#d4af37" : "rgba(255,255,255,0.2)" }} />
              <span className="text-[9px] font-mono text-white/40 flex-1">{a.label}</span>
              <span
                className="text-[7px] font-mono font-bold px-2 py-0.5 rounded tracking-[0.2em]"
                style={{
                  color: a.warn ? "#d4af37" : "rgba(255,255,255,0.2)",
                  background: a.warn ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                }}
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