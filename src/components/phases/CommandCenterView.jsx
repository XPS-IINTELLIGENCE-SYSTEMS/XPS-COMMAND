import { useState, useEffect } from "react";
import { Mail, DollarSign, AlertCircle, CheckCircle2, Clock, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PipelineCharts from "../dashboard/PipelineCharts";

export default function CommandCenterView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [leads, proposals, invoices] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200),
      base44.entities.Proposal.list("-created_date", 100),
      base44.entities.Invoice.list("-created_date", 100),
    ]);

    const flagged = [];
    const unopened = proposals.filter(p => p.status === "Sent");
    if (unopened.length > 0) flagged.push({ icon: AlertCircle, label: `${unopened.length} proposal(s) sent but not yet viewed`, phase: "WIN WORK", nav: "win_work" });
    const newLeads = leads.filter(l => l.stage === "New");
    if (newLeads.length > 0) flagged.push({ icon: Mail, label: `${newLeads.length} new lead(s) haven't been contacted`, phase: "FIND WORK", nav: "get_work" });
    const overdue = invoices.filter(i => i.status === "Overdue");
    if (overdue.length > 0) flagged.push({ icon: DollarSign, label: `${overdue.length} invoice(s) overdue`, phase: "GET PAID", nav: "get_paid" });
    const draftProposals = proposals.filter(p => p.status === "Draft");
    if (draftProposals.length > 0) flagged.push({ icon: Clock, label: `${draftProposals.length} draft proposal(s) need to be sent`, phase: "WIN WORK", nav: "win_work" });
    if (flagged.length === 0) flagged.push({ icon: CheckCircle2, label: "All caught up — no urgent items!", phase: "", nav: null });
    setActions(flagged);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-base font-bold text-foreground">Command Center</h1>
          <p className="text-xs text-muted-foreground">Live pipeline data — here's what needs your attention</p>
        </div>

        {/* Attention Items */}
        {actions.length > 0 && actions[0].nav && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            <h2 className="text-xs font-bold text-foreground mb-2">Needs Attention ({actions.length})</h2>
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => action.nav && onNavigate && onNavigate(action.nav)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all text-left"
                >
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium">{action.label}</p>
                    <span className="text-[10px] text-muted-foreground">{action.phase}</span>
                  </div>
                  {action.nav && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Real Charts */}
        <PipelineCharts />
      </div>
    </div>
  );
}