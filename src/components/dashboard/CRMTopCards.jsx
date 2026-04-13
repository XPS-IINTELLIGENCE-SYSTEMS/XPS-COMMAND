import { UserCheck, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CRMTopCards({ leads, onNavigate }) {
  // Contact First: leads in Qualified/Prioritized stages that haven't been contacted
  const contactFirst = leads.filter(l => 
    ["Qualified", "Prioritized", "Validated"].includes(l.pipeline_status) && 
    !l.last_contacted
  ).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

  // Follow Up: leads that have been contacted but not won/lost
  const followUp = leads.filter(l => 
    l.stage === "Contacted" || l.stage === "Proposal" || l.stage === "Negotiation"
  ).sort((a, b) => {
    const aDate = a.last_contacted ? new Date(a.last_contacted) : new Date(0);
    const bDate = b.last_contacted ? new Date(b.last_contacted) : new Date(0);
    return aDate - bDate; // oldest first
  }).slice(0, 5);

  // Pipeline: all active leads (not Won/Lost)
  const pipeline = leads.filter(l => 
    !["Won", "Lost"].includes(l.stage)
  );
  const pipelineValue = pipeline.reduce((s, l) => s + (l.estimated_value || 0), 0);

  const cards = [
    {
      title: "Contact First",
      desc: "Highest priority leads awaiting first contact",
      icon: UserCheck,
      color: "#ef4444",
      count: contactFirst.length,
      items: contactFirst,
      nav: "crm",
    },
    {
      title: "Follow Up",
      desc: "Leads awaiting follow-up response",
      icon: Clock,
      color: "#f59e0b",
      count: followUp.length,
      items: followUp,
      nav: "follow_up",
    },
    {
      title: "In Pipeline",
      desc: `${pipeline.length} active leads · $${(pipelineValue / 1000).toFixed(0)}k value`,
      icon: Users,
      color: "#22c55e",
      count: pipeline.length,
      items: pipeline.slice(0, 5),
      nav: "crm",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            onClick={() => onNavigate(card.nav)}
            className="rounded-2xl p-4 md:p-5 text-left transition-all duration-200 bg-white/[0.04] backdrop-blur-2xl border animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{card.title}</div>
                <div className="text-[10px] text-muted-foreground">{card.desc}</div>
              </div>
              <div className="ml-auto text-2xl font-extrabold" style={{ color: card.color }}>{card.count}</div>
            </div>
            {card.items.length > 0 && (
              <div className="space-y-1.5">
                {card.items.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-foreground truncate">{lead.company}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{lead.contact_name}{lead.vertical ? ` · ${lead.vertical}` : ''}</div>
                    </div>
                    {lead.score != null && (
                      <div className={cn(
                        "text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded",
                        lead.score >= 70 ? "text-green-400 bg-green-400/10" :
                        lead.score >= 40 ? "text-yellow-400 bg-yellow-400/10" :
                        "text-red-400 bg-red-400/10"
                      )}>{lead.score}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}