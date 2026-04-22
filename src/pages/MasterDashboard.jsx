import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Crown, Target, Brain, Zap, Users, Phone, Mail, FileText, BarChart3, Shield,
  Building2, Search, Crosshair, Palette, Calendar, Database, Workflow,
  RefreshCcw, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, TrendingUp,
  Globe, Download, Upload, Share2, Bot, Activity, DollarSign, Clock,
  ArrowRight, Loader2, Star, Wrench, Eye, Play, Settings, Map, List,
  LayoutDashboard, PieChart, Layers, HardHat, Briefcase, Archive, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

// All the tools imported as embedded sections
import StrategyView from "../components/strategy/StrategyView";
import OrchestratorPanel from "../components/commandhub/OrchestratorPanel";
import AutoWorkflowEngine from "../components/dashboard/AutoWorkflowEngine";
import AutoDashboardConfigurator from "../components/dashboard/AutoDashboardConfigurator";
import CRMView from "../components/dashboard/CRMView";
import CallListTab from "../components/callcenter/CallListTab";
import ProspectDatabaseTab from "../components/callcenter/ProspectDatabaseTab";
import BidCommandCenter from "../components/bidcenter/BidCommandCenter";
import CompetitorComparisonView from "../components/competitor/CompetitorComparisonView";
import ComplianceCheckerView from "../components/compliance/ComplianceCheckerView";
import ApprovalQueueView from "../components/approvals/ApprovalQueueView";
import BlueprintTakeoffView from "../components/takeoff/BlueprintTakeoffView";
import FindJobsView from "../components/scraper/FindJobsView";
import FindCompaniesView from "../components/scraper/FindCompaniesView";
import LeadSniperSystem from "../components/leadsniper/LeadSniperSystem";
import MediaHub from "../components/media/MediaHub";
import OutreachAutomationView from "../components/outreach/OutreachAutomationView";
import EmailTemplatesView from "../components/outreach/EmailTemplatesView";
import FollowUpTab from "../components/callcenter/FollowUpTab";
import ClosedDealsTab from "../components/callcenter/ClosedDealsTab";
import GoogleSuitePanel from "../components/warroom/GoogleSuitePanel";
import AutoEnhanceView from "../components/enhance/AutoEnhanceView";
import PipelineCharts from "../components/dashboard/PipelineCharts";
import MasterDatabaseView from "../components/database/MasterDatabaseView";
import ScraperSchedulerView from "../components/scheduler/ScraperSchedulerView";
import BidPipelineDashboard from "../components/bidpipeline/BidPipelineDashboard";
import SentimentAnalystView from "../components/sentiment/SentimentAnalystView";
import DataQualityBar from "../components/commandhub/DataQualityBar";

// ── Section wrapper component ──────────────────────────────────────────────
function DashSection({ id, icon: SectionIcon, title, badge, color = "#d4af37", children, defaultOpen = true, actions }) {
  const Icon = SectionIcon;
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);

  return (
    <section id={id} ref={ref} className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
        style={{ background: `linear-gradient(90deg, ${color}12 0%, transparent 100%)`, borderBottom: open ? "1px solid rgba(255,255,255,0.06)" : "none" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground">{title}</h2>
            {badge && <span className="text-[9px] text-muted-foreground">{badge}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {actions}
          <button onClick={() => setOpen(o => !o)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>
      {open && <div className="p-4 sm:p-5">{children}</div>}
    </section>
  );
}

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, color, onClick, trend }) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 text-left hover:scale-[1.02] transition-all group w-full"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        {trend && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend > 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{trend > 0 ? "+" : ""}{trend}%</span>}
      </div>
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[9px] text-muted-foreground/60 mt-0.5">{sub}</div>}
      <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all mt-1" />
    </button>
  );
}

