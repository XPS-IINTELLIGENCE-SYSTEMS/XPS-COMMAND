import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Play, Loader2, ChevronRight, Zap, Brain, Shield, Wrench, TrendingUp, BarChart3, CheckSquare, Lightbulb, Code2, DollarSign, Users, Megaphone, Share2, Star, Crown, ScrollText, Radar, Globe, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AGENTS = [
  { id: "xps_assistant", name: "XPS Operations", role: "Operations", icon: Bot, desc: "CRM, leads, emails, SMS, calls, proposals, invoices — full pipeline execution", color: "text-primary" },
  { id: "ceo_orchestrator", name: "CEO Orchestrator", role: "Swarm Lead", icon: Crown, desc: "Delegates to all agents, coordinates multi-agent operations", color: "text-amber-400" },
  { id: "lead_gen", name: "Lead Gen", role: "Business Dev", icon: Users, desc: "Territory analysis, signal-based scraping, enrichment, scoring", color: "text-blue-400" },
  { id: "sales_director", name: "Sales Director", role: "Revenue", icon: TrendingUp, desc: "Proposals, follow-ups, negotiations, closing", color: "text-green-400" },
  { id: "seo_marketing", name: "SEO & Marketing", role: "Marketing", icon: Megaphone, desc: "SEO analysis, content generation, competitor intel, campaigns", color: "text-purple-400" },
  { id: "social_media", name: "Social Media", role: "Social", icon: Share2, desc: "Instagram, Facebook, LinkedIn, TikTok, YouTube content", color: "text-pink-400" },
  { id: "billing_controller", name: "Finance", role: "Finance", icon: DollarSign, desc: "Invoicing, payments, collections, financial reporting", color: "text-emerald-400" },
  { id: "prediction", name: "Prediction", role: "Strategy", icon: Brain, desc: "Revenue forecasting, trend analysis, market prediction", color: "text-cyan-400" },
  { id: "simulation", name: "Simulation", role: "Analytics", icon: BarChart3, desc: "What-if scenarios, risk modeling, pipeline simulation", color: "text-orange-400" },
  { id: "recommendation", name: "Strategy Advisor", role: "Strategy", icon: Lightbulb, desc: "Next-best-action, optimization, prioritization", color: "text-yellow-400" },
  { id: "scraper", name: "Web Scraper", role: "Intel", icon: Radar, desc: "Deep web scraping, data extraction, research automation", color: "text-red-400" },
  { id: "code_agent", name: "Systems Engineer", role: "Engineering", icon: Code2, desc: "Automation, workflows, system integrations", color: "text-indigo-400" },
  { id: "validation", name: "QA Director", role: "Quality", icon: CheckSquare, desc: "Data audits, duplicate detection, compliance checks", color: "text-teal-400" },
  { id: "security", name: "Security", role: "Security", icon: Shield, desc: "Access control, threat monitoring, data protection", color: "text-red-400" },
  { id: "reputation", name: "Reputation", role: "PR", icon: Star, desc: "Reviews, testimonials, brand sentiment monitoring", color: "text-amber-400" },
  { id: "maintenance", name: "Maintenance", role: "Infra", icon: Wrench, desc: "Data cleanup, archival, performance optimization", color: "text-slate-400" },
  { id: "logging", name: "Audit Log", role: "Audit", icon: ScrollText, desc: "Activity history, event tracking, compliance trail", color: "text-gray-400" },
];

export default function AgentFleet({ onLaunch }) {
  const [swarmCommand, setSwarmCommand] = useState("");
  const [swarmRunning, setSwarmRunning] = useState(false);
  const [swarmResult, setSwarmResult] = useState(null);

  const handleSwarm = async () => {
    if (!swarmCommand.trim() || swarmRunning) return;
    setSwarmRunning(true);
    setSwarmResult(null);
    try {
      const res = await base44.functions.invoke("swarmOrchestrator", { command: swarmCommand });
      setSwarmResult(res.data);
    } catch (err) {
      setSwarmResult({ error: err.message });
    } finally {
      setSwarmRunning(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 metallic-gold-icon" />
        </div>
        <div>
          <h1 className="text-lg font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>AGENT FLEET</h1>
          <p className="text-[10px] text-muted-foreground">{AGENTS.length} autonomous agents — click any agent to open a live session</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">ALL ONLINE</span>
        </div>
      </div>

      {/* Swarm Command */}
      <div className="rounded-xl border border-primary/20 bg-card/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold text-foreground">Swarm Command</span>
          <span className="text-[9px] text-muted-foreground">— Multi-agent execution</span>
        </div>
        <div className="flex gap-2">
          <input
            value={swarmCommand}
            onChange={(e) => setSwarmCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSwarm()}
            placeholder="e.g. 'Build a 200-lead pipeline for Phoenix and Dallas'"
            className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          />
          <button onClick={handleSwarm} disabled={swarmRunning || !swarmCommand.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold disabled:opacity-50">
            {swarmRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {swarmRunning ? "Running..." : "Execute"}
          </button>
        </div>
        {swarmResult && (
          <div className={cn("rounded-lg p-3 text-xs", swarmResult.error ? "bg-destructive/10 text-destructive" : "bg-green-500/5 text-green-400")}>
            {swarmResult.error || swarmResult.message || JSON.stringify(swarmResult)}
          </div>
        )}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <button
              key={agent.id}
              onClick={() => onLaunch(agent)}
              className="shimmer-card group flex flex-col p-4 rounded-xl bg-card/60 border border-border hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className={cn("w-5 h-5 shimmer-icon", agent.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{agent.name}</div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{agent.role}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">{agent.desc}</p>
              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
                <MessageCircle className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold text-primary">Open Session</span>
                <ChevronRight className="w-3 h-3 text-primary ml-auto group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}