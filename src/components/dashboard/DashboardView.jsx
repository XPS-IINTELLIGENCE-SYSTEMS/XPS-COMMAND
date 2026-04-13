import { useState, useEffect } from "react";
import { Loader2, Search, Package, Hammer, Users, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, TrendingUp } from "lucide-react";
import CRMSection from "./CRMSection";
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

  if (loading || !d) return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

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
  const predicted = Math.round(totalPipeline * (winRate / 100));

  const nav = (v) => { if (onNavigate) onNavigate(v); };

  const topXpressLead = [...xp].sort((a,b)=>(b.score||0)-(a.score||0))[0];
  const topJobLead = [...jobs].sort((a,b)=>(b.score||0)-(a.score||0))[0];
  const biggestDeal = [...proposals].sort((a,b)=>(b.total_value||0)-(a.total_value||0))[0];

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="relative z-10 p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              COMMAND CENTER
            </h1>
            <p className="text-base text-muted-foreground mt-1">Workflow intelligence · Top down · Left to right</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <GlassPill label="Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}k`} />
            <GlassPill label="Predicted" value={`$${(predicted/1000).toFixed(0)}k`} />
            <GlassPill label="Win Rate" value={`${winRate}%`} />
          </div>
        </div>

        {/* ===== TOP METRICS — 4 key numbers ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricTile label="Total Leads" value={leads.length} sub={`${xp.length} XPress · ${jobs.length} Jobs`} />
          <MetricTile label="Won Revenue" value={`$${(wonValue/1000).toFixed(0)}k`} sub={`${won.length} deals closed`} />
          <MetricTile label="Active Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}k`} sub={`${inProposal.length} in proposal`} />
          <MetricTile label="Collected" value={`$${(paidValue/1000).toFixed(0)}k`} sub={`${overdue.length} overdue`} />
        </div>

        {/* ===== CRM BOARD — IMMEDIATELY BELOW METRICS ===== */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>CRM BOARD</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage every deal from contact to close</p>
          </div>
          <CRMSection />
        </div>

        {/* ===== PIPELINE METRICS — below CRM ===== */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold metallic-silver tracking-tight mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>PIPELINE METRICS</h2>
          <p className="text-sm text-muted-foreground mb-4">Click any row to drill down</p>
        </div>

        <WorkflowRow icon={Search} title="DISCOVERY" onClick={() => nav("find_work")} cols={[
          { label: "Incoming", value: incoming.length, sub: "new leads" },
          { label: "Top Score", value: topScore, sub: "best lead score" },
          { label: "Avg Score", value: avgScore, sub: "across all leads" },
          { label: "Total Leads", value: leads.length, sub: "in system" },
          { label: "Sources", value: new Set(leads.map(l=>l.ingestion_source)).size, sub: "feed channels" },
        ]} />

        <WorkflowRow icon={Package} title="XPRESS PIPELINE" onClick={() => nav("xpress_leads")} cols={[
          { label: "Total", value: xp.length, sub: "contractor leads" },
          { label: "Top Lead", value: topXpressLead?.company || "—", sub: topXpressLead ? `Score: ${topXpressLead.score||0}` : "", isText: true },
          { label: "Highest $", value: `$${(Math.max(...xp.map(l=>l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "single lead" },
          { label: "Median $", value: `$${(medianValue/1000).toFixed(1)}k`, sub: "pipeline median" },
          { label: "Qualified", value: xp.filter(l=>l.pipeline_status==="Qualified").length, sub: "ready for outreach" },
        ]} />

        <WorkflowRow icon={Hammer} title="JOBS PIPELINE" onClick={() => nav("job_leads")} cols={[
          { label: "Total", value: jobs.length, sub: "project leads" },
          { label: "Top Lead", value: topJobLead?.company || "—", sub: topJobLead ? `Score: ${topJobLead.score||0}` : "", isText: true },
          { label: "Highest $", value: `$${(Math.max(...jobs.map(l=>l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "single project" },
          { label: "Avg Sqft", value: Math.round(jobs.reduce((s,l)=>s+(l.square_footage||0),0)/(jobs.length||1)).toLocaleString(), sub: "per project" },
          { label: "Qualified", value: jobs.filter(l=>l.pipeline_status==="Qualified").length, sub: "ready to bid" },
        ]} />

        <WorkflowRow icon={Phone} title="CONTACT" onClick={() => nav("get_work")} cols={[
          { label: "Needs Contact", value: leads.filter(l=>l.pipeline_status==="Qualified"&&l.stage==="Incoming").length, sub: "not contacted" },
          { label: "Contacted", value: contacted.length, sub: "awaiting reply" },
          { label: "Emails Sent", value: sentEmails.length, sub: "total outreach" },
          { label: "Open Rate", value: `${Math.round(emails.filter(e=>e.status==="Opened").length/Math.max(sentEmails.length,1)*100)}%`, sub: "email opens" },
          { label: "Replied", value: emails.filter(e=>e.status==="Replied").length, sub: "got response" },
        ]} />

        <WorkflowRow icon={Clock} title="FOLLOW-UP" onClick={() => nav("follow_up")} cols={[
          { label: "Awaiting", value: followNeeded.length, sub: "no response yet" },
          { label: "Sent", value: emails.filter(e=>e.email_type==="Follow-Up").length, sub: "follow-up emails" },
          { label: "Stale > 7d", value: contacted.filter(l => { const dt = new Date(l.last_contacted); return dt && (Date.now()-dt.getTime())>7*86400000; }).length, sub: "needs attention" },
          { label: "In Proposal", value: inProposal.length, sub: "proposal stage" },
          { label: "Predicted", value: `$${(inProposal.reduce((s,l)=>s+(l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "proposal pipeline" },
        ]} />

        <WorkflowRow icon={Trophy} title="CLOSE" onClick={() => nav("win_work")} cols={[
          { label: "Won", value: won.length, sub: `$${(wonValue/1000).toFixed(0)}k total` },
          { label: "Lost", value: lost.length, sub: "rejected" },
          { label: "Win Rate", value: `${winRate}%`, sub: `${proposals.length} proposals` },
          { label: "Avg Deal", value: `$${(avgDeal/1000).toFixed(0)}k`, sub: "per proposal" },
          { label: "Biggest", value: biggestDeal ? `$${((biggestDeal.total_value||0)/1000).toFixed(0)}k` : "—", sub: biggestDeal?.client_name || "" },
        ]} />

        <WorkflowRow icon={HardHat} title="EXECUTE" onClick={() => nav("do_work")} cols={[
          { label: "Active Jobs", value: activeJobs.length, sub: "in execution" },
          { label: "Job Value", value: `$${(activeJobs.reduce((s,l)=>s+(l.estimated_value||0),0)/1000).toFixed(0)}k`, sub: "on deck" },
          { label: "Negotiating", value: leads.filter(l=>l.stage==="Negotiation").length, sub: "coming soon" },
          { label: "Avg Job", value: activeJobs.length ? `$${(activeJobs.reduce((s,l)=>s+(l.estimated_value||0),0)/activeJobs.length/1000).toFixed(0)}k` : "—", sub: "per job" },
          { label: "Predicted", value: `$${(predicted/1000).toFixed(0)}k`, sub: "projected rev" },
        ]} />

        <WorkflowRow icon={DollarSign} title="COLLECT" onClick={() => nav("get_paid")} cols={[
          { label: "Collected", value: `$${(paidValue/1000).toFixed(0)}k`, sub: `${paid.length} invoices` },
          { label: "Outstanding", value: `$${(overdueValue/1000).toFixed(0)}k`, sub: `${overdue.length} overdue` },
          { label: "Sent", value: invoices.filter(i=>i.status==="Sent").length, sub: "awaiting payment" },
          { label: "Collection %", value: `${Math.round(paidValue/(paidValue+overdueValue||1)*100)}%`, sub: "of billed" },
          { label: "Avg Invoice", value: invoices.length ? `$${(invoices.reduce((s,i)=>s+(i.total||0),0)/invoices.length/1000).toFixed(0)}k` : "—", sub: "per invoice" },
        ]} />

        <WorkflowRow icon={BarChart3} title="ANALYTICS" onClick={() => nav("analytics")} cols={[
          { label: "Revenue", value: `$${((wonValue+paidValue)/1000).toFixed(0)}k`, sub: "won + collected" },
          { label: "Pipeline", value: `$${(totalPipeline/1000).toFixed(0)}k`, sub: "total value" },
          { label: "Predicted", value: `$${(predicted/1000).toFixed(0)}k`, sub: `at ${winRate}% rate` },
          { label: "Leads/Src", value: Math.round(leads.length / Math.max(new Set(leads.map(l=>l.ingestion_source)).size, 1)), sub: "per channel" },
          { label: "Cost/Lead", value: "—", sub: "add expenses" },
        ]} />

        {/* AI TIPS */}
        <div className="rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">AI TIPS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips ? tips.map((t, i) => (
              <div key={i} className={cn(
                "rounded-xl p-5 text-sm font-medium text-foreground/90 animated-silver-border",
                i % 2 === 0 ? "bg-black/50 border border-white/[0.08]" : "bg-white/[0.05] border border-white/[0.12]"
              )}>
                <Lightbulb className="w-4 h-4 text-primary mb-2" />
                {t}
              </div>
            )) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />Generating...
              </div>
            )}
          </div>
        </div>

        {/* AGENTS */}
        <div
          className="rounded-2xl p-6 cursor-pointer transition-all duration-300 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
          onClick={() => nav("agents")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">AGENTS</span>
            <span className="text-sm text-muted-foreground ml-auto">View All →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["XPS Assistant", "Lead Scraper", "Sales Director", "SEO Marketing"].map((name, i) => (
              <div key={i} className={cn(
                "rounded-xl p-5 text-center animated-silver-border",
                i % 2 === 0 ? "bg-black/50 border border-white/[0.08]" : "bg-white/[0.05] border border-white/[0.12]"
              )}>
                <Bot className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-bold text-foreground">{name}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== METRIC TILE ===== */
function MetricTile({ label, value, sub }) {
  return (
    <div className="rounded-2xl p-5 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.10] animated-silver-border text-center">
      <div className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</div>
      <div className="text-sm font-bold text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ===== GLASS PILL ===== */
function GlassPill({ label, value }) {
  return (
    <div className="rounded-xl px-6 py-4 text-center min-w-[120px] bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] animated-silver-border">
      <div className="text-2xl font-extrabold text-primary">{value}</div>
      <div className="text-xs font-bold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ===== WORKFLOW ROW ===== */
function WorkflowRow({ icon: Icon, title, cols, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_40px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.3)]"
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-extrabold text-foreground tracking-wider">{title}</span>
        <span className="text-sm text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-5 divide-x divide-white/[0.06]">
        {cols.map((col, i) => (
          <div
            key={i}
            className={cn(
              "px-4 py-5 text-center transition-all duration-300",
              i % 2 === 0
                ? "bg-black/40 backdrop-blur-md"
                : "bg-white/[0.04] backdrop-blur-xl",
              "group-hover:bg-white/[0.06]"
            )}
          >
            <div className={cn(
              "font-extrabold text-foreground leading-tight",
              col.isText ? "text-lg truncate" : "text-2xl"
            )}>
              {col.value}
            </div>
            <div className="text-sm font-bold text-muted-foreground mt-1">{col.label}</div>
            {col.sub && <div className="text-xs text-muted-foreground/60 mt-0.5 truncate">{col.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}