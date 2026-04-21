import { useState, useMemo } from "react";
import { BarChart3, Clock, Zap, AlertTriangle, DollarSign, ChevronDown, ChevronUp, Info, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * USAGE ESTIMATOR — Complete system audit of all integration credit consumers.
 * Covers: scheduled automations, on-demand functions, frontend tools, and agents.
 */

// ─── SCHEDULED AUTOMATIONS (the biggest consumers) ─────────────────────────
const SCHEDULED_ITEMS = [
  {
    name: "System Guardian",
    frequency: "Every 10 min",
    runsPerDay: 144,
    llmCallsPerRun: 1,
    model: "default (gpt-4o-mini)",
    webSearch: false,
    description: "Audits system health, diagnoses issues, auto-fixes failed jobs/workflows",
    functionName: "systemGuardian",
    category: "System",
    priority: "high",
  },
  {
    name: "Financial Sandbox — Hourly Trading",
    frequency: "Every 1 hr",
    runsPerDay: 24,
    llmCallsPerRun: 1,
    model: "gemini_3_flash",
    webSearch: true,
    description: "Simulates trades across 5 portfolio buckets using live market data",
    functionName: "financialSandbox",
    category: "Financial",
    priority: "high",
  },
  {
    name: "Orchestrator — Morning Ops (7 AM)",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 2,
    model: "default + default",
    webSearch: false,
    description: "CEO standup: system snapshot → strategic plan → execute up to 5 actions → human summary. Each action may cascade into sub-functions.",
    cascadeCallsPerRun: 3,
    functionName: "orchestratorEngine",
    category: "Orchestrator",
    priority: "medium",
  },
  {
    name: "Orchestrator — Midday Optimize (12 PM)",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 2,
    model: "default + default",
    webSearch: false,
    description: "Pipeline progress check, lead scoring, trigger outreach. Cascades into sub-functions.",
    cascadeCallsPerRun: 3,
    functionName: "orchestratorEngine",
    category: "Orchestrator",
    priority: "medium",
  },
  {
    name: "Orchestrator — Afternoon Outreach (3 PM)",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 2,
    model: "default + default",
    webSearch: false,
    description: "Send proposals, follow up bids, process leads. Cascades into sub-functions.",
    cascadeCallsPerRun: 3,
    functionName: "orchestratorEngine",
    category: "Orchestrator",
    priority: "medium",
  },
  {
    name: "Orchestrator — Evening Analysis (8 PM)",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 2,
    model: "default + default",
    webSearch: false,
    description: "Full analytics review, performance scoring, financial sandbox trading.",
    cascadeCallsPerRun: 3,
    functionName: "orchestratorEngine",
    category: "Orchestrator",
    priority: "medium",
  },
  {
    name: "Orchestrator — Overnight Maintenance (2 AM)",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 2,
    model: "default + default",
    webSearch: false,
    description: "System health audit, data cleanup, scraper scheduling, healing.",
    cascadeCallsPerRun: 3,
    functionName: "orchestratorEngine",
    category: "Orchestrator",
    priority: "medium",
  },
  {
    name: "Passive Intelligence — Daily 5 AM",
    frequency: "Daily",
    runsPerDay: 1,
    llmCallsPerRun: 14,
    model: "gemini_3_flash (x14)",
    webSearch: true,
    description: "Scrapes 14 sources (Bloomberg, Reuters, TechCrunch, etc.) — 1 LLM call per source with web search enabled.",
    functionName: "passiveIntelligence",
    category: "Intelligence",
    priority: "high",
  },
];

// ─── ON-DEMAND / MANUAL FUNCTIONS ──────────────────────────────────────────
const ON_DEMAND_ITEMS = [
  { name: "Multi-Agent Collaboration (collaborate)", llmCalls: "3-15+ per run", model: "gemini_3_flash", webSearch: true, description: "Plans phases → executes agents in parallel → self-corrects low quality → reflection. Each agent = 1 LLM call. Self-correction doubles it." },
  { name: "Multi-Agent Reflection (reflect)", llmCalls: "1", model: "default", webSearch: false, description: "Analyzes agent performance history, recommends improvements." },
  { name: "Multi-Agent Delegation (delegate)", llmCalls: "1", model: "default", webSearch: false, description: "Agent decides who to delegate to and creates sub-job." },
  { name: "Multi-Agent Self-Correct (self_correct)", llmCalls: "1", model: "gemini_3_flash", webSearch: true, description: "Re-executes failed job with error analysis." },
  { name: "Nightly Auto-Heal", llmCalls: "1", model: "default", webSearch: false, description: "Diagnoses + fixes + optimizes system. Called by orchestrator." },
  { name: "Hyper-Evolver", llmCalls: "2-5", model: "gemini_3_flash", webSearch: true, description: "Scrapes AI sites, optimizes prompts, upgrades tools." },
  { name: "Crypto Research Agent", llmCalls: "1-3", model: "gemini_3_flash", webSearch: true, description: "Deep crypto market research, pattern analysis, coin simulation." },
  { name: "Lead Scorer", llmCalls: "1 per lead", model: "default", webSearch: false, description: "AI-scores individual leads based on profile data." },
  { name: "Sentiment Analyst", llmCalls: "1 per lead", model: "default", webSearch: false, description: "Analyzes email/meeting sentiment for lead intent." },
  { name: "Deep Research", llmCalls: "1-3", model: "gemini_3_flash", webSearch: true, description: "Comprehensive web research on any topic." },
  { name: "Knowledge Scraper", llmCalls: "1 per URL", model: "default", webSearch: false, description: "Extracts + summarizes content from URLs." },
  { name: "Proposal Generator", llmCalls: "1-2", model: "default", webSearch: false, description: "Generates professional bid proposals from job data." },
  { name: "Competitor Monitor", llmCalls: "1 per competitor", model: "default", webSearch: false, description: "Scans competitor websites for changes." },
  { name: "Daily Agent Audit", llmCalls: "1", model: "default", webSearch: false, description: "Reviews all agent performance metrics." },
  { name: "Open Claw Engine", llmCalls: "1-3", model: "default or gemini_3_flash", webSearch: true, description: "Site clone, key harvest, shadow scrape." },
];

// ─── FRONTEND WORKSPACE TOOLS ──────────────────────────────────────────────
const FRONTEND_TOOLS = [
  { name: "Workspace — Proposal Writer", llmCalls: "1 per generate", model: "default", webSearch: false },
  { name: "Workspace — Web Scraper", llmCalls: "1 per scrape", model: "gemini_3_flash", webSearch: true },
  { name: "Workspace — AI Research", llmCalls: "1 per query", model: "gemini_3_flash", webSearch: true },
  { name: "Workspace — AI Assistant", llmCalls: "1 per message", model: "default", webSearch: false },
  { name: "Workspace — Email Tool", llmCalls: "0 (SendEmail)", model: "N/A", webSearch: false, note: "Uses SendEmail integration" },
  { name: "Chat Panel (Agent Conversations)", llmCalls: "1 per message", model: "default", webSearch: false },
  { name: "UI Builder", llmCalls: "1 per generate (via openClawEngine)", model: "default", webSearch: false },
];

// ─── CREDIT COST ESTIMATES ─────────────────────────────────────────────────
const CREDIT_COSTS = {
  "default": 1,
  "gpt-4o-mini": 1,
  "gemini_3_flash": 2,
  "gemini_3_flash_web": 3,
  "gemini_3_1_pro": 5,
  "claude_sonnet_4_6": 8,
  "claude_opus_4_6": 15,
};

function getEstimatedDailyCredits(item) {
  const baseCalls = item.llmCallsPerRun * item.runsPerDay;
  const cascadeCalls = (item.cascadeCallsPerRun || 0) * item.runsPerDay;
  const totalCalls = baseCalls + cascadeCalls;
  const costPerCall = item.webSearch ? 3 : (item.model?.includes("gemini") ? 2 : 1);
  return totalCalls * costPerCall;
}

export default function UsageEstimatorView() {
  const [expandedSection, setExpandedSection] = useState("scheduled");

  const dailyScheduledCredits = useMemo(() =>
    SCHEDULED_ITEMS.reduce((sum, item) => sum + getEstimatedDailyCredits(item), 0)
  , []);

  const dailyScheduledCalls = useMemo(() =>
    SCHEDULED_ITEMS.reduce((sum, item) => sum + (item.llmCallsPerRun * item.runsPerDay) + ((item.cascadeCallsPerRun || 0) * item.runsPerDay), 0)
  , []);

  const monthlyScheduledCredits = dailyScheduledCredits * 30;

  const topConsumers = useMemo(() =>
    [...SCHEDULED_ITEMS].sort((a, b) => getEstimatedDailyCredits(b) - getEstimatedDailyCredits(a))
  , []);

  const toggle = (section) => setExpandedSection(expandedSection === section ? null : section);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">System Usage Estimator</h2>
          <p className="text-xs text-muted-foreground">Complete audit of all integration credit consumers</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Zap} label="Daily LLM Calls" value={`~${dailyScheduledCalls}`} sub="Scheduled only" color="#d4af37" />
        <SummaryCard icon={DollarSign} label="Est. Daily Credits" value={`~${dailyScheduledCredits}`} sub="Scheduled automations" color="#22c55e" />
        <SummaryCard icon={TrendingUp} label="Est. Monthly Credits" value={`~${monthlyScheduledCredits.toLocaleString()}`} sub="Scheduled only" color="#6366f1" />
        <SummaryCard icon={AlertTriangle} label="Biggest Consumer" value="Guardian" sub="144 runs/day" color="#ef4444" />
      </div>

      {/* Top Consumers Ranking */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" /> Top Credit Consumers (Daily)
        </h3>
        <div className="space-y-2">
          {topConsumers.slice(0, 5).map((item, i) => {
            const credits = getEstimatedDailyCredits(item);
            const pct = Math.round((credits / dailyScheduledCredits) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{item.name}</span>
                    <span className="text-xs font-bold text-primary">~{credits} credits/day</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 mt-1">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Automations */}
      <CollapsibleSection
        title="Scheduled Automations (Always Running)"
        subtitle={`${SCHEDULED_ITEMS.length} automations • ~${dailyScheduledCalls} LLM calls/day`}
        icon={Clock}
        expanded={expandedSection === "scheduled"}
        onToggle={() => toggle("scheduled")}
        badge="BIGGEST COST"
        badgeColor="destructive"
      >
        <div className="space-y-2">
          {SCHEDULED_ITEMS.map((item, i) => (
            <AutomationRow key={i} item={item} />
          ))}
        </div>
      </CollapsibleSection>

      {/* On-Demand Functions */}
      <CollapsibleSection
        title="On-Demand Backend Functions"
        subtitle={`${ON_DEMAND_ITEMS.length} functions • triggered manually or by orchestrator`}
        icon={Zap}
        expanded={expandedSection === "ondemand"}
        onToggle={() => toggle("ondemand")}
        badge="VARIABLE"
        badgeColor="secondary"
      >
        <div className="space-y-2">
          {ON_DEMAND_ITEMS.map((item, i) => (
            <OnDemandRow key={i} item={item} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Frontend Tools */}
      <CollapsibleSection
        title="Frontend Workspace Tools"
        subtitle={`${FRONTEND_TOOLS.length} tools • triggered by user interaction`}
        icon={Info}
        expanded={expandedSection === "frontend"}
        onToggle={() => toggle("frontend")}
        badge="USER-DRIVEN"
        badgeColor="outline"
      >
        <div className="space-y-2">
          {FRONTEND_TOOLS.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
              <div className="flex-1">
                <span className="text-xs font-medium text-white">{item.name}</span>
                {item.note && <span className="text-[10px] text-muted-foreground ml-2">({item.note})</span>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{item.model}</Badge>
                {item.webSearch && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-0">Web</Badge>}
                <span className="text-[10px] text-muted-foreground">{item.llmCalls}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Non-LLM Integrations */}
      <CollapsibleSection
        title="Non-LLM Integrations"
        subtitle="These use credits but aren't LLM calls"
        icon={DollarSign}
        expanded={expandedSection === "nonllm"}
        onToggle={() => toggle("nonllm")}
      >
        <div className="space-y-1.5 text-xs text-muted-foreground px-3">
          <p><span className="text-white font-medium">SendEmail</span> — Used by email tool, outreach automation, bid follow-ups, admin notifications, access invites</p>
          <p><span className="text-white font-medium">GenerateImage</span> — Media Hub, brand asset generation, AI image studio</p>
          <p><span className="text-white font-medium">UploadFile</span> — Blueprint takeoff, knowledge uploads, file attachments</p>
          <p><span className="text-white font-medium">ExtractDataFromUploadedFile</span> — PDF plan extraction, data import processing</p>
        </div>
      </CollapsibleSection>

      {/* Savings Recommendations */}
      <div className="glass-card rounded-xl p-4 border border-primary/20">
        <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" /> Cost Reduction Opportunities
        </h3>
        <div className="space-y-2 text-xs">
          <Recommendation
            title="System Guardian: 10 min → 30 min"
            savings="~288 credits/day saved"
            impact="Low — most fixes happen within first pass"
            pct={66}
          />
          <Recommendation
            title="Financial Sandbox: Hourly → Every 4 hours"
            savings="~126 credits/day saved"
            impact="Medium — fewer trade simulations but still 6x/day"
            pct={75}
          />
          <Recommendation
            title="Passive Intelligence: Switch to Groq"
            savings="~42 credits/day saved"
            impact="High — loses web search but can use Groq for summaries"
            pct={100}
          />
          <Recommendation
            title="Orchestrator cascades: Cap at 2 sub-functions"
            savings="~15 credits/day saved"
            impact="Low — most cycles only use 1-2 sub-calls anyway"
            pct={33}
          />
          <Recommendation
            title="Switch simple LLM calls to Groq API"
            savings="~180+ credits/day saved"
            impact="Medium — requires backend function updates, loses some features"
            pct={40}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-extrabold text-white">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function CollapsibleSection({ title, subtitle, icon: Icon, expanded, onToggle, badge, badgeColor, children }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{title}</span>
            {badge && <Badge variant={badgeColor} className="text-[8px]">{badge}</Badge>}
          </div>
          <span className="text-[10px] text-muted-foreground">{subtitle}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && <div className="px-4 pb-4 border-t border-border pt-3">{children}</div>}
    </div>
  );
}

function AutomationRow({ item }) {
  const credits = getEstimatedDailyCredits(item);
  return (
    <div className="rounded-lg bg-white/[0.03] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white">{item.name}</span>
        <span className="text-xs font-bold text-primary">~{credits} credits/day</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">{item.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[9px]">{item.frequency}</Badge>
        <Badge variant="outline" className="text-[9px]">{item.runsPerDay} runs/day</Badge>
        <Badge variant="outline" className="text-[9px]">{item.llmCallsPerRun} LLM/run</Badge>
        <Badge variant="secondary" className="text-[9px]">{item.model}</Badge>
        {item.webSearch && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-0">Web Search</Badge>}
        {item.cascadeCallsPerRun > 0 && <Badge className="text-[9px] bg-orange-500/20 text-orange-400 border-0">+{item.cascadeCallsPerRun} cascades</Badge>}
      </div>
    </div>
  );
}

function OnDemandRow({ item }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-white">{item.name}</span>
        <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        <Badge variant="outline" className="text-[9px]">{item.llmCalls} calls</Badge>
        <Badge variant="secondary" className="text-[9px]">{item.model}</Badge>
        {item.webSearch && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-0">Web</Badge>}
      </div>
    </div>
  );
}

function Recommendation({ title, savings, impact, pct }) {
  return (
    <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white">{title}</span>
        <Badge className="text-[9px] bg-green-500/20 text-green-400 border-0">{savings}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-green-500/50" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground">{impact}</span>
      </div>
    </div>
  );
}