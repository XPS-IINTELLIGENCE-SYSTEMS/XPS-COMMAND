import { useContext, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Crown, Target, Brain, Zap, Users, Phone, Mail, FileText, BarChart3, Shield,
  Building2, Search, Crosshair, Palette, Calendar, Database, Workflow,
  RefreshCcw, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, TrendingUp,
  Globe, Download, Upload, Share2, Bot, Activity, DollarSign, Clock,
  ArrowRight, Loader2, Star, Wrench, Eye, Play, Settings, Map, List,
  LayoutDashboard, PieChart, Layers, HardHat, Briefcase, Archive, Bell, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MasterDashboardContext, MasterDashboardProvider } from "@/components/context/MasterDashboardContext";
import { base44 } from "@/api/base44Client";

// All the tools imported as embedded sections
import StrategyView from "../components/strategy/StrategyView";
import OrchestratorPanel from "../components/commandhub/OrchestratorPanel";
import AutoWorkflowEngine from "../components/dashboard/AutoWorkflowEngine";
import AutoDashboardConfigurator from "../components/dashboard/AutoDashboardConfigurator";
import CRMView from "../components/dashboard/CRMView";
import CRMIntegrated from "../components/crm/CRMIntegrated";
import CallListTab from "../components/callcenter/CallListTab";
import CallCenterIntegrated from "../components/callcenter/CallCenterIntegrated";
import ProspectDatabaseTab from "../components/callcenter/ProspectDatabaseTab";
import BidCommandCenter from "../components/bidcenter/BidCommandCenter";
import BidPipelineIntegrated from "../components/bidding/BidPipelineIntegrated";
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
import SandboxSystem from "../components/sandbox/SandboxSystem";

