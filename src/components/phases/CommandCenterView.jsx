import { Zap, Search, Mail, FileText, DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function CommandCenterView() {
  const todayActions = [
    { icon: AlertCircle, label: "3 proposals unopened for 5+ days", phase: "WIN WORK", color: "text-orange-400" },
    { icon: Mail, label: "7 leads haven't been contacted yet", phase: "GET WORK", color: "text-blue-400" },
    { icon: DollarSign, label: "2 invoices overdue", phase: "GET PAID", color: "text-red-400" },
    { icon: Clock, label: "Materials not ordered for Tuesday job", phase: "DO WORK", color: "text-yellow-400" },
  ];

  const recentWins = [
    { label: "Acme Corp proposal signed — $24,000", time: "2 hours ago" },
    { label: "12 new leads found in Phoenix territory", time: "This morning" },
    { label: "Smith Corp paid final invoice — $18,500", time: "Yesterday" },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
          <Zap className="w-5 h-5 text-background" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COMMAND CENTER</h1>
          <p className="text-xs text-muted-foreground">Your AI agent's daily briefing — what needs attention now</p>
        </div>
      </div>

      {/* Proactive AI Alerts */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4 metallic-gold-icon" />
          Needs Your Attention
        </h2>
        {todayActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <div key={i} className="shimmer-card flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <Icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">{action.label}</p>
                <span className="text-[10px] text-muted-foreground">{action.phase}</span>
              </div>
              <button className="text-[10px] text-primary font-medium hover:underline">Fix</button>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Leads", value: "47", icon: Search, phase: "FIND" },
          { label: "In Outreach", value: "23", icon: Mail, phase: "GET" },
          { label: "Open Proposals", value: "8", icon: FileText, phase: "WIN" },
          { label: "Unpaid Invoices", value: "4", icon: DollarSign, phase: "PAID" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="shimmer-card bg-card border border-border rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 metallic-silver-icon mx-auto mb-1 shimmer-icon" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Wins */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Recent Wins
        </h2>
        {recentWins.map((win, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">{win.label}</p>
              <span className="text-[10px] text-muted-foreground">{win.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}