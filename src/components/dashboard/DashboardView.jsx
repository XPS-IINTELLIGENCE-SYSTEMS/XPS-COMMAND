import { useState, useEffect } from "react";
import { Loader2, Search, Package, Hammer, Users, Phone, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 300),
      base44.entities.Proposal.list("-created_date", 100),
      base44.entities.Invoice.list("-created_date", 100),
      base44.entities.OutreachEmail.list("-created_date", 100),
    ]);
    setData({ leads, proposals, invoices, emails });
    setLoading(false);

    // Generate tips async
    generateTips(leads, proposals, invoices);
  };

  const generateTips = async (leads, proposals, invoices) => {
    const xpressCount = leads.filter(l => l.lead_type === "XPress").length;
    const jobsCount = leads.filter(l => l.lead_type === "Jobs").length;
    const wonCount = proposals.filter(p => p.status === "Approved").length;
    const paidCount = invoices.filter(i => i.status === "Paid").length;
    const overdueCount = invoices.filter(i => i.status === "Overdue").length;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI business coach for XPS Xtreme Polishing Systems (epoxy/concrete polishing). Give 4 quick, actionable tips based on these metrics:
- XPress pipeline leads: ${xpressCount}
- Jobs pipeline leads: ${jobsCount}
- Won proposals: ${wonCount}
- Paid invoices: ${paidCount}
- Overdue invoices: ${overdueCount}
Keep each tip under 20 words. Be specific and tactical.`,
      response_json_schema: {
        type: "object",
        properties: {
          tips: { type: "array", items: { type: "object", properties: { tip: { type: "string" }, category: { type: "string" } } } }
        }
      }
    });
    setTips(result.tips || []);
  };

  if (loading || !data) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const { leads, proposals, invoices, emails } = data;
  const xpressLeads = leads.filter(l => l.lead_type === "XPress");
  const jobsLeads = leads.filter(l => l.lead_type === "Jobs");
  const crmLeads = leads.filter(l => ["Contacted", "Qualified", "Proposal", "Negotiation"].includes(l.stage));
  const needsContact = leads.filter(l => l.pipeline_status === "Qualified" && l.stage === "Incoming").slice(0, 15);
  const wonDeals = proposals.filter(p => p.status === "Approved");
  const activeJobs = leads.filter(l => l.stage === "Won");
  const overdueInvoices = invoices.filter(i => i.status === "Overdue" || i.status === "Sent");
  const sentEmails = emails.filter(e => e.status === "Sent" || e.status === "Queued");

  const totalPipeline = leads.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const wonValue = wonDeals.reduce((s, p) => s + (p.total_value || 0), 0);
  const overdueValue = overdueInvoices.reduce((s, i) => s + (i.total || 0), 0);

  const nav = (view) => { if (onNavigate) onNavigate(view); };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COMMAND CENTER</h1>
            <p className="text-xs text-muted-foreground mt-1">Full workflow at a glance</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="rounded-lg px-4 py-2 bg-black/80 border border-white/[0.06]">
              <div className="text-lg font-bold text-primary">${(totalPipeline / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-muted-foreground">Pipeline</div>
            </div>
            <div className="rounded-lg px-4 py-2 bg-white/[0.04] backdrop-blur-xl border border-white/[0.10]">
              <div className="text-lg font-bold text-primary">${(wonValue / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-muted-foreground">Won</div>
            </div>
            <div className="rounded-lg px-4 py-2 bg-black/80 border border-white/[0.06]">
              <div className="text-lg font-bold text-foreground">{leads.length}</div>
              <div className="text-[9px] text-muted-foreground">Total Leads</div>
            </div>
          </div>
        </div>

        {/* Row 1: Discovery */}
        <HScrollRow title="DISCOVERY" subtitle="What we're finding right now" icon={Search} count={leads.filter(l => l.pipeline_status === "Incoming").length}>
          {leads.filter(l => l.pipeline_status === "Incoming").slice(0, 12).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name || l.location} meta={l.score ? `Score: ${l.score}` : null} icon={l.lead_type === "XPress" ? Package : Hammer} onClick={() => nav(l.lead_type === "XPress" ? "xpress_leads" : "job_leads")} />
          ))}
          {leads.filter(l => l.pipeline_status === "Incoming").length === 0 && <EmptyCard text="No incoming leads yet" />}
        </HScrollRow>

        {/* Row 2: XPress Pipeline */}
        <HScrollRow title="XPRESS PIPELINE" subtitle="Contractors & operators" icon={Package} count={xpressLeads.length}>
          {xpressLeads.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={`${l.city || ""} · ${l.ai_insight?.slice(0, 40) || ""}`} meta={l.score ? `Score: ${l.score} · P${l.priority || 0}` : l.pipeline_status} icon={Package} onClick={() => nav("xpress_leads")} />
          ))}
          {xpressLeads.length === 0 && <EmptyCard text="No XPress leads — scraper runs every 6hrs" />}
        </HScrollRow>

        {/* Row 3: Jobs Pipeline */}
        <HScrollRow title="JOBS PIPELINE" subtitle="End-buyer project leads" icon={Hammer} count={jobsLeads.length}>
          {jobsLeads.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={`${l.vertical || ""} · ${l.city || ""}`} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : l.pipeline_status} icon={Hammer} onClick={() => nav("job_leads")} />
          ))}
          {jobsLeads.length === 0 && <EmptyCard text="No Jobs leads yet" />}
        </HScrollRow>

        {/* Row 4: CRM Top Leads */}
        <HScrollRow title="CRM — TOP ACTIVE LEADS" subtitle="Currently in pipeline stages" icon={Users} count={crmLeads.length}>
          {crmLeads.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={`${l.stage} · ${l.contact_name || ""}`} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : null} icon={Users} onClick={() => nav("crm")} />
          ))}
          {crmLeads.length === 0 && <EmptyCard text="No leads in CRM stages yet" />}
        </HScrollRow>

        {/* Row 5: Contact */}
        <HScrollRow title="CONTACT — NEEDS OUTREACH" subtitle="Qualified leads waiting for first contact" icon={Phone} count={needsContact.length}>
          {needsContact.map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.email || l.phone || "No contact info"} icon={Phone} onClick={() => nav("get_work")}>
              <div className="text-[9px] text-muted-foreground">{l.ai_insight?.slice(0, 60)}</div>
            </HCard>
          ))}
          {needsContact.length === 0 && <EmptyCard text="All qualified leads have been contacted" />}
        </HScrollRow>

        {/* Row 6: Close */}
        <HScrollRow title="CLOSE — WON DEALS" subtitle="Closed and won" icon={Trophy} count={wonDeals.length}>
          {wonDeals.slice(0, 10).map(p => (
            <HCard key={p.id} title={p.client_name} subtitle={p.service_type} meta={`$${(p.total_value || 0).toLocaleString()}`} icon={Trophy} onClick={() => nav("win_work")} />
          ))}
          {wonDeals.length === 0 && <EmptyCard text="No deals closed yet" />}
        </HScrollRow>

        {/* Row 7: Execute */}
        <HScrollRow title="EXECUTE — ON DECK" subtitle="Active jobs to manage" icon={HardHat} count={activeJobs.length}>
          {activeJobs.slice(0, 10).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.location} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "Active"} icon={HardHat} onClick={() => nav("do_work")} />
          ))}
          {activeJobs.length === 0 && <EmptyCard text="No active jobs on deck" />}
        </HScrollRow>

        {/* Row 8: Collect */}
        <HScrollRow title="COLLECT — OUTSTANDING" subtitle="Invoices to collect" icon={DollarSign} count={overdueInvoices.length}>
          {overdueInvoices.slice(0, 10).map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={`${i.invoice_number} · ${i.status}`} meta={`$${(i.total || 0).toLocaleString()}`} icon={DollarSign} onClick={() => nav("get_paid")} />
          ))}
          {overdueInvoices.length === 0 && <EmptyCard text="No outstanding invoices" />}
        </HScrollRow>

        {/* Row 9: Analytics */}
        <HScrollRow title="ANALYTICS — KEY NUMBERS" icon={BarChart3}>
          <StatCard label="Total Leads" value={leads.length} />
          <StatCard label="XPress Leads" value={xpressLeads.length} />
          <StatCard label="Jobs Leads" value={jobsLeads.length} />
          <StatCard label="Pipeline Value" value={`$${(totalPipeline / 1000).toFixed(0)}k`} />
          <StatCard label="Won Value" value={`$${(wonValue / 1000).toFixed(0)}k`} />
          <StatCard label="Proposals Sent" value={proposals.filter(p => p.status === "Sent").length} />
          <StatCard label="Overdue $" value={`$${(overdueValue / 1000).toFixed(0)}k`} />
          <StatCard label="Emails Sent" value={sentEmails.length} />
        </HScrollRow>

        {/* Row 10: Tips & Tricks */}
        <HScrollRow title="AI TIPS & TRICKS" subtitle="Based on your workflow" icon={Lightbulb}>
          {tips ? tips.map((t, i) => (
            <HCard key={i} title={t.category || `Tip ${i + 1}`} subtitle={t.tip} icon={Lightbulb} />
          )) : (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Generating tips...
            </div>
          )}
        </HScrollRow>

        {/* Row 11: Agents */}
        <HScrollRow title="AGENTS — QUICK ACCESS" icon={Bot}>
          <HCard title="XPS Assistant" subtitle="General AI help" icon={Bot} onClick={() => nav("agents")} />
          <HCard title="Lead Scraper" subtitle="Run manual scrape" icon={Search} onClick={() => nav("find_work")} />
          <HCard title="Sales Director" subtitle="Pipeline coaching" icon={Trophy} onClick={() => nav("agents")} />
          <HCard title="SEO Marketing" subtitle="Content & SEO" icon={Sparkles} onClick={() => nav("agents")} />
        </HScrollRow>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-black/60 border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="flex-shrink-0 w-[160px] rounded-xl p-4 bg-black/80 border border-white/[0.06] hover:border-primary/40 hover:bg-primary/[0.08] hover:shadow-[0_0_28px_rgba(212,175,55,0.18)] transition-all duration-300">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}