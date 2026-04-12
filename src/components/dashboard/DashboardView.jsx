import { Phone, Mail, Sparkles, ArrowUpRight, ChevronRight, Clock, TrendingUp, Zap, Target, DollarSign, Users, Flame, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const hotLeads = [];

const revenueData = [
  { month: "Oct", value: 0 }, { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
  { month: "Jan", value: 0 }, { month: "Feb", value: 0 }, { month: "Mar", value: 0 },
];

const stats = [
  { label: "Pipeline", value: "$0", sub: "No data yet", icon: DollarSign },
  { label: "Hot Leads", value: "0", sub: "Add leads to get started", icon: Flame },
  { label: "Close Rate", value: "0%", sub: "No deals yet", icon: Target },
  { label: "Avg Deal", value: "$0", sub: "No deals yet", icon: TrendingUp },
];

const quickActions = [
  { label: "New Lead", icon: Users, desc: "Add a prospect" },
  { label: "AI Proposal", icon: Sparkles, desc: "Generate instantly" },
  { label: "Send Outreach", icon: Mail, desc: "Email or SMS" },
  { label: "Web Research", icon: Zap, desc: "Scrape & analyze" },
];

export default function DashboardView() {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto h-full">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66ZM28 100L0 84L0 50L28 34L56 50L56 84L28 100Z' fill='none' stroke='rgba(212,175,55,0.5)' stroke-width='0.8'/%3E%3C/svg%3E\")", backgroundSize: '56px 100px'}} />
        <div className="relative z-[1]">
          <div className="flex items-center gap-3 mb-3">
            <div className="shimmer-icon-container w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300">
              <ShieldCheck className="w-6 h-6 metallic-gold-icon shimmer-icon" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <span className="xps-gold-slow-shimmer">Welcome, Jeremy</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your AI command center is ready — let's dominate.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} className="shimmer-card bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-primary/30 transition-all">
              <div className="shimmer-icon-container w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300">
                <Icon className="w-5 h-5 metallic-gold-icon shimmer-icon" />
              </div>
              <div className="text-sm font-semibold text-foreground">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="shimmer-card bg-card rounded-2xl border border-border p-4 md:p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{stat.label}</div>
                <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300">
                  <StatIcon className="w-4 h-4 metallic-gold-icon shimmer-icon" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold metallic-gold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Hot leads — THE most important section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 metallic-gold-icon" />
            <h2 className="text-sm font-bold text-foreground">AI-Prioritized Leads</h2>
          </div>
          <button className="flex items-center gap-1 text-xs text-primary font-medium">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {hotLeads.map((lead) => (
            <div key={lead.company} className="shimmer-card bg-card rounded-2xl border border-border p-3 md:p-4 cursor-default">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{lead.company}</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{lead.score}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{lead.contact} · {lead.sqft}</div>
                </div>
                <span className="text-base font-bold text-foreground flex-shrink-0 ml-3">{lead.value}</span>
              </div>
              
              {/* AI Insight */}
              <div className="flex items-start gap-2 mb-3 bg-primary/5 rounded-xl px-3 py-2">
                <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/80">{lead.reason}</span>
              </div>

              {/* Action buttons — one-tap to act */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.97] transition-transform">
                  <Phone className="w-3.5 h-3.5" /> AI Call
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                  <Mail className="w-3.5 h-3.5" /> AI Email
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                  <Sparkles className="w-3.5 h-3.5" /> AI Pitch
                </button>
                <div className="ml-auto">
                  <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="shimmer-card bg-card rounded-2xl border border-border p-4 md:p-6 cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300">
              <TrendingUp className="w-5 h-5 metallic-gold-icon shimmer-icon" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue Pipeline</h3>
              <p className="text-sm text-muted-foreground">6-month trend</p>
            </div>
          </div>
          <div className="shimmer-card flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <TrendingUp className="w-3.5 h-3.5 metallic-gold-icon" />
            <span className="text-xs font-semibold xps-gold-slow-shimmer">+18%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(40, 60%, 58%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(40, 60%, 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
            <Tooltip contentStyle={{ background: 'hsl(240, 8%, 7%)', border: '1px solid hsl(240, 6%, 14%)', borderRadius: 12, fontSize: 11 }} />
            <Area type="monotone" dataKey="value" stroke="hsl(40, 60%, 58%)" fill="url(#goldGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Today's schedule hint */}
      <div className="shimmer-card bg-card rounded-2xl border border-border p-5 flex items-center gap-4 cursor-default">
        <div className="shimmer-icon-container w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 transition-all duration-300">
          <Clock className="w-6 h-6 metallic-silver-icon shimmer-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">No follow-ups scheduled</div>
          <div className="text-sm text-muted-foreground mt-0.5">Schedule calls to see them here</div>
        </div>
        <div className="shimmer-card px-3 py-1.5 rounded-full border border-border hover:border-primary/30 transition-all cursor-pointer">
          <span className="text-xs font-medium text-muted-foreground">Schedule</span>
        </div>
      </div>

      {/* System Status */}
      <div className="shimmer-card bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300">
            <Zap className="w-5 h-5 metallic-gold-icon shimmer-icon" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI System Status</h3>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{label: "XPS Agent", status: "Online"}, {label: "SEO Engine", status: "Active"}, {label: "Lead Scoring", status: "Ready"}].map(s => (
            <div key={s.label} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div>
                <div className="text-sm font-semibold text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}