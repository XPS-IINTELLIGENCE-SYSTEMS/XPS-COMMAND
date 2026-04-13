import { useState, useEffect } from "react";
import { Loader2, Search, Package, Hammer, Users, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

export default function DashboardView({ onNavigate }) {
  const [d, setD] = useState(null);
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
    ]);
    setD({ leads, proposals, invoices, emails });
    setLoading(false);
    genTips(leads, proposals, invoices);
  };

  const genTips = async (leads, proposals, invoices) => {
    const r = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI coach for XPS (epoxy/concrete polishing). Give 3 sharp tips based on: ${leads.length} leads, ${proposals.filter(p=>p.status==="Approved").length} won, ${invoices.filter(i=>i.status==="Overdue").length} overdue invoices. Under 15 words each.`,
      response_json_schema: { type: "object", properties: { tips: { type: "array", items: { type: "string" } } } }
    });
    setTips(r.tips || []);
  };

  if (loading || !d) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const { leads, proposals, invoices, emails } = d;
  const xp = leads.filter(l => l.lead_type === "XPress");
  const jobs = leads.filter(l => l.lead_type === "Jobs");
  const incoming = leads.filter(l => l.pipeline_status === "Incoming");
  const contacted = leads.filter(l => l.stage === "Contacted");
  const followNeeded = leads.filter(l => l.stage === "Contacted");
  const inProposal = leads.filter(l => l.stage === "Proposal" || l.stage === "Negotiation");
  const won = proposals.filter(p => p.status === "Approved");
  const lost = proposals.filter(p => p.status === "Rejected");
  const activeJobs = leads.filter(l => l.stage === "Won");
  const overdue = invoices.filter(i => i.status === "Overdue");
  const paid = invoices.filter(i => i.status === "Paid");
  const sentEmails = emails.filter(e => e.status === "Sent");

  const values = leads.map(l => l.estimated_value || 0).filter(v => v > 0);
  const topValue = Math.max(...(values.length ? values : [0]));
  const bottomValue = Math.min(...(values.length ? values : [0]));
  const medianValue = values.length ? values.sort((a,b)=>a-b)[Math.floor(values.length/2)] : 0;
  const totalPipeline = values.reduce((s,v)=>s+v, 0);
  const avgScore = leads.length ? Math.round(leads.reduce((s,l)=>s+(l.score||0),0)/leads.length) : 0;
  const topScore = Math.max(...leads.map(l=>l.score||0));
  const wonValue = won.reduce((s,p)=>s+(p.total_value||0),0);
  const paidValue = paid.reduce((s,i)=>s+(i.total||0),0);
  const overdueValue = overdue.reduce((s,i)=>s+(i.total||0),0);

  const pValues = proposals.map(p => p.total_value || 0).filter(v => v > 0);
  const avgDeal = pValues.length ? Math.round(pValues.reduce((s,v)=>s+v,0)/pValues.length) : 0;
  const winRate = proposals.length ? Math.round((won.length / proposals.length) * 100) : 0;

  // Predicted: simple projection based on pipeline * win rate
  const predicted = Math.round(totalPipeline * (winRate / 100));

  const nav = (v) => { if (onNavigate) onNavigate(v); };

  const topXpressLead = xp.sort((a,b)=>(b.score||0)-(a.score||0))[0];
  const topJobLead = jobs.sort((a,b)=>(b.score||0)-(a.score||0))[0];
  const biggestDeal = [...proposals].sort((a,b)=>(b.total_value||0)-(a.total_value||0))[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COMMAND CENTER</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Workflow intelligence · Top down · Left to right</p>
          </div>
          <div className="flex gap-2">
            <MetricPill label="Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}k`} />
            <MetricPill label="Predicted" value={`$${(predicted/1000).toFixed(0)}k`} />
            <MetricPill label="Win Rate" value={`${winRate}%`} />
          </div>
        </div>

        {/* === ROW 1: DISCOVERY === */}
        <WorkflowRow icon={Search} title="DISCOVERY" onClick={() => nav("find_work")} cols={[
          { label: "Incoming", value: incoming.length, sub: "new leads" },
          { label: "Top Score", value: topScore, sub: "best lead score" },
          { label: "Avg Score", value: avgScore, sub: "across all leads" },
          { label: "Total Leads", value: leads.length, sub: "in system" },
          { label: "Sources Active", value: new Set(leads.map(l=>l.ingestion_source)).size, sub: "feed channels" },
        ]} />

        {/* === ROW 2: XPRESS PIPELINE === */}
        <WorkflowRow icon={Package} title="XPRESS PIPELINE" onClick={() => nav("xpress_leads")} cols={[
          { label: "Total", value: xp.length, sub: "contractor leads" },
          { label: "Top Lead", value: topXpressLead?.company || "—", sub: topXpressLead ? `Score: ${topXpressLead.score || 0}` : "", isText: true },
          { label: "Highest Value", value: `$${(Math.max(...xp.map(l=>l.estimated_value||0))/1000).toFixed(0)}k`, sub: "single lead" },
          { label: "Median Value", value: `$${(medianValue/1000).toFixed(1)}k`, sub: "pipeline median" },
          { label: "Qualified", value: xp.filter(l=>l.pipeline_status==="Qualified").length, sub: "ready for outreach" },
        ]} />

        {/* === ROW 3: JOBS PIPELINE === */}
        <WorkflowRow icon={Hammer} title="JOBS PIPELINE" onClick={() => nav("job_leads")} cols={[
          { label: "Total", value: jobs.length, sub: "project leads" },
          { label: "Top Lead", value: topJobLead?.company || "—", sub: topJobLead ? `${topJobLead.vertical || ""} · Score: ${topJobLead.score || 0}` : "", isText: true },
          { label: "Highest Value", value: `$${(Math.max(...jobs.map(l=>l.estimated_value||0), 0)/1000).toFixed(0)}k`, sub: "single project" },
          { label: "Avg Sqft", value: Math.round(jobs.reduce((s,l)=>s+(l.square_footage||0),0)/(jobs.length||1)).toLocaleString(), sub: "per project" },
          { label: "Qualified", value: jobs.filter(l=>l.pipeline_status==="Qualified").length, sub: "ready to bid" },
        ]} />

        {/* === ROW 4: CRM === */}
        <WorkflowRow icon={Users} title="CRM" onClick={() => nav("crm")} cols={[
          { label: "Active Leads", value: leads.filter(l=>!["Won","Lost"].includes(l.stage)).length, sub: "in pipeline" },
          { label: "Pipeline $", value: `$${(totalPipeline/1000).toFixed(0)}k`, sub: "total value" },
          { label: "Top $", value: `$${(topValue/1000).toFixed(0)}k`, sub: "biggest lead" },
          { label: "Bottom $", value: `$${(bottomValue/1000).toFixed(0)}k`, sub: "smallest lead" },
          { label: "Median $", value: `$${(medianValue/1000).toFixed(0)}k`, sub: "middle ground" },
        ]} />

        {/* === ROW 5: CONTACT === */}
        <WorkflowRow icon={Phone} title="CONTACT" onClick={() => nav("get_work")} cols={[
          { label: "Needs Contact", value: leads.filter(l=>l.pipeline_status==="Qualified"&&l.stage==="Incoming").length, sub: "qualified, not contacted" },
          { label: "Contacted", value: contacted.length, sub: "awaiting reply" },
          { label: "Emails Sent", value: sentEmails.length, sub: "total outreach" },
          { label: "Open Rate", value: emails.filter(e=>e.status==="Opened").length ? `${Math.round(emails.filter(e=>e.status==="Opened").length/Math.max(sentEmails.length,1)*100)}%` : "0%", sub: "email opens" },
          { label: "Replied", value: emails.filter(e=>e.status==="Replied").length, sub: "got response" },
        ]} />

        {/* === ROW 6: FOLLOW-UP === */}
        <WorkflowRow icon={Clock} title="FOLLOW-UP" onClick={() => nav("follow_up")} cols={[
          { label: "Awaiting Reply", value: followNeeded.length, sub: "contacted, no response" },
          { label: "Follow-Ups Sent", value: emails.filter(e=>e.email_type==="Follow-Up").length, sub: "follow-up emails" },
          { label: "Stale > 7d", value: contacted.filter(l => { const d = new Date(l.last_contacted); return d && (Date.now()-d.getTime())>7*86400000; }).length, sub: "needs attention" },
          { label: "In Proposal", value: inProposal.length, sub: "proposal stage" },
          { label: "Predicted Close", value: `$${(inProposal.reduce((s,l)=>s+(l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "proposal pipeline" },
        ]} />

        {/* === ROW 7: CLOSE === */}
        <WorkflowRow icon={Trophy} title="CLOSE" onClick={() => nav("win_work")} cols={[
          { label: "Won", value: won.length, sub: `$${(wonValue/1000).toFixed(0)}k total` },
          { label: "Lost", value: lost.length, sub: "rejected" },
          { label: "Win Rate", value: `${winRate}%`, sub: `${proposals.length} total proposals` },
          { label: "Avg Deal", value: `$${(avgDeal/1000).toFixed(0)}k`, sub: "per proposal" },
          { label: "Biggest Win", value: biggestDeal ? `$${((biggestDeal.total_value||0)/1000).toFixed(0)}k` : "—", sub: biggestDeal?.client_name || "" },
        ]} />

        {/* === ROW 8: EXECUTE === */}
        <WorkflowRow icon={HardHat} title="EXECUTE" onClick={() => nav("do_work")} cols={[
          { label: "Active Jobs", value: activeJobs.length, sub: "in execution" },
          { label: "Job Value", value: `$${(activeJobs.reduce((s,l)=>s+(l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "total on deck" },
          { label: "Negotiating", value: leads.filter(l=>l.stage==="Negotiation").length, sub: "coming soon" },
          { label: "Avg Job $", value: activeJobs.length ? `$${(activeJobs.reduce((s,l)=>s+(l.estimated_value||0),0)/activeJobs.length/1000).toFixed(0)}k` : "—", sub: "per job" },
          { label: "Predicted", value: `$${(predicted/1000).toFixed(0)}k`, sub: "projected revenue" },
        ]} />

        {/* === ROW 9: COLLECT === */}
        <WorkflowRow icon={DollarSign} title="COLLECT" onClick={() => nav("get_paid")} cols={[
          { label: "Collected", value: `$${(paidValue/1000).toFixed(0)}k`, sub: `${paid.length} invoices` },
          { label: "Outstanding", value: `$${(overdueValue/1000).toFixed(0)}k`, sub: `${overdue.length} overdue` },
          { label: "Invoices Out", value: invoices.filter(i=>i.status==="Sent").length, sub: "awaiting payment" },
          { label: "Collection %", value: paid.length ? `${Math.round(paidValue/(paidValue+overdueValue||1)*100)}%` : "0%", sub: "of total billed" },
          { label: "Avg Invoice", value: invoices.length ? `$${(invoices.reduce((s,i)=>s+(i.total||0),0)/invoices.length/1000).toFixed(0)}k` : "—", sub: "per invoice" },
        ]} />

        {/* === ROW 10: ANALYTICS === */}
        <WorkflowRow icon={BarChart3} title="ANALYTICS" onClick={() => nav("analytics")} cols={[
          { label: "Total Revenue", value: `$${((wonValue+paidValue)/1000).toFixed(0)}k`, sub: "won + collected" },
          { label: "Pipeline", value: `$${(totalPipeline/1000).toFixed(0)}k`, sub: "total value" },
          { label: "Predicted", value: `$${(predicted/1000).toFixed(0)}k`, sub: `at ${winRate}% win rate` },
          { label: "Leads/Source", value: Math.round(leads.length / Math.max(new Set(leads.map(l=>l.ingestion_source)).size, 1)), sub: "avg per channel" },
          { label: "Cost/Lead", value: "—", sub: "add expenses" },
        ]} />

        {/* === ROW 11: TIPS === */}
        <div className="rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">AI TIPS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tips ? tips.map((t, i) => (
              <div key={i} className={cn("rounded-lg p-3 text-xs text-foreground/80", i % 2 === 0 ? "bg-black/80 border border-white/[0.06]" : "bg-white/[0.04] border border-white/[0.10]")}>
                <Lightbulb className="w-3 h-3 text-primary mb-1" />
                {t}
              </div>
            )) : <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Generating...</div>}
          </div>
        </div>

        {/* === ROW 12: AGENTS === */}
        <div className="rounded-xl bg-black/80 border border-white/[0.06] p-4 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.08] transition-all duration-300" onClick={() => nav("agents")}>
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">AGENTS</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {["XPS Assistant", "Lead Scraper", "Sales Director", "SEO Marketing"].map((name, i) => (
              <div key={i} className={cn("rounded-lg p-3 text-center", i % 2 === 0 ? "bg-white/[0.04] border border-white/[0.10]" : "bg-black/60 border border-white/[0.06]")}>
                <Bot className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-[10px] font-semibold text-foreground">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* === Shared Components === */

function MetricPill({ label, value }) {
  return (
    <div className="rounded-lg px-3 py-1.5 bg-black/80 border border-white/[0.06] text-center">
      <div className="text-sm font-bold text-primary">{value}</div>
      <div className="text-[8px] text-muted-foreground">{label}</div>
    </div>
  );
}

function WorkflowRow({ icon: Icon, title, cols, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] hover:border-primary/40 hover:shadow-[0_0_28px_rgba(212,175,55,0.12)] transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Row header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground tracking-wider">{title}</span>
        <span className="text-[9px] text-muted-foreground ml-auto group-hover:text-primary transition-colors">View →</span>
      </div>
      {/* Columns */}
      <div className="grid grid-cols-5 divide-x divide-white/[0.06]">
        {cols.map((col, i) => (
          <div key={i} className={cn(
            "px-3 py-3 text-center transition-all duration-300",
            i % 2 === 0 ? "bg-black/40" : "bg-transparent",
            "group-hover:bg-primary/[0.04]"
          )}>
            <div className={cn("font-bold text-foreground", col.isText ? "text-[11px] truncate" : "text-base")}>{col.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{col.label}</div>
            {col.sub && <div className="text-[8px] text-muted-foreground/50 mt-0.5 truncate">{col.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}