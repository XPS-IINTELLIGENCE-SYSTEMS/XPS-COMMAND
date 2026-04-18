import { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, Users, Zap, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, Settings, Compass, CalendarClock, Brain, Search, Mail, Map, Database, Shield, BookOpen, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const SYSTEM_MODULES = [
  { id: "find_work", label: "Vision Cortex", desc: "Strategic intelligence", icon: Eye, nav: "find_work" },
  { id: "xpress_leads", label: "Prospects", desc: "Lead pipeline", icon: Users, nav: "xpress_leads" },
  { id: "crm", label: "AI Find", desc: "Discovery engine", icon: Zap, nav: "crm" },
  { id: "job_leads", label: "Staging Queue", desc: "Lead qualification", icon: Database, nav: "job_leads" },
  { id: "get_work", label: "Email Center", desc: "Outreach platform", icon: Mail, nav: "get_work" },
  { id: "follow_up", label: "Prospect Map", desc: "Geographic intel", icon: Map, nav: "follow_up" },
  { id: "win_work", label: "Oracle Engine", desc: "Deep extraction", icon: Zap, nav: "win_work" },
  { id: "analytics", label: "Analytics", desc: "Performance tracking", icon: BarChart3, nav: "analytics" },
  { id: "knowledge", label: "Knowledge Base", desc: "Intel repository", icon: BookOpen, nav: "knowledge" },
  { id: "agents", label: "Agent Fleet", desc: "AI agent command", icon: Bot, nav: "agents" },
  { id: "task_scheduler", label: "Task Scheduler", desc: "Scraper control", icon: CalendarClock, nav: "task_scheduler" },
  { id: "settings", label: "Settings", desc: "System config", icon: Settings, nav: "settings" },
];

const QUICK_ACTIONS = [
  { label: "Find Prospects", icon: Target, nav: "find_work", color: "#d4af37" },
  { label: "Compose Email", icon: Mail, nav: "get_work", color: "#6366f1" },
  { label: "View Queue", icon: Database, nav: "job_leads", color: "#22c55e" },
  { label: "Run Scraper", icon: Zap, nav: "task_scheduler", color: "#ef4444" },
];

export default function DashboardView({ onNavigate }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
    ]);
    setD({ leads, proposals, invoices });
    setLoading(false);
  };

  const nav = useCallback((v) => { if (onNavigate) onNavigate(v); }, [onNavigate]);

  if (loading || !d) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const { leads, proposals, invoices } = d;
  const activeProspects = leads.filter(l => ["Incoming", "Validated", "Qualified", "Prioritized"].includes(l.pipeline_status)).length;
  const qualifiedLeads = leads.filter(l => l.stage === "Qualified" || l.stage === "Prioritized").length;
  const activeCampaigns = leads.filter(l => ["Contacted", "Proposal", "Negotiation"].includes(l.stage)).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">XPS Intelligence System — Control Plane</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Active Prospects" value={activeProspects} color="#d4af37" onClick={() => nav("xpress_leads")} />
          <StatCard label="Qualified Leads" value={qualifiedLeads} color="#22c55e" onClick={() => nav("crm")} />
          <StatCard label="Active Campaigns" value={activeCampaigns} color="#6366f1" onClick={() => nav("get_work")} />
        </div>

        {/* System Modules */}
        <div className="mb-10">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-5">System Modules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SYSTEM_MODULES.map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => nav(mod.nav)}
                  className="group rounded-xl p-5 text-left transition-all duration-200 bg-card border border-border hover:border-primary/30 hover:bg-card/80 cursor-pointer"
                >
                  <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <div className="text-sm font-bold text-foreground">{mod.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{mod.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={() => nav(action.nav)}
                  className="gap-2 rounded-full px-5 py-2 text-sm font-semibold border-border hover:border-primary/40 transition-all"
                >
                  <Icon className="w-4 h-4" style={{ color: action.color }} />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-5 text-left transition-all bg-card border border-border hover:border-primary/30 cursor-pointer"
    >
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-extrabold" style={{ color }}>{value}</div>
    </button>
  );
}