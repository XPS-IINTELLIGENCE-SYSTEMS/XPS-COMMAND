import { Users, DollarSign, PhoneCall, Trophy, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CRMStatsBar({ leads, callLogs }) {
  const pipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage));
  const pipelineValue = pipeline.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const won = leads.filter(l => l.stage === "Won");
  const wonValue = won.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const needsContact = leads.filter(l => ["Incoming", "Validated", "Qualified", "Prioritized"].includes(l.stage) && !l.last_contacted).length;
  const followUps = leads.filter(l => ["Contacted", "Proposal", "Negotiation"].includes(l.stage)).length;
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;

  const stats = [
    { label: "Total Contacts", value: leads.length, icon: Users, color: "#d4af37" },
    { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}k`, icon: DollarSign, color: "#3b82f6" },
    { label: "Won Deals", value: won.length, sub: `$${(wonValue / 1000).toFixed(0)}k`, icon: Trophy, color: "#22c55e" },
    { label: "Needs Contact", value: needsContact, icon: PhoneCall, color: "#ef4444" },
    { label: "Follow-Ups", value: followUps, icon: Clock, color: "#f59e0b" },
    { label: "Avg Score", value: avgScore, icon: TrendingUp, color: "#8b5cf6" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            {s.sub && <div className="text-[9px] text-muted-foreground">{s.sub}</div>}
            <div className="text-[9px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}