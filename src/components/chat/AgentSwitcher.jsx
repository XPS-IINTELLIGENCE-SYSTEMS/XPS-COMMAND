import { cn } from "@/lib/utils";
import { Bot, Crown, Users, TrendingUp, Megaphone, Share2, DollarSign, Brain, BarChart3, Lightbulb, Radar, Code2, CheckSquare, Shield, Star, Wrench, ScrollText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const AGENTS = [
  { id: "xps_ops_master", name: "OPS🔥", fullName: "XPS Ops Master", icon: Crown, desc: "Supreme admin: full system access, headless/headful browser automation, persistent memory, agent orchestration", color: "text-red-400" },
  { id: "xps_assistant", name: "XPS Ops", fullName: "Contractor Assist", icon: Bot, desc: "CRM, leads, emails, proposals, invoices — full pipeline", color: "text-primary" },
  { id: "ceo_orchestrator", name: "CEO", fullName: "CEO Orchestrator", icon: Crown, desc: "Delegates to all agents, multi-agent ops", color: "text-amber-400" },
  { id: "lead_gen", name: "Leads", fullName: "Lead Gen", icon: Users, desc: "Territory analysis, scraping, enrichment", color: "text-blue-400" },
  { id: "sales_director", name: "Sales", fullName: "Sales Director", icon: TrendingUp, desc: "Proposals, follow-ups, closing", color: "text-green-400" },
  { id: "seo_marketing", name: "SEO", fullName: "SEO & Marketing", icon: Megaphone, desc: "SEO, content, competitors, campaigns", color: "text-purple-400" },
  { id: "social_media", name: "Social", fullName: "Social Media", icon: Share2, desc: "Instagram, LinkedIn, TikTok content", color: "text-pink-400" },
  { id: "billing_controller", name: "Finance", fullName: "Finance", icon: DollarSign, desc: "Invoicing, payments, collections", color: "text-emerald-400" },
  { id: "prediction", name: "Predict", fullName: "Prediction", icon: Brain, desc: "Revenue forecasting, trends", color: "text-cyan-400" },
  { id: "simulation", name: "Simulate", fullName: "Simulation", icon: BarChart3, desc: "What-if scenarios, risk modeling", color: "text-orange-400" },
  { id: "recommendation", name: "Strategy", fullName: "Strategy Advisor", icon: Lightbulb, desc: "Next-best-action, optimization", color: "text-yellow-400" },
  { id: "scraper", name: "Scraper", fullName: "Web Scraper", icon: Radar, desc: "Deep web scraping, data extraction", color: "text-red-400" },
  { id: "code_agent", name: "Engineer", fullName: "Systems Engineer", icon: Code2, desc: "Automation, workflows, integrations", color: "text-indigo-400" },
  { id: "validation", name: "QA", fullName: "QA Director", icon: CheckSquare, desc: "Data audits, compliance checks", color: "text-teal-400" },
  { id: "security", name: "Security", fullName: "Security", icon: Shield, desc: "Access control, threat monitoring", color: "text-red-400" },
  { id: "reputation", name: "PR", fullName: "Reputation", icon: Star, desc: "Reviews, sentiment monitoring", color: "text-amber-400" },
  { id: "maintenance", name: "Infra", fullName: "Maintenance", icon: Wrench, desc: "Cleanup, archival, performance", color: "text-slate-400" },
  { id: "logging", name: "Audit", fullName: "Audit Log", icon: ScrollText, desc: "Activity tracking, compliance", color: "text-gray-400" },
];

export { AGENTS };

export default function AgentSwitcher({ activeAgent, onSwitch, mobile = false }) {
  // Only show XPS Assistant agent
  const agent = AGENTS.find(a => a.id === "xps_assistant");
  if (!agent) return null;
  
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex items-center gap-1.5">
        <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-5 h-5 object-contain" />
        <span className="text-xs font-bold xps-gold-slow-shimmer">{agent.fullName}</span>
      </div>
    </div>
  );
}