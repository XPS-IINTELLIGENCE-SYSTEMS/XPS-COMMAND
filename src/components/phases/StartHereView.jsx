import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle2, Loader2, ShieldCheck, UserCircle, Link2, Search, Package, Phone, Clock, FileText, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, CalendarClock, Bot, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { getIconColor } from "@/lib/iconColors";
import useColorRefresh from "@/hooks/useColorRefresh";

const WORKFLOW_STEPS = [
  {
    group: "Get Set Up",
    groupDesc: "Foundation — configure your system before anything else",
    steps: [
      { num: 1, id: "setup", title: "Set Up Your System", desc: "Configure your profile, company info, and preferences", icon: UserCircle, nav: "settings", color: "#8b9dc3" },
      { num: 2, id: "connect", title: "Connect Your Tools", desc: "Link Gmail, Calendar, Drive, HubSpot, and other integrations", icon: Link2, nav: "settings", color: "#50c878" },
    ],
  },
  {
    group: "Find & Build Your Pipeline",
    groupDesc: "Discover prospects and fill your pipeline with quality leads",
    steps: [
      { num: 3, id: "discover", title: "Get Leads Now", desc: "Use AI-powered search and scrapers to find qualified prospects", icon: Search, nav: "find_work", color: "#7ec8e3" },
      { num: 4, id: "xpress", title: "Track Your Leads", desc: "Monitor your XPress and Jobs pipelines as leads come in", icon: Package, nav: "xpress_leads", color: "#d4af37" },
    ],
  },
  {
    group: "Reach Out & Follow Up",
    groupDesc: "Engage your prospects with personalized outreach",
    steps: [
      { num: 5, id: "contact", title: "Reach Out to Leads", desc: "Send emails, SMS, or make calls with AI-generated scripts", icon: Phone, nav: "get_work", color: "#c06c84" },
      { num: 6, id: "followup", title: "Follow Up with Leads", desc: "Automated sequences and smart reminders so no lead is forgotten", icon: Clock, nav: "follow_up", color: "#f8b400" },
    ],
  },
  {
    group: "Close & Execute",
    groupDesc: "Turn prospects into paying customers and deliver results",
    steps: [
      { num: 7, id: "proposal", title: "Generate Proposals", desc: "Create professional quotes with AI in under 60 seconds", icon: FileText, nav: "win_work", color: "#50c878" },
      { num: 8, id: "close", title: "Close Deals", desc: "Negotiate, finalize, and win the work", icon: Trophy, nav: "win_work", color: "#d4af37" },
      { num: 9, id: "execute", title: "Execute Jobs", desc: "Manage active projects from start to finish", icon: HardHat, nav: "do_work", color: "#e67e22" },
    ],
  },
  {
    group: "Track & Grow",
    groupDesc: "Measure performance and get smarter every day",
    steps: [
      { num: 10, id: "collect", title: "Track & Analyze", desc: "See analytics, revenue trends, and pipeline health", icon: BarChart3, nav: "analytics", color: "#7ec8e3" },
      { num: 11, id: "tips", title: "Get Expert Advice", desc: "Pro tips, best practices, and industry knowledge", icon: Lightbulb, nav: "tips", color: "#f0e68c" },
    ],
  },
  {
    group: "Automate & Customize",
    groupDesc: "Let AI and automation handle the heavy lifting",
    steps: [
      { num: 12, id: "scheduler", title: "Schedule Scrapers & AI", desc: "Set up recurring tasks, scrapers, and automated workflows", icon: CalendarClock, nav: "task_scheduler", color: "#8b9dc3" },
      { num: 13, id: "agents", title: "Command AI to Work", desc: "Deploy AI agents for research, outreach, and closing", icon: Bot, nav: "agents", color: "#c06c84" },
      { num: 14, id: "settings_adv", title: "Change Settings", desc: "Customize your experience, integrations, and preferences", icon: Settings, nav: "settings", color: "#50c878" },
      { num: 15, id: "admin", title: "Use Advanced Admin", desc: "Operator-level tools, system health, and data management", icon: Shield, nav: "admin", color: "#d4af37" },
    ],
  },
];

export default function StartHereView({ onNavigate }) {
  const [done, setDone] = useState({});
  const [loading, setLoading] = useState(true);
  useColorRefresh();

  useEffect(() => { checkProgress(); }, []);

  const checkProgress = async () => {
    setLoading(true);
    const [leads, emails, proposals, user] = await Promise.all([
      base44.entities.Lead.list("-created_date", 1),
      base44.entities.OutreachEmail.list("-created_date", 1),
      base44.entities.Proposal.list("-created_date", 1),
      base44.auth.me(),
    ]);
    setDone({
      setup: !!user?.full_name,
      connect: false,
      discover: leads.length > 0,
      xpress: leads.length > 0,
      contact: emails.length > 0,
      followup: emails.length > 0,
      proposal: proposals.length > 0,
      close: proposals.some(p => p.status === "Approved"),
      execute: false,
      collect: false,
      tips: false,
      scheduler: false,
      agents: false,
      settings_adv: !!user?.full_name,
      admin: false,
    });
    setLoading(false);
  };

  const totalSteps = WORKFLOW_STEPS.reduce((s, g) => s + g.steps.length, 0);
  const completedCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative px-6 pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <ShieldCheck className="w-4 h-4 metallic-gold-icon" />
            <span className="text-xs font-semibold xps-silver-subtle-gold">YOUR COMPLETE WORKFLOW</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="xps-gold-slow-shimmer">START HERE</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Your step-by-step guide to the entire XPS workflow. Click any step to jump in.
          </p>

          {!loading && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-2.5 w-64 rounded-full bg-secondary overflow-hidden">
                <div className="h-full metallic-gold-bg rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedCount / totalSteps) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-primary">{completedCount}/{totalSteps}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grouped Steps */}
      <div className="px-4 md:px-6 pb-10 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Checking your progress...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {WORKFLOW_STEPS.map((group, gIdx) => (
              <div key={gIdx}>
                {/* Group heading */}
                <div className="text-center mb-4">
                  <h2 className="text-base md:text-lg font-extrabold xps-gold-slow-shimmer tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {group.group}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{group.groupDesc}</p>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {group.steps.map((step) => {
                    const StepIcon = step.icon;
                    const isDone = done[step.id];
                    const iconColor = getIconColor(step.id) || step.color;
                    return (
                      <button
                        key={step.id}
                        onClick={() => onNavigate && onNavigate(step.nav)}
                        className={cn(
                          "shimmer-card w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group",
                          isDone ? "glass-card border-primary/30" : "glass-card"
                        )}
                      >
                        <div className={cn(
                          "shimmer-icon-container w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                          isDone ? "bg-primary/15" : "bg-secondary"
                        )}>
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <StepIcon className="w-5 h-5 shimmer-icon" style={{ color: iconColor }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-primary/70">{String(step.num).padStart(2, '0')}</span>
                            <span className={cn("text-sm font-semibold", isDone ? "text-primary" : "text-foreground")}>{step.title}</span>
                            {isDone && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">DONE</span>}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}