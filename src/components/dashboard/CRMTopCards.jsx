import { UserCheck, Clock, Users } from "lucide-react";

const CARDS = [
  { id: "contact_first", label: "Contact First", desc: "Highest priority awaiting contact", icon: UserCheck, color: "#ef4444", nav: "crm" },
  { id: "follow_up_crm", label: "Follow Up", desc: "Awaiting follow-up response", icon: Clock, color: "#f59e0b", nav: "follow_up" },
  { id: "in_pipeline", label: "In Pipeline", desc: "Active leads in pipeline", icon: Users, color: "#22c55e", nav: "crm" },
];

export default function CRMTopCards({ leads, onNavigate }) {
  const contactFirst = leads.filter(l =>
    ["Qualified", "Prioritized", "Validated"].includes(l.pipeline_status) && !l.last_contacted
  ).length;

  const followUp = leads.filter(l =>
    ["Contacted", "Proposal", "Negotiation"].includes(l.stage)
  ).length;

  const pipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage));
  const pipelineValue = pipeline.reduce((s, l) => s + (l.estimated_value || 0), 0);

  const statMap = {
    contact_first: `${contactFirst} leads`,
    follow_up_crm: `${followUp} awaiting`,
    in_pipeline: `${pipeline.length} · $${(pipelineValue / 1000).toFixed(0)}k`,
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onNavigate(card.nav)}
            className="rounded-2xl p-4 md:p-5 text-center transition-all duration-200 bg-white/[0.04] backdrop-blur-2xl border animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 mx-auto">
              <Icon className="w-6 h-6" style={{ color: card.color }} />
            </div>
            <div className="text-sm font-bold text-foreground mb-0.5">{card.label}</div>
            <div className="text-[11px] text-muted-foreground leading-snug">{card.desc}</div>
            <div className="mt-2 text-xs font-semibold text-primary/80">{statMap[card.id]}</div>
          </button>
        );
      })}
    </div>
  );
}