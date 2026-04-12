import { useState, useEffect } from "react";
import { Mail, DollarSign, AlertCircle, CheckCircle2, Clock, ArrowRight, TrendingUp, Search, Megaphone, HardHat, Loader2 } from "lucide-react";
import HexGlow from "../HexGlow";
import NavIcon from "../shared/NavIcon";
import { base44 } from "@/api/base44Client";

const STAT_ICONS = {
  find_work: Search,
  get_work: Megaphone,
  do_work: HardHat,
  get_paid: DollarSign,
};

export default function CommandCenterView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Active Leads", value: "0", iconId: "find_work", trend: "—" },
    { label: "In Outreach", value: "0", iconId: "get_work", trend: "—" },
    { label: "Open Proposals", value: "0", iconId: "do_work", trend: "—" },
    { label: "Unpaid Invoices", value: "0", iconId: "get_paid", trend: "—" },
  ]);
  const [actions, setActions] = useState([]);
  const [recentWins, setRecentWins] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200),
      base44.entities.Proposal.list("-created_date", 100),
      base44.entities.Invoice.list("-created_date", 100),
      base44.entities.OutreachEmail.list("-created_date", 50),
    ]);

    // Stats
    const activeLeads = leads.filter(l => !["Won", "Lost"].includes(l.stage));
    const contactedLeads = leads.filter(l => ["Contacted", "Qualified"].includes(l.stage));
    const openProposals = proposals.filter(p => ["Draft", "Sent", "Viewed"].includes(p.status));
    const unpaidInvoices = invoices.filter(i => ["Sent", "Viewed", "Overdue"].includes(i.status));

    setStats([
      { label: "Active Leads", value: String(activeLeads.length), iconId: "find_work", trend: activeLeads.length > 0 ? `${activeLeads.length} total` : "None yet" },
      { label: "In Outreach", value: String(contactedLeads.length), iconId: "get_work", trend: `${emails.filter(e => e.status === "Sent").length} sent` },
      { label: "Open Proposals", value: String(openProposals.length), iconId: "do_work", trend: openProposals.length > 0 ? `$${openProposals.reduce((s, p) => s + (p.total_value || 0), 0).toLocaleString()}` : "$0" },
      { label: "Unpaid Invoices", value: String(unpaidInvoices.length), iconId: "get_paid", trend: unpaidInvoices.length > 0 ? `$${unpaidInvoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}` : "$0" },
    ]);

    // Needs attention actions
    const flagged = [];
    const unopened = proposals.filter(p => p.status === "Sent");
    if (unopened.length > 0) flagged.push({ icon: AlertCircle, label: `${unopened.length} proposal(s) sent but not yet viewed`, phase: "WIN WORK" });
    const newLeads = leads.filter(l => l.stage === "New");
    if (newLeads.length > 0) flagged.push({ icon: Mail, label: `${newLeads.length} new lead(s) haven't been contacted`, phase: "FIND WORK" });
    const overdue = invoices.filter(i => i.status === "Overdue");
    if (overdue.length > 0) flagged.push({ icon: DollarSign, label: `${overdue.length} invoice(s) overdue`, phase: "GET PAID" });
    const draftProposals = proposals.filter(p => p.status === "Draft");
    if (draftProposals.length > 0) flagged.push({ icon: Clock, label: `${draftProposals.length} draft proposal(s) need to be sent`, phase: "WIN WORK" });
    if (flagged.length === 0) flagged.push({ icon: CheckCircle2, label: "All caught up — no urgent items!", phase: "COMMAND" });
    setActions(flagged);

    // Recent wins
    const wins = [];
    const wonLeads = leads.filter(l => l.stage === "Won").slice(0, 3);
    wonLeads.forEach(l => wins.push({ label: `${l.company} — Won ($${(l.estimated_value || 0).toLocaleString()})`, time: new Date(l.updated_date).toLocaleDateString() }));
    const paidInvoices = invoices.filter(i => i.status === "Paid").slice(0, 3);
    paidInvoices.forEach(i => wins.push({ label: `${i.client_name} paid ${i.invoice_number} — $${(i.total || 0).toLocaleString()}`, time: new Date(i.updated_date).toLocaleDateString() }));
    const approvedProposals = proposals.filter(p => p.status === "Approved").slice(0, 2);
    approvedProposals.forEach(p => wins.push({ label: `${p.client_name} approved proposal — $${(p.total_value || 0).toLocaleString()}`, time: new Date(p.updated_date).toLocaleDateString() }));
    if (wins.length === 0) wins.push({ label: "No wins yet — use Find Work to start your pipeline!", time: "Get started" });
    setRecentWins(wins.slice(0, 5));

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <HexGlow />
      </div>

      <div className="relative z-[1] p-4 md:p-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center pt-4 md:pt-8 pb-4">
          <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <NavIcon id="command" size="sm" />
            <span className="text-sm font-semibold xps-silver-subtle-gold">AI Daily Intelligence Briefing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            COMMAND
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Live pipeline data — here's what needs your attention
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pipeline Stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {stats.map((stat) => {
                const StatIcon = STAT_ICONS[stat.iconId];
                return (
                  <div key={stat.label} className="shimmer-card text-center p-5 rounded-xl min-w-[120px] cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="w-5 h-5 metallic-silver-icon" />
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold metallic-gold shimmer-icon">{stat.value}</div>
                    <div className="text-xs text-muted-foreground tracking-wider mt-1 font-medium">{stat.label}</div>
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      <TrendingUp className="w-4 h-4 metallic-gold-icon" />
                      <span className="text-sm xps-gold-slow-shimmer font-bold">{stat.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Needs Attention */}
            <div className="max-w-3xl mx-auto">
              <div className="shimmer-card rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <NavIcon id="command" size="md" />
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-foreground">Needs Your Attention</h2>
                    <p className="text-xs text-muted-foreground">AI flagged {actions.length} priority items</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <div key={i} className="shimmer-card flex items-center gap-3 p-3 md:p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                        <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">{action.label}</p>
                          <span className="text-xs text-muted-foreground tracking-wider">{action.phase}</span>
                        </div>
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
                  <NavIcon id="tips" size="md" />
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-foreground">Recent Wins</h2>
                    <p className="text-xs text-muted-foreground">Closed deals & milestones</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {recentWins.map((win, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                      <CheckCircle2 className="w-4 h-4 metallic-gold-icon flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">{win.label}</p>
                        <span className="text-xs text-muted-foreground">{win.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}