// ── Quick action button ────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:scale-105 transition-all relative group"
    >
      {badge && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold">{badge}</span>}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[9px] font-bold text-foreground/80 text-center leading-tight">{label}</span>
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function MasterDashboard() {
  const [stats, setStats] = useState({ leads: 0, jobs: 0, bids: 0, prospects: 0, contractors: 0, callLogs: 0, proposals: 0, invoices: 0 });
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [callQueue, setCallQueue] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [aiLayout, setAiLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(false);

  const sectionRefs = {
    strategy: useRef(null),
    orchestrator: useRef(null),
    metrics: useRef(null),
    workflow: useRef(null),
    ops_db: useRef(null),
    crm: useRef(null),
    call_center: useRef(null),
    discovery: useRef(null),
    bidding: useRef(null),
    takeoff: useRef(null),
    competitor: useRef(null),
    compliance: useRef(null),
    approvals: useRef(null),
    outreach: useRef(null),
    followup: useRef(null),
    branding: useRef(null),
    scheduler: useRef(null),
    google: useRef(null),
    analytics: useRef(null),
    enhance: useRef(null),
    configurator: useRef(null),
  };

  const scrollTo = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(key);
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [leadsList, prospectList, contractors, jobs, logs, proposals, invoices, bids] = await Promise.all([
      base44.entities.Lead.list("-score", 1000).catch(() => []),
      base44.entities.ProspectCompany.list("-cold_call_priority", 500).catch(() => []),
      base44.entities.Contractor.list("-score", 200).catch(() => []),
      base44.entities.CommercialJob.list("-urgency_score", 200).catch(() => []),
      base44.entities.CallLog.list("-created_date", 500).catch(() => []),
      base44.entities.Proposal.list("-created_date", 100).catch(() => []),
      base44.entities.Invoice.list("-created_date", 100).catch(() => []),
      base44.entities.BidDocument.list("-created_date", 100).catch(() => []),
    ]);

    setLeads(leadsList);
    setProspects(prospectList);
    setCallLogs(logs);
    setStats({
      leads: leadsList.length,
      jobs: jobs.length,
      bids: bids.length,
      prospects: prospectList.length,
      contractors: contractors.length,
      callLogs: logs.length,
      proposals: proposals.length,
      invoices: invoices.filter(i => i.status !== "Paid").length,
    });

    // Build call queue
    const loggedIds = new Set(logs.map(l => l.source_id));
    const queue = [];
    leadsList.forEach(l => {
      if (!l.phone && !l.email) return;
      queue.push({ id: l.id, company_name: l.company || "Unknown", contact_name: l.contact_name || "", phone: l.phone || "", email: l.email || "", website: l.website || "", location: l.location || "", priority: l.priority || 5, score: l.score || 0, source_type: "Lead", source_id: l.id, logged: loggedIds.has(l.id), lastLog: logs.find(log => log.source_id === l.id) });
    });
    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    setCallQueue(queue);
    setLastRefresh(new Date());
    setLoading(false);
  };

  const generateAiLayout = async () => {
    setLayoutLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Operations AI. Analyze this business data and recommend the optimal dashboard section ORDER and PRIORITY for maximum productivity, minimum friction, and fastest path to revenue:

Stats: ${JSON.stringify(stats)}
Active leads: ${leads.filter(l => ["Incoming","Validated","Qualified"].includes(l.stage)).length}
Hot leads: ${leads.filter(l => l.score > 70).length}
Follow-up needed: ${callLogs.filter(l => ["Callback","No Answer","Voicemail"].includes(l.call_outcome)).length}
Pending bids: ${stats.bids}
Proposals: ${stats.proposals}

Recommend:
1. The top 5 "focus areas" right now with specific actions
2. Identify any missing tools or workflow gaps
3. Rate the overall pipeline health 0-100
4. Give 3 automation recommendations`,
      response_json_schema: {
        type: "object",
        properties: {
          focus_areas: { type: "array", items: { type: "object", properties: { area: { type: "string" }, action: { type: "string" }, urgency: { type: "string" }, section: { type: "string" } } } },
          missing_tools: { type: "array", items: { type: "string" } },
          pipeline_health: { type: "number" },
          automation_recommendations: { type: "array", items: { type: "string" } },
          bottlenecks: { type: "array", items: { type: "string" } },
        }
      }
    });
    setAiLayout(res);
    setLayoutLoading(false);
  };

  const followUps = callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome));
  const closedDeals = callLogs.filter(l => l.call_outcome === "Sold");
  const totalRevenue = callLogs.filter(l => l.call_outcome === "Sold").reduce((s, l) => s + (l.deal_value || 0), 0);

  const NAV_ITEMS = [
    { key: "strategy", label: "30-Day Plan", icon: Target, color: "#d4af37" },
    { key: "orchestrator", label: "Orchestrator", icon: Crown, color: "#8b5cf6" },
    { key: "metrics", label: "Metrics", icon: BarChart3, color: "#3b82f6" },
    { key: "workflow", label: "AI Workflow", icon: Workflow, color: "#14b8a6" },
    { key: "ops_db", label: "Ops DB", icon: Database, color: "#ef4444" },
    { key: "crm", label: "CRM", icon: Users, color: "#6366f1" },
    { key: "call_center", label: "Calls", icon: Phone, color: "#22c55e" },
    { key: "discovery", label: "Discovery", icon: Crosshair, color: "#f59e0b" },
    { key: "bidding", label: "Bids", icon: FileText, color: "#06b6d4" },
    { key: "takeoff", label: "Takeoff", icon: Layers, color: "#a855f7" },
    { key: "competitor", label: "Competitors", icon: TrendingUp, color: "#ec4899" },
    { key: "compliance", label: "Compliance", icon: Shield, color: "#f97316" },
    { key: "approvals", label: "Approvals", icon: CheckCircle2, color: "#10b981" },
    { key: "outreach", label: "Outreach", icon: Mail, color: "#ec4899" },
    { key: "followup", label: "Follow-Up", icon: Zap, color: "#eab308" },
    { key: "branding", label: "Branding", icon: Palette, color: "#a855f7" },
    { key: "scheduler", label: "Scheduler", icon: Clock, color: "#64748b" },
    { key: "google", label: "Google", icon: Globe, color: "#4285f4" },
    { key: "analytics", label: "Analytics", icon: PieChart, color: "#3b82f6" },
    { key: "enhance", label: "AI Enhance", icon: Brain, color: "#10b981" },
    { key: "configurator", label: "Configurator", icon: Settings, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Top Nav ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl metallic-gold-bg flex items-center justify-center flex-shrink-0">
              <Crown className="w-4.5 h-4.5 text-background" />
            </div>
            <div>
              <h1 className="text-base font-black metallic-gold leading-tight">XPS Master Operations Dashboard</h1>
              <p className="text-[9px] text-muted-foreground">AI-Orchestrated • Fully Linked • Autonomous</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && <span className="text-[9px] text-muted-foreground hidden sm:block">Refreshed {lastRefresh.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}><RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /></Button>
            <Button size="sm" onClick={generateAiLayout} disabled={layoutLoading} className="metallic-gold-bg text-background text-xs font-bold">
              {layoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline ml-1.5">AI Optimize</span>
            </Button>
            <Link to="/dashboard" className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors">← Main Dashboard</Link>
          </div>
        </div>
        {/* Section nav pills */}
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(n => (
            <button
              key={n.key}
              onClick={() => scrollTo(n.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeSection === n.key ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
            >
              <n.icon className="w-3 h-3" style={{ color: activeSection === n.key ? undefined : n.color }} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Data Quality Bar ────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <DataQualityBar leads={leads} prospects={prospects} />
      </div>

      {/* ── AI Layout Recommendation ────────────────────────────────── */}
      {aiLayout && (
        <div className="mx-4 mt-3 glass-card rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-black metallic-gold">AI Operations Analysis</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Pipeline Health:</span>
              <span className={`text-sm font-black ${aiLayout.pipeline_health >= 70 ? "text-green-400" : aiLayout.pipeline_health >= 40 ? "text-yellow-400" : "text-red-400"}`}>{aiLayout.pipeline_health}/100</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
            {(aiLayout.focus_areas || []).map((f, i) => (
              <button key={i} onClick={() => f.section && scrollTo(f.section)} className="bg-primary/5 hover:bg-primary/10 rounded-xl p-3 text-left transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full metallic-gold-bg flex items-center justify-center text-[9px] font-black text-background">{i + 1}</span>
                  <span className="text-[10px] font-bold text-foreground">{f.area}</span>
                  <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-bold ${f.urgency === "critical" ? "bg-red-500/20 text-red-400" : f.urgency === "high" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}`}>{f.urgency}</span>
                </div>
                <p className="text-[9px] text-muted-foreground ml-7">{f.action}</p>
                {f.section && <div className="ml-7 mt-1 text-[8px] text-primary/60 group-hover:text-primary transition-colors flex items-center gap-1">Jump to section <ArrowRight className="w-2.5 h-2.5" /></div>}
              </button>
            ))}
          </div>
          {aiLayout.bottlenecks?.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-[9px] font-bold text-red-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Bottlenecks Detected:</p>
              <div className="flex flex-wrap gap-1">{aiLayout.bottlenecks.map((b, i) => <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{b}</span>)}</div>
            </div>
          )}
          {aiLayout.automation_recommendations?.length > 0 && (
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-[9px] font-bold text-primary mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Automation Recommendations:</p>
              <div className="space-y-0.5">{aiLayout.automation_recommendations.map((r, i) => <p key={i} className="text-[9px] text-muted-foreground flex items-start gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-green-400 flex-shrink-0 mt-0.5" />{r}</p>)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Endless Scroll Sections ─────────────────────────────────── */}
      <div className="px-3 sm:px-4 py-4 space-y-5 pb-24">

        {/* 1. 30-Day Strategy */}
        <div ref={sectionRefs.strategy}>
          <DashSection id="strategy" icon={Target} title="30-Day Launch Strategy" badge="Checklist • AI Priority Analysis • Phase Tracking" color="#d4af37" defaultOpen={true}
            actions={<button onClick={() => scrollTo("orchestrator")} className="text-[9px] text-primary flex items-center gap-1 hover:underline">Next: Orchestrator <ArrowRight className="w-2.5 h-2.5" /></button>}
          >
            <StrategyView />
          </DashSection>
        </div>

        {/* 2. Metrics Overview */}
        <div ref={sectionRefs.metrics}>
          <DashSection id="metrics" icon={BarChart3} title="Live Metrics" badge="Real-time pipeline snapshot" color="#3b82f6" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Total Leads" value={stats.leads} icon={Users} color="#6366f1" trend={5} onClick={() => scrollTo("crm")} sub="Click to open CRM" />
              <MetricCard label="Prospects" value={stats.prospects} icon={Building2} color="#ef4444" onClick={() => scrollTo("discovery")} sub="Company database" />
              <MetricCard label="Active Jobs" value={stats.jobs} icon={HardHat} color="#06b6d4" onClick={() => scrollTo("bidding")} sub="Commercial pipeline" />
              <MetricCard label="Bid Docs" value={stats.bids} icon={FileText} color="#8b5cf6" onClick={() => scrollTo("bidding")} sub="Active bids" />
              <MetricCard label="Calls Made" value={stats.callLogs} icon={Phone} color="#22c55e" onClick={() => scrollTo("call_center")} sub="All logged calls" />
              <MetricCard label="Proposals" value={stats.proposals} icon={Briefcase} color="#f59e0b" onClick={() => scrollTo("bidding")} sub="Sent proposals" />
              <MetricCard label="Open Invoices" value={stats.invoices} icon={DollarSign} color="#ec4899" onClick={() => scrollTo("approvals")} sub="Unpaid invoices" />
              <MetricCard label="Revenue Closed" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="#10b981" trend={12} onClick={() => scrollTo("analytics")} sub="Sold call logs" />
            </div>
            {/* Quick actions bar */}
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                <QuickAction icon={Bot} label="Run AI Scan" color="#d4af37" onClick={generateAiLayout} />
                <QuickAction icon={Phone} label="Call Queue" color="#22c55e" onClick={() => scrollTo("call_center")} badge={callQueue.filter(c => !c.logged).length || null} />
                <QuickAction icon={Mail} label="Email Daily" color="#ec4899" onClick={() => scrollTo("outreach")} />
                <QuickAction icon={FileText} label="New Bid" color="#06b6d4" onClick={() => scrollTo("bidding")} />
                <QuickAction icon={Search} label="Find Jobs" color="#f59e0b" onClick={() => scrollTo("discovery")} />
                <QuickAction icon={CheckCircle2} label="Approvals" color="#10b981" onClick={() => scrollTo("approvals")} badge={stats.proposals || null} />
                <QuickAction icon={BarChart3} label="Analytics" color="#3b82f6" onClick={() => scrollTo("analytics")} />
                <QuickAction icon={Globe} label="Google Suite" color="#4285f4" onClick={() => scrollTo("google")} />
              </div>
            </div>
          </DashSection>
        </div>

        {/* 3. CEO Orchestrator */}
        <div ref={sectionRefs.orchestrator}>
          <DashSection id="orchestrator" icon={Crown} title="CEO Orchestrator" badge="Autonomous operations • AI agent coordination • Full system compile" color="#8b5cf6" defaultOpen={true}
            actions={
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-green-400 flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> Live</span>
              </div>
            }
          >
            <OrchestratorPanel lastLog={null} onRefresh={loadAll} onCompileComplete={(compiled) => { setCallQueue(compiled); }} />
          </DashSection>
        </div>

        {/* 4. AI Workflow Engine */}
        <div ref={sectionRefs.workflow}>
          <DashSection id="workflow" icon={Workflow} title="AI Workflow Engine" badge="Auto-builds optimized workflows from all tools • Zero friction • Double validated" color="#14b8a6" defaultOpen={false}>
            <AutoWorkflowEngine onOpenTool={(view) => { window.scrollTo(0, 0); }} />
          </DashSection>
        </div>

        {/* 5. Operations Database */}
        <div ref={sectionRefs.ops_db}>
          <DashSection id="ops_db" icon={Database} title="Operations Database" badge="Exhaustive overview of every lead, job, company • Searchable • Exportable" color="#ef4444" defaultOpen={false}
            actions={
              <div className="flex items-center gap-1.5">
                <button className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"><Download className="w-3 h-3" /> Export</button>
                <button className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"><Share2 className="w-3 h-3" /> Share</button>
              </div>
            }
          >
            <MasterDatabaseView />
          </DashSection>
        </div>

        {/* 6. CRM */}
        <div ref={sectionRefs.crm}>
          <DashSection id="crm" icon={Users} title="CRM — Contacts & Deals" badge="Full pipeline • AI insights • Sentiment scoring • Google linked" color="#6366f1" defaultOpen={false}
            actions={
              <div className="flex items-center gap-1.5">
                <button className="text-[9px] text-primary hover:underline flex items-center gap-1" onClick={() => scrollTo("call_center")}><Phone className="w-3 h-3" /> Go to Calls</button>
              </div>
            }
          >
            <CRMView />
          </DashSection>
        </div>

        {/* 7. Call Center */}
        <div ref={sectionRefs.call_center}>
          <DashSection id="call_center" icon={Phone} title="Call Center" badge="AI-prioritized queue • Scripts • Logging • Outcome tracking" color="#22c55e" defaultOpen={false}
            actions={<span className="text-[9px] text-green-400 font-bold">{callQueue.filter(c => !c.logged).length} in queue</span>}
          >
            <CallListTab queue={callQueue} callLogs={callLogs} onRefresh={loadAll} />
          </DashSection>
        </div>

        {/* 8. Discovery: Find Jobs, Companies, Contractors */}
        <div ref={sectionRefs.discovery}>
          <DashSection id="discovery" icon={Crosshair} title="Discovery Engine" badge="Find Jobs • Prospect Companies • Find Contractors • AI Scoring • Data Enrichment" color="#f59e0b" defaultOpen={false}>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Search className="w-3.5 h-3.5 text-yellow-400" /> Lead Sniper — Full Discovery System</p>
                <LeadSniperSystem />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-red-400" /> Prospect Company Scraper</p>
                <FindCompaniesView />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><HardHat className="w-3.5 h-3.5 text-blue-400" /> Find Commercial Jobs</p>
                <FindJobsView />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Database className="w-3.5 h-3.5 text-purple-400" /> Prospect Database — Scoring & Enrichment</p>
                <ProspectDatabaseTab prospects={prospects} callLogs={callLogs} onRefresh={loadAll} />
              </div>
            </div>
          </DashSection>
        </div>

        {/* 9. Bid Command Center + GC Pipeline */}
        <div ref={sectionRefs.bidding}>
          <DashSection id="bidding" icon={Briefcase} title="Bid Command Center + GC Pipeline" badge="National average pricing • Competitor intel • Full bid workflow • Auto-pipeline" color="#06b6d4" defaultOpen={false}
            actions={<button onClick={() => scrollTo("takeoff")} className="text-[9px] text-primary flex items-center gap-1 hover:underline">AI Takeoff <ArrowRight className="w-2.5 h-2.5" /></button>}
          >
            <div className="space-y-6">
              <BidPipelineDashboard />
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-cyan-400" /> Full Bid Command Center</p>
                <BidCommandCenter />
              </div>
            </div>
          </DashSection>
        </div>

        {/* 10. Blueprint Takeoff */}
        <div ref={sectionRefs.takeoff}>
          <DashSection id="takeoff" icon={Layers} title="AI Blueprint Takeoff" badge="Full cost out — materials • labor • overhead • profit margin • plans included" color="#a855f7" defaultOpen={false}>
            <BlueprintTakeoffView />
          </DashSection>
        </div>

        {/* 11. Competitor Analysis */}
        <div ref={sectionRefs.competitor}>
          <DashSection id="competitor" icon={TrendingUp} title="Competitor Intelligence" badge="Price benchmarking • Feature comparison • Market positioning" color="#ec4899" defaultOpen={false}>
            <CompetitorComparisonView />
          </DashSection>
        </div>

        {/* 12. Bid Compliance Checker */}
        <div ref={sectionRefs.compliance}>
          <DashSection id="compliance" icon={Shield} title="Bid Compliance Checker" badge="AI validation • Requirements check • Auto-flag missing items" color="#f97316" defaultOpen={false}>
            <ComplianceCheckerView />
          </DashSection>
        </div>

        {/* 13. Human Approval Queue */}
        <div ref={sectionRefs.approvals}>
          <DashSection id="approvals" icon={CheckCircle2} title="Human Approval Queue" badge="National avg pricing • Competitor pricing • AI Takeoff • Full job cost • Profit calculation" color="#10b981" defaultOpen={false}
            actions={<span className="text-[9px] text-yellow-400 font-bold flex items-center gap-1"><Bell className="w-3 h-3" /> {stats.proposals} pending</span>}
          >
            <ApprovalQueueView />
          </DashSection>
        </div>

        {/* 14. Outreach + Email Daily Scan */}
        <div ref={sectionRefs.outreach}>
          <DashSection id="outreach" icon={Mail} title="Outreach Automation + Daily Email Scan" badge="Check email daily for bid requests • Bulk outreach • AI-generated templates • Google linked" color="#ec4899" defaultOpen={false}
            actions={
              <div className="flex items-center gap-1.5">
                <button className="text-[8px] bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> Scan Inbox Now</button>
              </div>
            }
          >
            <div className="space-y-6">
              <EmailTemplatesView />
              <OutreachAutomationView />
            </div>
          </DashSection>
        </div>

        {/* 15. Follow-Up System */}
        <div ref={sectionRefs.followup}>
          <DashSection id="followup" icon={Zap} title="Follow-Up System + Closed Deals" badge="Auto-archive on close • Scraper triggers to keep DB full • AI follow-up chains" color="#eab308" defaultOpen={false}
            actions={<span className="text-[9px] text-yellow-400 font-bold">{followUps.length} pending follow-ups</span>}
          >
            <div className="space-y-5">
              <FollowUpTab callLogs={followUps} queue={callQueue} onRefresh={loadAll} />
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Archive className="w-3.5 h-3.5 text-green-400" /> Closed Deals (Archived)</p>
                <ClosedDealsTab callLogs={closedDeals} onRefresh={loadAll} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> AI Sentiment Analysis</p>
                <SentimentAnalystView />
              </div>
            </div>
          </DashSection>
        </div>

        {/* 16. Branding Studio */}
        <div ref={sectionRefs.branding}>
          <DashSection id="branding" icon={Palette} title="Branding & Media Studio" badge="Brand assets • Social content • Videos • AI image generation" color="#a855f7" defaultOpen={false}>
            <MediaHub />
          </DashSection>
        </div>

        {/* 17. Scheduler */}
        <div ref={sectionRefs.scheduler}>
          <DashSection id="scheduler" icon={Clock} title="Automation Scheduler" badge="Optimized scheduling • Scraper triggers • Email daily scans • Nightly jobs" color="#64748b" defaultOpen={false}>
            <ScraperSchedulerView />
          </DashSection>
        </div>

        {/* 18. Google Suite */}
        <div ref={sectionRefs.google}>
          <DashSection id="google" icon={Globe} title="Google Workspace Integration" badge="Gmail • Drive • Calendar • Sheets — linked to all tools" color="#4285f4" defaultOpen={false}>
            <GoogleSuitePanel />
          </DashSection>
        </div>

        {/* 19. Analytics */}
        <div ref={sectionRefs.analytics}>
          <DashSection id="analytics" icon={PieChart} title="Analytics & Revenue Intelligence" badge="Pipeline charts • Win rates • Revenue forecast • Cost per lead" color="#3b82f6" defaultOpen={false}>
            <PipelineCharts />
          </DashSection>
        </div>

        {/* 20. AI Auto-Enhance */}
        <div ref={sectionRefs.enhance}>
          <DashSection id="enhance" icon={Brain} title="AI System Enhancement" badge="Identifies missing steps • Recommends tools • Self-healing • Workflow hardening" color="#10b981" defaultOpen={false}>
            <AutoEnhanceView />
          </DashSection>
        </div>

        {/* 21. Multi-Dashboard Configurator */}
        <div ref={sectionRefs.configurator}>
          <DashSection id="configurator" icon={Settings} title="Multi-Dashboard Configurator" badge="AI generates multiple configurations until you find your perfect setup" color="#94a3b8" defaultOpen={false}>
            <AutoDashboardConfigurator onApply={() => {}} />
          </DashSection>
        </div>

      </div>

      {/* ── Back to top ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full metallic-gold-bg flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
        >
          <ChevronUp className="w-5 h-5 text-background" />
        </button>
      </div>
    </div>
  );
}