import { useState, useEffect } from "react";
import { Mail, DollarSign, AlertCircle, CheckCircle2, Clock, ArrowRight, Loader2, Zap, ShieldCheck, TrendingUp, Users, FileText, ChevronRight, BarChart3, Bot, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import PipelineCharts from "../dashboard/PipelineCharts";

function HeroMetric({ icon: Icon, label, value, accent }) {
  return (
    <div className="shimmer-card flex flex-col items-center text-center p-5 rounded-xl cursor-default">
      <div className="shimmer-icon-container w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 shimmer-icon metallic-gold-icon" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold metallic-gold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-1">{label}</div>
    </div>
  );
}

function AttentionCard({ icon: Icon, label, phase, nav, onNavigate }) {
  return (
    <button
      onClick={() => nav && onNavigate?.(nav)}
      className="shimmer-card w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left group"
    >
      <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 shimmer-icon text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium">{label}</p>
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{phase}</span>
      </div>
      {nav && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />}
    </button>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick }) {
  return (
    <button onClick={onClick} className="shimmer-card flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left group">
      <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 shimmer-icon metallic-silver-icon" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
    </button>
  );
}

export default function CommandCenterView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [heroStats, setHeroStats] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
    ]);

    // Hero stats
    const activePipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const wonRevenue = leads.filter(l => l.stage === "Won").reduce((s, l) => s + (l.estimated_value || 0), 0);
    setHeroStats({
      leads: leads.length,
      pipeline: activePipeline,
      won: wonRevenue,
      proposals: proposals.length,
      emails: emails.length,
    });

    // Attention items
    const flagged = [];
    const unopened = proposals.filter(p => p.status === "Sent");
    if (unopened.length > 0) flagged.push({ icon: AlertCircle, label: `${unopened.length} proposal${unopened.length > 1 ? "s" : ""} sent but not yet viewed`, phase: "WIN WORK", nav: "win_work" });
    const newLeads = leads.filter(l => l.stage === "New");
    if (newLeads.length > 0) flagged.push({ icon: Mail, label: `${newLeads.length} new lead${newLeads.length > 1 ? "s" : ""} need contact`, phase: "FIND WORK", nav: "get_work" });
    const overdue = invoices.filter(i => i.status === "Overdue");
    if (overdue.length > 0) flagged.push({ icon: DollarSign, label: `${overdue.length} invoice${overdue.length > 1 ? "s" : ""} overdue`, phase: "GET PAID", nav: "get_paid" });
    const draftProposals = proposals.filter(p => p.status === "Draft");
    if (draftProposals.length > 0) flagged.push({ icon: Clock, label: `${draftProposals.length} draft proposal${draftProposals.length > 1 ? "s" : ""} need to be sent`, phase: "WIN WORK", nav: "win_work" });
    
    setActions(flagged);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
        </div>
        <span className="text-xs text-muted-foreground animate-pulse">Loading command center...</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section — matches Landing quality */}
      <div className="relative px-6 pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
              <ShieldCheck className="w-4 h-4 metallic-gold-icon" />
              <span className="text-xs font-semibold xps-silver-subtle-gold">COMMAND CENTER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="xps-gold-slow-shimmer">XPS Intelligence</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Your live operational dashboard — every metric, every action, one view.</p>
          </div>

          {/* Hero Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <HeroMetric icon={Users} label="Total Leads" value={heroStats.leads} />
            <HeroMetric icon={TrendingUp} label="Pipeline" value={`$${(heroStats.pipeline / 1000).toFixed(0)}K`} />
            <HeroMetric icon={DollarSign} label="Won" value={`$${(heroStats.won / 1000).toFixed(0)}K`} />
            <HeroMetric icon={FileText} label="Proposals" value={heroStats.proposals} />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-8 max-w-5xl mx-auto space-y-6">
        {/* Attention Items */}
        {actions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">Needs Attention</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">{actions.length}</span>
            </div>
            <div className="space-y-2">
              {actions.map((action, i) => (
                <AttentionCard key={i} {...action} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {actions.length === 0 && (
          <div className="shimmer-card flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
            <div className="shimmer-icon-container w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 shimmer-icon text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">All caught up</p>
              <p className="text-xs text-muted-foreground">No urgent items right now — great work.</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <QuickAction icon={Users} label="Find Leads" desc="AI-powered prospecting" onClick={() => onNavigate?.("find_work")} />
            <QuickAction icon={Mail} label="Send Outreach" desc="Email & SMS campaigns" onClick={() => onNavigate?.("get_work")} />
            <QuickAction icon={FileText} label="Create Proposal" desc="Generate in 60 seconds" onClick={() => onNavigate?.("win_work")} />
          </div>
        </div>

        {/* Charts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 metallic-gold-icon" />
            <h2 className="text-sm font-bold text-foreground">Analytics Overview</h2>
          </div>
          <PipelineCharts />
        </div>
      </div>
    </div>
  );
}