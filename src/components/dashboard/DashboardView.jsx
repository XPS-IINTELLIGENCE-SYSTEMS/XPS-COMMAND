import { Phone, Mail, Sparkles, ArrowUpRight, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const hotLeads = [];

const revenueData = [
  { month: "Oct", value: 0 }, { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
  { month: "Jan", value: 0 }, { month: "Feb", value: 0 }, { month: "Mar", value: 0 },
];

const stats = [
  { label: "Pipeline", value: "$0", sub: "No data yet" },
  { label: "Hot Leads", value: "0", sub: "Add leads to get started" },
  { label: "Close Rate", value: "0%", sub: "No deals yet" },
  { label: "Avg Deal", value: "$0", sub: "No deals yet" },
];

export default function DashboardView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      {/* Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Welcome, Jeremy</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your dashboard is ready — let's add some real data.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="shimmer-card bg-card rounded-2xl border border-border p-3 md:p-4 cursor-default">
            <div className="text-[11px] text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-[11px] text-primary/80 mt-0.5">{stat.sub}</div>
          </div>
        ))}
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
                  <div className="text-xs text-muted-foreground mt-0.5">{lead.contact} · {lead.sqft}</div>
                </div>
                <span className="text-base font-bold text-foreground flex-shrink-0 ml-3">{lead.value}</span>
              </div>
              
              {/* AI Insight */}
              <div className="flex items-start gap-2 mb-3 bg-primary/5 rounded-xl px-3 py-2">
                <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-foreground/80">{lead.reason}</span>
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
      <div className="shimmer-card bg-card rounded-2xl border border-border p-3 md:p-4 cursor-default">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue Pipeline</h3>
            <p className="text-[11px] text-muted-foreground">6-month trend</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <TrendingUp className="w-3.5 h-3.5 metallic-gold-icon" /> +18%
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
      <div className="shimmer-card bg-card rounded-2xl border border-border p-4 flex items-center gap-3 cursor-default">
        <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 transition-all duration-300">
          <Clock className="w-5 h-5 metallic-silver-icon shimmer-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">No follow-ups scheduled</div>
          <div className="text-[11px] text-muted-foreground">Schedule calls to see them here</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
}