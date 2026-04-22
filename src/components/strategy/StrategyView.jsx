import { useState } from "react";
import { Calendar, Target, Zap, CheckCircle2, Clock, TrendingUp, ChevronDown, ChevronUp, Loader2, Brain, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StrategyDayCard from "./StrategyDayCard";

const STRATEGY_PHASES = [
  { id: "week1", label: "Week 1: Foundation", color: "#d4af37", days: [1,2,3,4,5,6,7] },
  { id: "week2", label: "Week 2: Activation", color: "#22c55e", days: [8,9,10,11,12,13,14] },
  { id: "week3", label: "Week 3: Scale", color: "#3b82f6", days: [15,16,17,18,19,20,21] },
  { id: "week4", label: "Week 4: Optimize & Automate", color: "#8b5cf6", days: [22,23,24,25,26,27,28,29,30] },
];

const DAILY_PLAN = [
  { day: 1, title: "Fix Email Templates", desc: "Replace all raw text emails with branded HTML templates using AI", category: "Fix", priority: "critical", tools: ["InvokeLLM", "SendEmail"], automatable: true },
  { day: 2, title: "Data Quality Audit", desc: "Scan all Leads, Contractors, Jobs for missing/invalid fields. Auto-fix with AI.", category: "Fix", priority: "critical", tools: ["autoHealSystem", "InvokeLLM"], automatable: true },
  { day: 3, title: "Daily Briefing Automation", desc: "Set up 7am daily email with pipeline summary, priorities, callbacks due", category: "Launch", priority: "high", tools: ["Scheduled Automation", "InvokeLLM", "SendEmail"], automatable: true },
  { day: 4, title: "Lead Scoring Calibration", desc: "Re-score all leads using AI with current data. Update priorities.", category: "Optimize", priority: "high", tools: ["leadScorer", "InvokeLLM"], automatable: true },
  { day: 5, title: "Call Center Population", desc: "Funnel all Leads + Contractors + GCs + Jobs into Call Center with AI pitches", category: "Launch", priority: "critical", tools: ["CallLog", "InvokeLLM"], automatable: true },
  { day: 6, title: "Auto Follow-Up Chains", desc: "Set up 3-7-14-30 day follow-up automations for Callback/No Answer outcomes", category: "Launch", priority: "high", tools: ["Entity Automation", "SendEmail", "twilioMessenger"], automatable: true },
  { day: 7, title: "Week 1 Review", desc: "Analyze results: emails sent, calls made, response rates. Adjust strategy.", category: "Review", priority: "medium", tools: ["InvokeLLM", "Analytics"], automatable: false },

  { day: 8, title: "Stale Lead Re-engagement", desc: "Auto-contact leads not reached in 14+ days with personalized outreach", category: "Launch", priority: "high", tools: ["Lead entity", "sendOutreachEmail"], automatable: true },
  { day: 9, title: "HubSpot Sync", desc: "Enable bi-directional sync: Lead/Contractor → HubSpot → Lead/Contractor", category: "Launch", priority: "medium", tools: ["HubSpot connector", "hubspotSync"], automatable: true },
  { day: 10, title: "Bid Pipeline Auto-Monitor", desc: "Auto-alert for bids due within 7 days. Generate bid packages automatically.", category: "Launch", priority: "high", tools: ["CommercialJob", "generateBidPackage"], automatable: true },
  { day: 11, title: "SMS Campaign Launch", desc: "Auto-SMS new leads with intro + 7-day trial link within 5 min of ingestion", category: "Launch", priority: "high", tools: ["twilioMessenger", "Entity Automation"], automatable: true },
  { day: 12, title: "Contractor Nurture Sequence", desc: "Weekly automated intro packages to new contractors", category: "Launch", priority: "medium", tools: ["sendIntroPackage", "Scheduled Automation"], automatable: true },
  { day: 13, title: "AI Quality Gate", desc: "Route all outbound emails through AI quality check before sending", category: "Optimize", priority: "high", tools: ["InvokeLLM", "All email functions"], automatable: true },
  { day: 14, title: "Week 2 Review", desc: "Measure: leads contacted, response rate, deals pipeline, cost per lead", category: "Review", priority: "medium", tools: ["Analytics", "InvokeLLM"], automatable: false },

  { day: 15, title: "Overnight Scraper Activation", desc: "Nightly 2am scrape: competitors, permits, job boards → auto-create leads", category: "Launch", priority: "high", tools: ["universalScraper", "Scheduled Automation"], automatable: true },
  { day: 16, title: "Auto-Invoice on Close", desc: "When CallLog = Sold → auto-create Invoice → email to client", category: "Launch", priority: "high", tools: ["CallLog Automation", "Invoice", "SendEmail"], automatable: true },
  { day: 17, title: "Territory Intelligence", desc: "Analyze close rates by region → focus resources on top-performing territories", category: "Optimize", priority: "medium", tools: ["territoryAnalyzer", "InvokeLLM"], automatable: true },
  { day: 18, title: "Product-Market Matching", desc: "For each lead: analyze industry + products → auto-recommend XPS products", category: "Optimize", priority: "medium", tools: ["InvokeLLM", "KnowledgeBase"], automatable: true },
  { day: 19, title: "Multi-Agent Chain v1", desc: "Connect: Lead Gen → Research → Sales Director → Outreach agents in sequence", category: "Launch", priority: "high", tools: ["multiAgentCollaboration", "orchestratorEngine"], automatable: true },
  { day: 20, title: "Content Engine Kickoff", desc: "Weekly auto-generate 3 blog posts + 10 social posts from industry trends", category: "Launch", priority: "low", tools: ["webResearch", "InvokeLLM", "SocialPost"], automatable: true },
  { day: 21, title: "Week 3 Review", desc: "Full pipeline analysis, revenue forecast, cost optimization review", category: "Review", priority: "medium", tools: ["InvokeLLM", "All entities"], automatable: false },

  { day: 22, title: "Self-Healing Guardian", desc: "Every 6 hours: scan data quality → auto-fix → merge duplicates → log", category: "Launch", priority: "high", tools: ["systemGuardian", "Scheduled Automation"], automatable: true },
  { day: 23, title: "Revenue Forecasting", desc: "Weekly pipeline analysis → 30/60/90 day revenue predictions", category: "Launch", priority: "medium", tools: ["InvokeLLM", "All entity data"], automatable: true },
  { day: 24, title: "Competitive Price Intel", desc: "Monthly scrape competitor pricing → auto-adjust recommended deals", category: "Launch", priority: "medium", tools: ["competitorMonitor", "IntelRecord"], automatable: true },
  { day: 25, title: "Client Success Automation", desc: "Post-job: satisfaction survey → Google review request → 90-day check-in", category: "Launch", priority: "medium", tools: ["CommercialJob Automation", "SendEmail"], automatable: true },
  { day: 26, title: "Full P&L Dashboard", desc: "Track costs (SMS, emails, API) vs revenue → ROI per lead source", category: "Launch", priority: "medium", tools: ["CallLog", "Invoice", "Analytics"], automatable: true },
  { day: 27, title: "Cost Optimization Pass", desc: "Switch simple tasks to Groq free tier, batch LLM calls, cache AI responses", category: "Optimize", priority: "high", tools: ["Groq", "InvokeLLM caching"], automatable: false },
  { day: 28, title: "Full Orchestrator Launch", desc: "Enable CEO Orchestrator: autonomous business ops, agent coordination", category: "Launch", priority: "high", tools: ["orchestratorEngine", "All agents"], automatable: true },
  { day: 29, title: "Simulation & Validation", desc: "Run all workflows through simulation module → score → fix → harden", category: "Optimize", priority: "high", tools: ["Simulation Module", "InvokeLLM"], automatable: true },
  { day: 30, title: "Month 1 Complete Review", desc: "Full system audit: revenue generated, costs, automation coverage, next steps", category: "Review", priority: "critical", tools: ["InvokeLLM", "All data"], automatable: false },
];

export default function StrategyView() {
  const [expandedPhase, setExpandedPhase] = useState("week1");
  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xps-strategy-completed") || "[]"); } catch { return []; }
  });
  const [generating, setGenerating] = useState(false);
  const [customPlan, setCustomPlan] = useState(null);

  const toggleDay = (day) => {
    const updated = completedDays.includes(day) ? completedDays.filter(d => d !== day) : [...completedDays, day];
    setCompletedDays(updated);
    localStorage.setItem("xps-strategy-completed", JSON.stringify(updated));
  };

  const progress = Math.round((completedDays.length / 30) * 100);

  const generateCustomPlan = async () => {
    setGenerating(true);
    const [leads, jobs, contractors] = await Promise.all([
      base44.entities.Lead.list("-created_date", 10).catch(() => []),
      base44.entities.CommercialJob.list("-created_date", 10).catch(() => []),
      base44.entities.Contractor.list("-created_date", 10).catch(() => []),
    ]);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this XPS flooring business data, generate a custom 5-item priority list for THIS WEEK:
Leads: ${leads.length} (stages: ${[...new Set(leads.map(l => l.stage))].join(", ")})
Jobs: ${jobs.length} (phases: ${[...new Set(jobs.map(j => j.project_phase))].join(", ")})
Contractors: ${contractors.length}
Completed strategy days: ${completedDays.length}/30

What are the 5 most impactful things to do RIGHT NOW?`,
      response_json_schema: {
        type: "object",
        properties: {
          priorities: { type: "array", items: { type: "object", properties: { title: { type: "string" }, reason: { type: "string" }, impact: { type: "string" } } } },
        },
      },
    });
    setCustomPlan(res.priorities || []);
    setGenerating(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Target className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-black metallic-gold">30-Day Launch Strategy</h1>
            <p className="text-[11px] text-muted-foreground">Systematic path from current state → fully autonomous revenue engine</p>
          </div>
        </div>
        <button onClick={generateCustomPlan} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
          AI Priority Analysis
        </button>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Overall Progress</span>
          <span className="text-sm font-black text-primary">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div className="h-full metallic-gold-bg rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
          <span>{completedDays.length} of 30 days completed</span>
          <span>{DAILY_PLAN.filter(d => d.automatable && completedDays.includes(d.day)).length} automations launched</span>
        </div>
      </div>

      {/* AI Custom Priorities */}
      {customPlan && (
        <div className="glass-card rounded-xl p-4 border border-primary/20">
          <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2"><Brain className="w-3.5 h-3.5" /> AI Priority Analysis — This Week</h3>
          <div className="space-y-2">
            {customPlan.map((p, i) => (
              <div key={i} className="bg-primary/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full metallic-gold-bg flex items-center justify-center text-[9px] font-black text-background">{i + 1}</span>
                  <span className="text-[11px] font-bold text-foreground">{p.title}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 ml-7">{p.reason}</p>
                <p className="text-[9px] text-green-400 mt-0.5 ml-7">Impact: {p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase timeline */}
      {STRATEGY_PHASES.map(phase => {
        const phaseDays = DAILY_PLAN.filter(d => phase.days.includes(d.day));
        const phaseCompleted = phaseDays.filter(d => completedDays.includes(d.day)).length;
        const isExpanded = expandedPhase === phase.id;

        return (
          <div key={phase.id} className="glass-card rounded-xl overflow-hidden">
            <button onClick={() => setExpandedPhase(isExpanded ? null : phase.id)} className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                <span className="text-sm font-bold text-foreground">{phase.label}</span>
                <span className="text-[10px] text-muted-foreground">{phaseCompleted}/{phaseDays.length} complete</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(phaseCompleted / phaseDays.length) * 100}%`, backgroundColor: phase.color }} />
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {phaseDays.map(day => (
                  <StrategyDayCard key={day.day} day={day} completed={completedDays.includes(day.day)} onToggle={() => toggleDay(day.day)} phaseColor={phase.color} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}