import { Globe, Swords, BarChart3, Pencil, Radio, FileBarChart, ArrowUpRight, Sparkles, Terminal, Wrench } from "lucide-react";

const tools = [
  { 
    name: "Research Lab", 
    desc: "Trigger deep web research on companies, markets, and competitors. AI scrapes and structures data from hundreds of sources.", 
    icon: Globe,
    actions: ["Run Company Research", "Industry Scan", "News Monitor"]
  },
  { 
    name: "Competition Watch", 
    desc: "Real-time competitor monitoring — pricing changes, new hires, ad spend, service area expansion, and review sentiment.", 
    icon: Swords,
    actions: ["View Competitors", "Set Alert", "Generate Report"]
  },
  { 
    name: "CRM Deep Dive", 
    desc: "Full pipeline explorer with advanced filtering, deal flow analysis, contact mapping, and revenue attribution.", 
    icon: BarChart3,
    actions: ["Pipeline View", "Contact Map", "Revenue Attribution"]
  },
  { 
    name: "Editor Studio", 
    desc: "AI-powered creation tools — UI builder, image generator, video creator, and web browser for visual content.", 
    icon: Pencil,
    actions: ["UI Builder", "Generate Images", "Create Video"]
  },
  { 
    name: "Operator Console", 
    desc: "Direct agent command interface. Issue multi-step instructions, monitor execution, and manage sub-agent orchestration.", 
    icon: Radio,
    actions: ["Open Console", "Agent Status", "Task Queue"]
  },
  { 
    name: "AI Reports", 
    desc: "Generate and schedule performance reports — sales metrics, AI ROI, outreach effectiveness, and territory analytics.", 
    icon: FileBarChart,
    actions: ["Generate Report", "Schedule", "View History"]
  },
];

export default function AdminPowerTools() {
  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4 flex items-center gap-3">
        <Terminal className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <div className="text-sm font-semibold text-foreground">Admin-Only Power Tools</div>
          <div className="text-[11px] text-muted-foreground">Advanced features for system administrators and power users</div>
        </div>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.name} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{tool.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {tool.actions.map((action) => (
                  <button key={action} className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium text-foreground border border-border hover:border-primary/30 active:scale-[0.97] transition-all">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}