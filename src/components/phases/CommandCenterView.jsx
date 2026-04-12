import { Mail, FileText, DollarSign, AlertCircle, CheckCircle2, Clock, ArrowRight, TrendingUp } from "lucide-react";
import HexGlow from "../HexGlow";
import MetalIcon from "../shared/MetalIcon";

export default function CommandCenterView() {
  const todayActions = [
    { icon: AlertCircle, label: "3 proposals unopened for 5+ days", phase: "WIN WORK" },
    { icon: Mail, label: "7 leads haven't been contacted yet", phase: "GET WORK" },
    { icon: DollarSign, label: "2 invoices overdue", phase: "GET PAID" },
    { icon: Clock, label: "Materials not ordered for Tuesday job", phase: "DO WORK" },
  ];

  const recentWins = [
    { label: "Acme Corp proposal signed — $24,000", time: "2 hours ago" },
    { label: "12 new leads found in Phoenix territory", time: "This morning" },
    { label: "Smith Corp paid final invoice — $18,500", time: "Yesterday" },
  ];

  const stats = [
    { label: "Active Leads", value: "47", iconId: "find_work", trend: "+12%" },
    { label: "In Outreach", value: "23", iconId: "get_work", trend: "+8%" },
    { label: "Open Proposals", value: "8", iconId: "do_work", trend: "+3" },
    { label: "Unpaid Invoices", value: "4", iconId: "get_paid", trend: "-2" },
  ];

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <HexGlow />
      </div>

      <div className="relative z-[1] p-4 md:p-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center pt-4 md:pt-8 pb-4">
          <div className="shimmer-card inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <MetalIcon id="command" size="sm" />
            <span className="text-sm font-semibold xps-silver-subtle-gold">AI Daily Intelligence Briefing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            COMMAND
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Your agent analyzed everything overnight — here's what needs your attention
          </p>
        </div>

        {/* Pipeline Stats */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="shimmer-card text-center p-5 rounded-xl min-w-[120px] cursor-default">
              <div className="flex items-center justify-center mx-auto mb-3">
                <MetalIcon id={stat.iconId} size="lg" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold metallic-gold shimmer-icon">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground tracking-wider mt-1 font-medium">{stat.label}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 metallic-gold-icon" />
                <span className="text-[10px] xps-gold-slow-shimmer font-semibold">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Needs Attention */}
        <div className="max-w-3xl mx-auto">
          <div className="shimmer-card rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <MetalIcon id="command" size="md" />
              <div>
                <h2 className="text-sm md:text-base font-bold text-foreground">Needs Your Attention</h2>
                <p className="text-[10px] text-muted-foreground">AI flagged {todayActions.length} priority items</p>
              </div>
            </div>
            <div className="space-y-2">
              {todayActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <div key={i} className="shimmer-card flex items-center gap-3 p-3 md:p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                    <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-foreground font-medium">{action.label}</p>
                      <span className="text-[10px] text-muted-foreground tracking-wider">{action.phase}</span>
                    </div>
                    <button className="shimmer-card inline-flex items-center gap-1 text-[10px] md:text-xs text-primary font-semibold px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                      Fix <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Wins */}
        <div className="max-w-3xl mx-auto pb-8">
          <div className="shimmer-card rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <MetalIcon id="tips" size="md" />
              <div>
                <h2 className="text-sm md:text-base font-bold text-foreground">Recent Wins</h2>
                <p className="text-[10px] text-muted-foreground">Closed deals & milestones</p>
              </div>
            </div>
            <div className="space-y-1">
              {recentWins.map((win, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                  <CheckCircle2 className="w-4 h-4 metallic-gold-icon flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-foreground font-medium">{win.label}</p>
                    <span className="text-[10px] text-muted-foreground">{win.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}