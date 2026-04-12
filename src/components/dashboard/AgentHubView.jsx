import { useState } from "react";
import { Bot, Play, Loader2, ChevronRight, Zap, Brain, Shield, Wrench, TrendingUp, BarChart3, CheckSquare, Lightbulb, Code2, DollarSign, Users, Megaphone, Share2, Star, Crown, ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const AGENTS = [
  { id: "ceo_orchestrator", name: "CEO Orchestrator", role: "Swarm Commander", icon: Crown, color: "text-yellow-500", desc: "Delegates to all agents, strategic decisions" },
  { id: "lead_gen", name: "Lead Gen Manager", role: "Business Dev", icon: Users, color: "text-blue-400", desc: "Territory analysis, scraping, enrichment, scoring" },
  { id: "sales_director", name: "Sales Director", role: "Revenue", icon: TrendingUp, color: "text-green-400", desc: "Proposals, follow-ups, closing deals" },
  { id: "seo_marketing", name: "Marketing Director", role: "Marketing", icon: Megaphone, color: "text-purple-400", desc: "SEO, content, competitor intel, campaigns" },
  { id: "social_media", name: "Social Media Manager", role: "Social", icon: Share2, color: "text-pink-400", desc: "Instagram, Facebook, LinkedIn, TikTok, YouTube" },
  { id: "billing_controller", name: "Finance Controller", role: "Finance", icon: DollarSign, color: "text-emerald-400", desc: "Invoicing, payments, collections, reporting" },
  { id: "prediction", name: "Prediction Analyst", role: "Strategy", icon: Brain, color: "text-cyan-400", desc: "Revenue forecasting, trend analysis, market prediction" },
  { id: "simulation", name: "Simulation Analyst", role: "Strategy", icon: BarChart3, color: "text-indigo-400", desc: "What-if scenarios, risk modeling, pipeline simulation" },
  { id: "validation", name: "QA Director", role: "Quality", icon: CheckSquare, color: "text-amber-400", desc: "Data audits, duplicate detection, compliance" },
  { id: "recommendation", name: "Strategy Advisor", role: "Strategy", icon: Lightbulb, color: "text-orange-400", desc: "Next-best-action, optimization, prioritization" },
  { id: "code_agent", name: "Systems Engineer", role: "Engineering", icon: Code2, color: "text-slate-400", desc: "Automation, workflows, system maintenance" },
  { id: "security", name: "Security Director", role: "Security", icon: Shield, color: "text-red-400", desc: "Access control, data protection, threat monitoring" },
  { id: "security_ops", name: "Security Ops Analyst", role: "Security", icon: Shield, color: "text-red-300", desc: "Threat hunting, incident response, vulnerability assessment" },
  { id: "logging", name: "Logging Agent", role: "Audit", icon: ScrollText, color: "text-teal-400", desc: "Full audit trail, event tracking, activity history" },
  { id: "maintenance", name: "Maintenance Ops", role: "Infrastructure", icon: Wrench, color: "text-gray-400", desc: "Data cleanup, archival, performance optimization" },
  { id: "reputation", name: "Reputation Manager", role: "PR", icon: Star, color: "text-yellow-400", desc: "Reviews, testimonials, brand sentiment" },
  { id: "xps_assistant", name: "Operations Director", role: "Operations", icon: Bot, color: "text-primary", desc: "CRM, emails, SMS, calls, proposals, invoices" },
];

function AgentCard({ agent }) {
  const Icon = agent.icon;
  return (
    <div className="shimmer-card group flex items-center gap-3 p-3.5 rounded-xl bg-card/60 border border-border hover:border-primary/30 transition-all cursor-pointer">
      <div className={cn("w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", agent.color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{agent.role}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{agent.desc}</p>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[9px] font-bold text-green-500">ONLINE</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export default function AgentHubView() {
  const [swarmCommand, setSwarmCommand] = useState("");
  const [swarmRunning, setSwarmRunning] = useState(false);
  const [swarmResult, setSwarmResult] = useState(null);

  const handleSwarmCommand = async () => {
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
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 metallic-gold-icon" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>AGENT HUB</h1>
          <p className="text-xs text-muted-foreground">{AGENTS.length} autonomous agents · Digital Corporation</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">ALL SYSTEMS ONLINE</span>
        </div>
      </div>

      {/* Swarm Command */}
      <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-bold text-foreground">Swarm Orchestrator</span>
          <span className="text-[9px] text-muted-foreground">— Give a directive, agents execute</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={swarmCommand}
            onChange={(e) => setSwarmCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSwarmCommand()}
            placeholder="e.g. 'Build a 200-lead pipeline for Phoenix, Dallas, and Houston'"
            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={handleSwarmCommand}
            disabled={swarmRunning || !swarmCommand.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl metallic-gold-bg text-background text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {swarmRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {swarmRunning ? "Executing..." : "Execute"}
          </button>
        </div>
        {swarmResult && (
          <div className={cn("rounded-xl p-3 text-xs", swarmResult.error ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/5 border border-green-500/15")}>
            {swarmResult.error ? (
              <p className="text-destructive">{swarmResult.error}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-green-400 font-semibold">{swarmResult.message}</p>
                {swarmResult.agents && (
                  <div className="flex flex-wrap gap-1.5">
                    {swarmResult.agents.map((a) => (
                      <span key={a.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">{a.name}</span>
                    ))}
                  </div>
                )}
                {swarmResult.execution_results?.length > 0 && (
                  <pre className="text-[10px] text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                    {JSON.stringify(swarmResult.execution_results, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent Grid */}
      <div className="space-y-1.5">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}