import { Wrench, TrendingUp } from "lucide-react";

const AGENTS = [
  {
    id: "xps_assistant",
    name: "XPS ASSIST",
    fullName: "Contractor Assist",
    icon: Wrench,
    desc: "Sales, leads, proposals, emails, calls",
    color: "text-primary",
  },
  {
    id: "seo_marketing",
    name: "SEO ENGINE",
    fullName: "Marketing Intelligence",
    icon: TrendingUp,
    desc: "SEO, content, competitors, knowledge",
    color: "text-emerald-400",
  },
];

export { AGENTS };

export default function AgentSwitcher({ activeAgent, onSwitch, mobile = false }) {
  return (
    <div className={`flex ${mobile ? 'gap-1' : 'gap-1.5'}`}>
      {AGENTS.map((agent) => {
        const Icon = agent.icon;
        const isActive = activeAgent === agent.id;
        return (
          <button
            key={agent.id}
            onClick={() => onSwitch(agent.id)}
            className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-left ${
              isActive
                ? "bg-secondary border border-primary/30"
                : "bg-transparent border border-transparent hover:bg-secondary/50"
            }`}
          >
            <Icon className={`w-3 h-3 flex-shrink-0 ${isActive ? 'metallic-gold-icon' : 'metallic-silver-icon'}`} />
            <div className="min-w-0">
              <div className={`text-[10px] font-bold truncate ${isActive ? 'xps-gold-slow-shimmer' : 'text-muted-foreground'}`}>
                {agent.name}
              </div>
              {!mobile && (
                <div className="text-[8px] text-muted-foreground truncate">{agent.desc}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}