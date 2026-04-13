import { useState, useEffect } from "react";
import { Loader2, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, Settings, Shield, Compass, CalendarClock, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const WORKFLOW_CARDS = [
  { id: "command", label: "Dashboard", desc: "Pipeline & metrics", icon: BarChart3, nav: "command" },
  { id: "crm", label: "CRM Board", desc: "Manage every deal", icon: Users, nav: "crm" },
  { id: "start_here", label: "Start Here", desc: "Get set up in minutes", icon: Compass, nav: "start_here" },
  { id: "find_work", label: "Discovery", desc: "Signal-based prospecting", icon: Search, nav: "find_work" },
  { id: "xpress_leads", label: "XPress Pipeline", desc: "Contractor & operator leads", icon: Package, nav: "xpress_leads" },
  { id: "job_leads", label: "Jobs Pipeline", desc: "End-buyer project leads", icon: Hammer, nav: "job_leads" },
  { id: "get_work", label: "Contact", desc: "Outreach & comms", icon: Phone, nav: "get_work" },
  { id: "follow_up", label: "Follow-Up", desc: "Sequences & reminders", icon: Clock, nav: "follow_up" },
  { id: "win_work", label: "Close", desc: "Proposals & closing", icon: Trophy, nav: "win_work" },
  { id: "do_work", label: "Execute", desc: "Jobs & execution", icon: HardHat, nav: "do_work" },
  { id: "get_paid", label: "Collect", desc: "Invoice & collect", icon: DollarSign, nav: "get_paid" },
  { id: "analytics", label: "Analytics", desc: "Charts & revenue", icon: BarChart3, nav: "analytics" },
  { id: "tips", label: "Tips & Tricks", desc: "Pro knowledge", icon: Lightbulb, nav: "tips" },
  { id: "agents", label: "Agents", desc: "AI agent command", icon: Bot, nav: "agents" },
  { id: "task_scheduler", label: "Task Scheduler", desc: "Scraper control center", icon: CalendarClock, nav: "task_scheduler" },
  { id: "settings", label: "Settings", desc: "Account & preferences", icon: Settings, nav: "settings" },
];

export default function DashboardView({ onNavigate }) {
  const [d, setD] = useState(null);
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
    ]);
    setD({ leads, proposals, invoices, emails });
    setLoading(false);
    genTips(leads, proposals, invoices);
  };

  const genTips = async (leads, proposals, invoices) => {
    const r = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI coach for XPS (epoxy/concrete polishing). Give 3 sharp tips based on: ${leads.length} leads, ${proposals.filter(p=>p.status==="Approved").length} won, ${invoices.filter(i=>i.status==="Overdue").length} overdue invoices. Under 15 words each.`,
      response_json_schema: { type: "object", properties: { tips: { type: "array", items: { type: "string" } } } }
    });
    setTips(r.tips || []);
  };

  if (loading || !d) return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const { leads, proposals, invoices, emails } = d;
  const xp = leads.filter(l => l.lead_type === "XPress");
  const jobs = leads.filter(l => l.lead_type === "Jobs");
  const won = proposals.filter(p => p.status === "Approved");
  const paid = invoices.filter(i => i.status === "Paid");
  const overdue = invoices.filter(i => i.status === "Overdue");
  const values = leads.map(l => l.estimated_value || 0).filter(v => v > 0);
  const totalPipeline = values.reduce((s,v)=>s+v, 0);
  const wonValue = won.reduce((s,p)=>s+(p.total_value||0),0);
  const paidValue = paid.reduce((s,i)=>s+(i.total||0),0);
  const winRate = proposals.length ? Math.round((won.length / proposals.length) * 100) : 0;
  const predicted = Math.round(totalPipeline * (winRate / 100));

  const nav = (v) => { if (onNavigate) onNavigate(v); };

  // Dynamic stat map for cards
  const statMap = {
    command: `$${(totalPipeline/1000).toFixed(0)}k pipeline`,
    crm: `${leads.length} leads`,
    start_here: "5 steps",
    find_work: `${leads.filter(l=>l.pipeline_status==="Incoming").length} incoming`,
    xpress_leads: `${xp.length} leads`,
    job_leads: `${jobs.length} leads`,
    get_work: `${emails.filter(e=>e.status==="Sent").length} sent`,
    follow_up: `${leads.filter(l=>l.stage==="Contacted").length} awaiting`,
    win_work: `${winRate}% win rate`,
    do_work: `${leads.filter(l=>l.stage==="Won").length} active`,
    get_paid: `$${(paidValue/1000).toFixed(0)}k collected`,
    analytics: `$${((wonValue+paidValue)/1000).toFixed(0)}k revenue`,
    tips: "Pro tips",
    agents: "4 agents",
    task_scheduler: "Scrapers",
    settings: "Preferences",
    admin: "Operator tools",
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="relative z-10 p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              COMMAND CENTER
            </h1>
            <p className="text-base text-muted-foreground mt-1">Every card is actionable — tap to navigate</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <GlassPill label="Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}k`} onClick={() => nav("analytics")} />
            <GlassPill label="Predicted" value={`$${(predicted/1000).toFixed(0)}k`} onClick={() => nav("analytics")} />
            <GlassPill label="Win Rate" value={`${winRate}%`} onClick={() => nav("win_work")} />
          </div>
        </div>

        {/* TOP METRICS — clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricTile label="Total Leads" value={leads.length} sub={`${xp.length} XPress · ${jobs.length} Jobs`} onClick={() => nav("crm")} />
          <MetricTile label="Won Revenue" value={`$${(wonValue/1000).toFixed(0)}k`} sub={`${won.length} deals closed`} onClick={() => nav("win_work")} />
          <MetricTile label="Active Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}k`} sub={`${leads.filter(l=>l.stage==="Proposal"||l.stage==="Negotiation").length} in proposal`} onClick={() => nav("xpress_leads")} />
          <MetricTile label="Collected" value={`$${(paidValue/1000).toFixed(0)}k`} sub={`${overdue.length} overdue`} onClick={() => nav("get_paid")} />
        </div>

        {/* WORKFLOW CARDS GRID — evenly distributed */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold metallic-silver tracking-tight mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>WORKFLOW</h2>
          <p className="text-sm text-muted-foreground mb-4">Tap any card to jump into that workflow</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {WORKFLOW_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => nav(card.nav)}
                className="shimmer-card group rounded-2xl p-5 text-left transition-all duration-300 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] active:scale-[0.97]"
              >
                <div className="shimmer-icon-container w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 transition-all duration-300">
                  <Icon className="w-5 h-5 shimmer-icon metallic-gold-icon" />
                </div>
                <div className="text-sm font-bold text-foreground mb-0.5">{card.label}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{card.desc}</div>
                {statMap[card.id] && (
                  <div className="mt-2 text-xs font-semibold text-primary/80">{statMap[card.id]}</div>
                )}
              </button>
            );
          })}
        </div>

        {/* AI TIPS — clickable */}
        <button
          onClick={() => nav("tips")}
          className="w-full text-left rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border hover:border-white/[0.25] transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">AI TIPS</span>
            <span className="text-sm text-muted-foreground ml-auto">View All →</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips ? tips.map((t, i) => (
              <div key={i} className={cn(
                "rounded-xl p-5 text-sm font-medium text-foreground/90 animated-silver-border",
                i % 2 === 0 ? "bg-black/40 border border-white/[0.08]" : "bg-white/[0.05] border border-white/[0.12]"
              )}>
                <Lightbulb className="w-4 h-4 text-primary mb-2" />
                {t}
              </div>
            )) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />Generating...
              </div>
            )}
          </div>
        </button>

      </div>
    </div>
  );
}

/* ===== METRIC TILE ===== */
function MetricTile({ label, value, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-5 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.10] animated-silver-border text-center cursor-pointer hover:border-white/[0.25] transition-all duration-300 active:scale-[0.97] w-full"
    >
      <div className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</div>
      <div className="text-sm font-bold text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </button>
  );
}

/* ===== GLASS PILL ===== */
function GlassPill({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-6 py-4 text-center min-w-[120px] bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] animated-silver-border cursor-pointer hover:border-white/[0.25] transition-all duration-300 active:scale-[0.97]"
    >
      <div className="text-2xl font-extrabold text-primary">{value}</div>
      <div className="text-xs font-bold text-muted-foreground mt-1">{label}</div>
    </button>
  );
}