// ── Section wrapper component ──────────────────────────────────────────────
function DashSection({ id, icon: SectionIcon, title, badge, color = "#d4af37", children, defaultOpen = true, actions }) {
  const Icon = SectionIcon;
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);

  return (
    <section id={id} ref={ref} className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
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
function MasterDashboardContent() {
  const ctx = useContext(MasterDashboardContext);
  if (!ctx) throw new Error("MasterDashboard must be used inside MasterDashboardProvider");

  const { data, stats, loading, lastRefresh, queue: callQueue, loadAll } = ctx;
  const [activeSection, setActiveSection] = useState(null);
  const [aiLayout, setAiLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(false);

  const sectionRefs = {
    strategy: useRef(null), orchestrator: useRef(null), metrics: useRef(null), workflow: useRef(null),
    ops_db: useRef(null), crm: useRef(null), call_center: useRef(null), discovery: useRef(null),
    bidding: useRef(null), takeoff: useRef(null), competitor: useRef(null), compliance: useRef(null),
    approvals: useRef(null), outreach: useRef(null), followup: useRef(null), branding: useRef(null),
    scheduler: useRef(null), google: useRef(null), analytics: useRef(null), enhance: useRef(null),
    configurator: useRef(null), sandbox: useRef(null),
  };

  const scrollTo = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(key);
  };

  const generateAiLayout = async () => {
    setLayoutLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the XPS Operations AI. Analyze this business data and recommend the optimal dashboard section ORDER and PRIORITY for maximum productivity, minimum friction, and fastest path to revenue:

Stats: ${JSON.stringify(stats)}
Active leads: ${data.leads.filter(l => ["Incoming","Validated","Qualified"].includes(l.stage)).length}
Hot leads: ${data.leads.filter(l => l.score > 70).length}
Follow-up needed: ${data.callLogs.filter(l => ["Callback","No Answer","Voicemail"].includes(l.call_outcome)).length}
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
    } catch (error) {
      if (error.message?.includes('limit') || error.message?.includes('upgrade')) {
        alert('🚨 Integration limit reached for this month. Upgrade your plan to continue using AI features.');
      } else {
        alert('AI optimization unavailable: ' + error.message);
      }
    } finally {
      setLayoutLoading(false);
    }
  };

  const followUps = data.callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome));
  const closedDeals = data.callLogs.filter(l => l.call_outcome === "Sold");
  const totalRevenue = data.callLogs.filter(l => l.call_outcome === "Sold").reduce((s, l) => s + (l.deal_value || 0), 0);

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
    { key: "sandbox", label: "⚡ Sandbox", icon: Activity, color: "#a855f7" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Top Nav ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl metallic-gold-bg flex items-center justify-center flex-shrink-0">
              <Crown className="w-4.5 h-4.5 text-background" />
            </div>
            <div>
              <h1 className="text-base font-black metallic-gold leading-tight">XPS Master Operations Dashboard</h1>
              <p className="text-[9px] text-muted-foreground">Unified • Integrated • Fully Linked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && <span className="text-[9px] text-muted-foreground hidden sm:block">Refreshed {lastRefresh.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}><RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /></Button>
            <Button size="sm" onClick={generateAiLayout} disabled={layoutLoading} className="metallic-gold-bg text-background text-xs font-bold">
              {layoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline ml-1.5">AI Optimize</span>
            </Button>
            <Link to="/dashboard" className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors">← Main</Link>
          </div>
        </div>
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
        <DataQualityBar leads={data.leads} prospects={data.prospects} />
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
              </button>
            ))}
          </div>
          {aiLayout.bottlenecks?.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-[9px] font-bold text-red-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Bottlenecks:</p>
              <div className="flex flex-wrap gap-1">{aiLayout.bottlenecks.map((b, i) => <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{b}</span>)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Sections ────────────────────────────────────────────────────── */}
      <div className="px-3 sm:px-4 py-4 space-y-5 pb-24">

        <div ref={sectionRefs.strategy}>
          <DashSection id="strategy" icon={Target} title="30-Day Launch Strategy" badge="Checklist • AI Priority" color="#d4af37" defaultOpen={true}
            actions={<button onClick={() => scrollTo("orchestrator")} className="text-[9px] text-primary flex items-center gap-1 hover:underline">Next <ArrowRight className="w-2.5 h-2.5" /></button>}
          >
            <StrategyView />
          </DashSection>
        </div>

        <div ref={sectionRefs.metrics}>
          <DashSection id="metrics" icon={BarChart3} title="Live Metrics" badge="Real-time snapshot" color="#3b82f6" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Total Leads" value={stats.leads} icon={Users} color="#6366f1" onClick={() => scrollTo("crm")} />
              <MetricCard label="Prospects" value={stats.prospects} icon={Building2} color="#ef4444" onClick={() => scrollTo("discovery")} />
              <MetricCard label="Active Jobs" value={stats.jobs} icon={HardHat} color="#06b6d4" onClick={() => scrollTo("bidding")} />
              <MetricCard label="Bid Docs" value={stats.bids} icon={FileText} color="#8b5cf6" onClick={() => scrollTo("bidding")} />
              <MetricCard label="Calls Made" value={stats.callLogs} icon={Phone} color="#22c55e" onClick={() => scrollTo("call_center")} />
              <MetricCard label="Proposals" value={stats.proposals} icon={Briefcase} color="#f59e0b" onClick={() => scrollTo("bidding")} />
              <MetricCard label="Open Invoices" value={stats.invoices} icon={DollarSign} color="#ec4899" />
              <MetricCard label="Revenue Closed" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="#10b981" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                <QuickAction icon={Bot} label="AI Scan" color="#d4af37" onClick={generateAiLayout} />
                <QuickAction icon={Phone} label="Calls" color="#22c55e" onClick={() => scrollTo("call_center")} badge={callQueue.filter(c => !c.logged).length || null} />
                <QuickAction icon={Mail} label="Email" color="#ec4899" onClick={() => scrollTo("outreach")} />
                <QuickAction icon={FileText} label="New Bid" color="#06b6d4" onClick={() => scrollTo("bidding")} />
                <QuickAction icon={Search} label="Find Jobs" color="#f59e0b" onClick={() => scrollTo("discovery")} />
                <QuickAction icon={CheckCircle2} label="Approve" color="#10b981" onClick={() => scrollTo("approvals")} />
                <QuickAction icon={BarChart3} label="Analytics" color="#3b82f6" onClick={() => scrollTo("analytics")} />
                <QuickAction icon={Globe} label="Google" color="#4285f4" onClick={() => scrollTo("google")} />
                <QuickAction icon={Sparkles} label="Sandbox" color="#a855f7" onClick={() => scrollTo("sandbox")} />
              </div>
            </div>
          </DashSection>
        </div>

        <div ref={sectionRefs.orchestrator}>
          <DashSection id="orchestrator" icon={Crown} title="CEO Orchestrator" badge="Autonomous operations" color="#8b5cf6">
            <OrchestratorPanel lastLog={null} onRefresh={loadAll} />
          </DashSection>
        </div>

        <div ref={sectionRefs.workflow}>
          <DashSection id="workflow" icon={Workflow} title="AI Workflow Engine" badge="Auto-builds workflows" color="#14b8a6" defaultOpen={false}>
            <AutoWorkflowEngine />
          </DashSection>
        </div>

        <div ref={sectionRefs.ops_db}>
          <DashSection id="ops_db" icon={Database} title="Operations Database" badge="Full data overview" color="#ef4444" defaultOpen={false}>
            <MasterDatabaseView />
          </DashSection>
        </div>

        <div ref={sectionRefs.crm}>
          <DashSection id="crm" icon={Users} title="CRM — Contacts & Deals" badge="Full pipeline" color="#6366f1" defaultOpen={false}>
            <CRMIntegrated />
          </DashSection>
        </div>

        <div ref={sectionRefs.call_center}>
          <DashSection id="call_center" icon={Phone} title="Call Center" badge={`${callQueue.filter(c => !c.logged).length} in queue`} color="#22c55e" defaultOpen={false}>
            <CallCenterIntegrated />
          </DashSection>
        </div>

        <div ref={sectionRefs.discovery}>
          <DashSection id="discovery" icon={Crosshair} title="Discovery Engine" badge="Find • Score • Enrich" color="#f59e0b" defaultOpen={false}>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Search className="w-3.5 h-3.5" /> Lead Sniper</p>
                <LeadSniperSystem />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Find Companies</p>
                <FindCompaniesView />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><HardHat className="w-3.5 h-3.5" /> Find Jobs</p>
                <FindJobsView />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Prospect Database</p>
                <ProspectDatabaseTab prospects={data.prospects} callLogs={data.callLogs} onRefresh={loadAll} />
              </div>
            </div>
          </DashSection>
        </div>

        <div ref={sectionRefs.bidding}>
          <DashSection id="bidding" icon={Briefcase} title="Bid Command Center" badge="National pricing" color="#06b6d4" defaultOpen={false}>
            <div className="space-y-6">
              <BidPipelineIntegrated />
              <BidCommandCenter />
            </div>
          </DashSection>
        </div>

        <div ref={sectionRefs.takeoff}>
          <DashSection id="takeoff" icon={Layers} title="AI Blueprint Takeoff" badge="Full cost out" color="#a855f7" defaultOpen={false}>
            <BlueprintTakeoffView />
          </DashSection>
        </div>

        <div ref={sectionRefs.competitor}>
          <DashSection id="competitor" icon={TrendingUp} title="Competitor Intelligence" badge="Price benchmarking" color="#ec4899" defaultOpen={false}>
            <CompetitorComparisonView />
          </DashSection>
        </div>

        <div ref={sectionRefs.compliance}>
          <DashSection id="compliance" icon={Shield} title="Bid Compliance Checker" badge="AI validation" color="#f97316" defaultOpen={false}>
            <ComplianceCheckerView />
          </DashSection>
        </div>

        <div ref={sectionRefs.approvals}>
          <DashSection id="approvals" icon={CheckCircle2} title="Approval Queue" badge={`${stats.proposals} pending`} color="#10b981" defaultOpen={false}>
            <ApprovalQueueView />
          </DashSection>
        </div>

        <div ref={sectionRefs.outreach}>
          <DashSection id="outreach" icon={Mail} title="Outreach Automation" badge="AI templates • Daily scan" color="#ec4899" defaultOpen={false}>
            <div className="space-y-6">
              <EmailTemplatesView />
              <OutreachAutomationView />
            </div>
          </DashSection>
        </div>

        <div ref={sectionRefs.followup}>
          <DashSection id="followup" icon={Zap} title="Follow-Up System" badge={`${followUps.length} pending`} color="#eab308" defaultOpen={false}>
            <div className="space-y-5">
              <FollowUpTab callLogs={followUps} queue={callQueue} onRefresh={loadAll} />
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Archive className="w-3.5 h-3.5" /> Closed Deals</p>
                <ClosedDealsTab callLogs={closedDeals} onRefresh={loadAll} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Sentiment</p>
                <SentimentAnalystView />
              </div>
            </div>
          </DashSection>
        </div>

        <div ref={sectionRefs.branding}>
          <DashSection id="branding" icon={Palette} title="Branding & Media" badge="Assets • Videos • Content" color="#a855f7" defaultOpen={false}>
            <MediaHub />
          </DashSection>
        </div>

        <div ref={sectionRefs.scheduler}>
          <DashSection id="scheduler" icon={Clock} title="Scheduler" badge="Scraper triggers" color="#64748b" defaultOpen={false}>
            <ScraperSchedulerView />
          </DashSection>
        </div>

        <div ref={sectionRefs.google}>
          <DashSection id="google" icon={Globe} title="Google Workspace" badge="Gmail • Drive • Calendar" color="#4285f4" defaultOpen={false}>
            <GoogleSuitePanel />
          </DashSection>
        </div>

        <div ref={sectionRefs.analytics}>
          <DashSection id="analytics" icon={PieChart} title="Analytics & Revenue" badge="Pipeline • Win rates" color="#3b82f6" defaultOpen={false}>
            <PipelineCharts />
          </DashSection>
        </div>

        <div ref={sectionRefs.enhance}>
          <DashSection id="enhance" icon={Brain} title="AI Enhancement" badge="Self-healing" color="#10b981" defaultOpen={false}>
            <AutoEnhanceView />
          </DashSection>
        </div>

        <div ref={sectionRefs.sandbox}>
          <DashSection id="sandbox" icon={Activity} title="Sandbox — AI Optimizer" badge="Full system scan" color="#a855f7" defaultOpen={true}>
            <SandboxSystem autoRun={false} />
          </DashSection>
        </div>

        <div ref={sectionRefs.configurator}>
          <DashSection id="configurator" icon={Settings} title="Dashboard Configurator" badge="AI generates configs" color="#94a3b8" defaultOpen={false}>
            <AutoDashboardConfigurator />
          </DashSection>
        </div>

      </div>

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

// ── Export with context provider wrapper ────────────────────────────────────
export default function MasterDashboard() {
  return (
    <MasterDashboardProvider>
      <MasterDashboardContent />
    </MasterDashboardProvider>
  );
}

// Re-export context provider for external access
export { MasterDashboardProvider } from "@/components/context/MasterDashboardContext";