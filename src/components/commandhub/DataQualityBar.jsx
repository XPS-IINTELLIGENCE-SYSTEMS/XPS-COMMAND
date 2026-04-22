import { Database, Mail, Phone, Brain, AlertTriangle } from "lucide-react";

export default function DataQualityBar({ leads, prospects }) {
  if (!leads?.length) return null;

  const total = leads.length;
  const withEmail = leads.filter(l => l.email).length;
  const withPhone = leads.filter(l => l.phone).length;
  const withScore = leads.filter(l => l.score).length;
  const withInsight = leads.filter(l => l.ai_insight).length;
  const enrichedProspects = (prospects || []).filter(p => p.enriched).length;

  const items = [
    { label: "Total Leads", value: total, icon: Database, color: "#d4af37" },
    { label: "Has Email", value: withEmail, pct: Math.round(withEmail / total * 100), icon: Mail, color: withEmail / total > 0.7 ? "#22c55e" : "#f59e0b" },
    { label: "Has Phone", value: withPhone, pct: Math.round(withPhone / total * 100), icon: Phone, color: withPhone / total > 0.5 ? "#22c55e" : "#f59e0b" },
    { label: "AI Scored", value: withScore, pct: Math.round(withScore / total * 100), icon: Brain, color: withScore / total > 0.5 ? "#22c55e" : "#ef4444" },
    { label: "AI Insight", value: withInsight, pct: Math.round(withInsight / total * 100), icon: Brain, color: withInsight / total > 0.3 ? "#22c55e" : "#ef4444" },
    { label: "Prospects Enriched", value: enrichedProspects, pct: prospects?.length ? Math.round(enrichedProspects / prospects.length * 100) : 0, icon: Database, color: "#8b5cf6" },
  ];

  return (
    <div className="grid grid-cols-6 gap-2">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-card rounded-xl p-2.5 text-center">
            <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: item.color }} />
            <div className="text-lg font-black" style={{ color: item.color }}>{item.value}</div>
            <div className="text-[8px] text-muted-foreground">{item.label}</div>
            {item.pct !== undefined && (
              <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}