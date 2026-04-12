import { cn } from "@/lib/utils";
import { Bot, Crown, Users, TrendingUp, Megaphone, Share2, DollarSign, Brain, BarChart3, Lightbulb, Radar, Code2, CheckSquare, Shield, Star, Wrench, ScrollText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const AGENTS = [
  { id: "xps_assistant", name: "XPS Ops", icon: Bot, color: "text-primary" },
  { id: "ceo_orchestrator", name: "CEO", icon: Crown, color: "text-amber-400" },
  { id: "lead_gen", name: "Lead Gen", icon: Users, color: "text-blue-400" },
  { id: "sales_director", name: "Sales", icon: TrendingUp, color: "text-green-400" },
  { id: "seo_marketing", name: "SEO", icon: Megaphone, color: "text-purple-400" },
  { id: "social_media", name: "Social", icon: Share2, color: "text-pink-400" },
  { id: "billing_controller", name: "Finance", icon: DollarSign, color: "text-emerald-400" },
  { id: "prediction", name: "Predict", icon: Brain, color: "text-cyan-400" },
  { id: "simulation", name: "Simulate", icon: BarChart3, color: "text-orange-400" },
  { id: "recommendation", name: "Strategy", icon: Lightbulb, color: "text-yellow-400" },
  { id: "scraper", name: "Scraper", icon: Radar, color: "text-red-400" },
  { id: "code_agent", name: "Engineer", icon: Code2, color: "text-indigo-400" },
  { id: "validation", name: "QA", icon: CheckSquare, color: "text-teal-400" },
  { id: "security", name: "Security", icon: Shield, color: "text-red-400" },
  { id: "reputation", name: "PR", icon: Star, color: "text-amber-400" },
  { id: "maintenance", name: "Infra", icon: Wrench, color: "text-slate-400" },
  { id: "logging", name: "Audit", icon: ScrollText, color: "text-gray-400" },
];

export { AGENTS };

export default function AgentToolbar({ activeAgentId, onSelect }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-card/50 flex-shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 px-1.5 mr-1 flex-shrink-0">
          <Bot className="w-3 h-3 metallic-gold-icon" />
          <span className="text-[9px] font-bold xps-gold-slow-shimmer whitespace-nowrap">AGENTS</span>
        </div>
        <div className="h-4 w-px bg-border flex-shrink-0 mr-0.5" />
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgentId === agent.id;
          return (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(agent)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-3 h-3", isActive ? agent.color : "")} />
                  <span className="hidden lg:inline">{agent.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                {agent.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}