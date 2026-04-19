import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Users, Briefcase, Building2, Search, Mail, FileText, BarChart3,
  BookOpen, Swords, Link2, Shield, Settings, Bot, Loader2,
  TrendingUp, DollarSign, Target, Send, Clock, GitBranch,
  Upload, Database, Sprout, Sliders, Share2, Globe
} from "lucide-react";
import HexPatternBanner from "../shared/HexPatternBanner";

const TOOL_BUTTONS = [
  { id: "xpress_leads", label: "Leads", desc: "Lead intelligence & pipeline", icon: Users, color: "#d4af37" },
  { id: "crm", label: "CRM", desc: "Contacts & deals", icon: Target, color: "#6366f1" },
  { id: "data_bank", label: "Data Bank", desc: "All leads — import, export, share", icon: Database, color: "#06b6d4" },
  { id: "find_jobs", label: "Find Jobs", desc: "Commercial project discovery", icon: Briefcase, color: "#22c55e" },
  { id: "find_companies", label: "Find Companies", desc: "AI company scraper", icon: Building2, color: "#f59e0b" },
  { id: "scrape_social", label: "Scrape Social", desc: "Social media intelligence", icon: Share2, color: "#ec4899" },
  { id: "scrape_trends", label: "Scrape Trends", desc: "Trends, consensus, economics", icon: Globe, color: "#8b5cf6" },
  { id: "research", label: "Research Lab", desc: "Deep web research", icon: Search, color: "#8b5cf6" },
  { id: "get_work", label: "Outreach", desc: "Email & SMS campaigns", icon: Send, color: "#ec4899" },
  { id: "win_work", label: "Proposals", desc: "AI proposal engine", icon: FileText, color: "#14b8a6" },
  { id: "analytics", label: "Analytics", desc: "Performance & pipeline", icon: BarChart3, color: "#f97316" },
  { id: "knowledge", label: "Knowledge Base", desc: "Company & industry intel", icon: BookOpen, color: "#06b6d4" },
  { id: "knowledge_upload", label: "Upload Knowledge", desc: "Feed intel into the system", icon: Upload, color: "#10b981" },
  { id: "seeds_sources", label: "Seeds & Sources", desc: "Lead sources & seed lists", icon: Sprout, color: "#84cc16" },
  { id: "competition", label: "Competition", desc: "Competitor monitoring", icon: Swords, color: "#ef4444" },
  { id: "competitor_comparison", label: "Compare vs.", desc: "Head-to-head price & product analysis", icon: Swords, color: "#f43f5e" },
  { id: "algorithm", label: "Algorithm Tuning", desc: "Fine-tune scoring & AI", icon: Sliders, color: "#f59e0b" },
  { id: "media_hub", label: "Media Hub", desc: "Video, images, branding, social, AI voice", icon: Share2, color: "#ec4899" },
  { id: "bid_center", label: "Bid Center", desc: "Gov & commercial bidding system", icon: Briefcase, color: "#ef4444" },
  { id: "connectors", label: "Connectors", desc: "Integrations & APIs", icon: Link2, color: "#84cc16" },
  { id: "scheduler", label: "Scheduler", desc: "Schedule automated scraping", icon: Clock, color: "#0ea5e9" },
  { id: "workflows", label: "Workflows", desc: "Drag & drop automation builder", icon: GitBranch, color: "#f43f5e" },
  { id: "admin", label: "Admin Control", desc: "Users, keys & promo codes", icon: Shield, color: "#a855f7" },
  { id: "settings", label: "Settings", desc: "Account & preferences", icon: Settings, color: "#64748b" },
  { id: "agent_knowledge", label: "Agent Knowledge", desc: "Upload docs & URLs to agents", icon: Upload, color: "#10b981" },
  { id: "agent_skills", label: "Skills Library", desc: "All agent capabilities", icon: Bot, color: "#8b5cf6" },
  { id: "ai_assistant", label: "AI Assistant", desc: "Chat-driven commands", icon: Bot, color: "#d4af37" },
];

export default function DashboardHub({ onOpenTool }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [leads, proposals, invoices, me] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.auth.me().catch(() => null),
    ]);

    const active = leads.filter(l => !["Won", "Lost"].includes(l.stage)).length;
    const pipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const proposalsSent = proposals.filter(p => ["Sent", "Viewed"].includes(p.status)).length;
    const closeRate = leads.length > 0
      ? Math.round((leads.filter(l => l.stage === "Won").length / Math.max(leads.filter(l => ["Won", "Lost"].includes(l.stage)).length, 1)) * 100 * 10) / 10
      : 0;

    setStats({ active, pipeline, proposalsSent, closeRate });
    setUser(me);
    setLoading(false);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="max-w-[1100px] mx-auto">
      <HexPatternBanner />
      <div className="px-6 pb-8 -mt-4">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your sales intelligence briefing for today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Active Leads" value={stats.active} change="+12.4%" positive />
          <StatCard icon={DollarSign} label="Pipeline Value" value={`$${(stats.pipeline / 1000000).toFixed(1)}M`} change="+8.7%" positive />
          <StatCard icon={FileText} label="Proposals Sent" value={stats.proposalsSent} change="+23.1%" positive />
          <StatCard icon={TrendingUp} label="Close Rate" value={`${stats.closeRate}%`} change="-1.3%" positive={false} />
        </div>
      )}

      {/* Tool Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {TOOL_BUTTONS.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              className="group glass-card rounded-xl p-4 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors"
                style={{ backgroundColor: `${tool.color}15` }}
              >
                <Icon className="w-5 h-5 transition-colors" style={{ color: tool.color }} />
              </div>
              <div className="text-sm font-bold text-foreground">{tool.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{tool.desc}</div>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className="rounded-xl p-4 glass-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-foreground">{value}</div>
      <div className={`text-xs font-medium mt-1 ${positive ? "text-green-400" : "text-red-400"}`}>
        ↗ {change} <span className="text-muted-foreground font-normal">vs last month</span>
      </div>
    </div>
  );
}