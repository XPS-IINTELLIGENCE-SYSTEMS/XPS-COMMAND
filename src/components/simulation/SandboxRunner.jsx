import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Play, Loader2, CheckCircle2, XCircle, AlertCircle, Clock,
  ChevronDown, ChevronUp, Zap, Brain, Phone, Mail, FileText,
  Database, Users, Target, TrendingUp, Shield, RefreshCcw,
  Building2, Sparkles, BarChart3, AlertTriangle
} from "lucide-react";

// ─── Pipeline step definitions ─────────────────────────────────────────────
const PIPELINE_STEPS = [
  {
    id: "compile",
    label: "Compile & Dedup All Sources",
    icon: Database,
    color: "#d4af37",
    description: "Merge 9 data sources, deduplicate, validate contacts",
    fn: async (b44) => {
      const res = await b44.functions.invoke("compileCallQueue", {});
      const d = res.data?.summary || {};
      return {
        success: true,
        metrics: [
          { label: "Raw Records", value: d.total_before_dedup || 0 },
          { label: "After Dedup", value: d.total_after_dedup || 0 },
          { label: "Dupes Merged", value: d.duplicates_merged || 0 },
          { label: "Ready (Email+Phone)", value: d.with_both || 0 },
        ],
        breakdown: d.validation || {},
        details: `Sources: ${Object.entries(d.sources || {}).map(([k,v]) => `${k}=${v}`).join(", ")}`,
      };
    }
  },
  {
    id: "leads",
    label: "Load Leads Pipeline",
    icon: Users,
    color: "#6366f1",
    description: "Pull top-scored leads from the CRM",
    fn: async (b44) => {
      const leads = await b44.entities.Lead.list("-score", 20).catch(() => []);
      const withContact = leads.filter(l => l.phone || l.email).length;
      const highScore = leads.filter(l => (l.score || 0) >= 70).length;
      return {
        success: true,
        metrics: [
          { label: "Total Leads", value: leads.length },
          { label: "With Contact", value: withContact },
          { label: "Score ≥ 70", value: highScore },
          { label: "Avg Score", value: leads.length ? Math.round(leads.reduce((s,l) => s + (l.score||0), 0) / leads.length) : 0 },
        ],
        details: `Top lead: ${leads[0]?.company || "none"} (score: ${leads[0]?.score || 0})`,
        sample: leads.slice(0, 3).map(l => `${l.company} — ${l.stage}`),
      };
    }
  },
  {
    id: "prospects",
    label: "Load Prospect Database",
    icon: Building2,
    color: "#ef4444",
    description: "Pull prospect companies ready for cold call",
    fn: async (b44) => {
      const prospects = await b44.entities.ProspectCompany.list("-cold_call_priority", 20).catch(() => []);
      const notContacted = prospects.filter(p => p.cold_call_status === "Not Contacted").length;
      return {
        success: true,
        metrics: [
          { label: "Total Prospects", value: prospects.length },
          { label: "Not Contacted", value: notContacted },
          { label: "Contacted", value: prospects.filter(p => p.cold_call_status === "Contacted").length },
          { label: "Interested", value: prospects.filter(p => p.cold_call_status === "Interested").length },
        ],
        details: `Top prospect: ${prospects[0]?.company_name || "none"} (priority: ${prospects[0]?.cold_call_priority || 0})`,
        sample: prospects.slice(0, 3).map(p => `${p.company_name} — ${p.cold_call_status}`),
      };
    }
  },
  {
    id: "call_logs",
    label: "Analyze Call History",
    icon: Phone,
    color: "#22c55e",
    description: "Review call outcomes, conversion rates, follow-ups",
    fn: async (b44) => {
      const logs = await b44.entities.CallLog.list("-created_date", 100).catch(() => []);
      const sold = logs.filter(l => l.call_outcome === "Sold").length;
      const callbacks = logs.filter(l => l.call_outcome === "Callback").length;
      const noAnswer = logs.filter(l => l.call_outcome === "No Answer").length;
      const convRate = logs.length ? Math.round((sold / logs.length) * 100) : 0;
      return {
        success: true,
        metrics: [
          { label: "Total Calls", value: logs.length },
          { label: "Sold", value: sold },
          { label: "Callbacks", value: callbacks },
          { label: "Conv. Rate", value: `${convRate}%` },
        ],
        details: `No Answer: ${noAnswer} | Voicemail: ${logs.filter(l=>l.call_outcome==="Voicemail").length} | Wrong #: ${logs.filter(l=>l.call_outcome==="Wrong Number").length}`,
      };
    }
  },
  {
    id: "outreach",
    label: "Outreach Email Status",
    icon: Mail,
    color: "#ec4899",
    description: "Check queued, sent, opened email campaigns",
    fn: async (b44) => {
      const emails = await b44.entities.OutreachEmail.list("-created_date", 100).catch(() => []);
      const queued = emails.filter(e => e.status === "Queued").length;
      const sent = emails.filter(e => e.status === "Sent").length;
      const opened = emails.filter(e => e.status === "Opened").length;
      return {
        success: true,
        metrics: [
          { label: "Total Emails", value: emails.length },
          { label: "Queued", value: queued },
          { label: "Sent", value: sent },
          { label: "Opened", value: opened },
        ],
        details: `Open rate: ${sent ? Math.round((opened/sent)*100) : 0}% | Replied: ${emails.filter(e=>e.status==="Replied").length}`,
      };
    }
  },
  {
    id: "bids",
    label: "Bid Pipeline Health",
    icon: FileText,
    color: "#06b6d4",
    description: "Check commercial jobs, bids, proposals in pipeline",
    fn: async (b44) => {
      const [jobs, bids, proposals] = await Promise.all([
        b44.entities.CommercialJob.list("-urgency_score", 50).catch(() => []),
        b44.entities.BidDocument.list("-created_date", 50).catch(() => []),
        b44.entities.Proposal.list("-created_date", 50).catch(() => []),
      ]);
      const totalVal = proposals.reduce((s,p) => s + (p.total_value||0), 0);
      const won = bids.filter(b => b.outcome === "won").length;
      return {
        success: true,
        metrics: [
          { label: "Active Jobs", value: jobs.length },
          { label: "Bids Out", value: bids.filter(b=>b.send_status==="sent").length },
          { label: "Proposals", value: proposals.length },
          { label: "Pipeline Value", value: `$${(totalVal/1000).toFixed(0)}k` },
        ],
        details: `Won: ${won} bids | Pending: ${bids.filter(b=>b.outcome==="pending").length} | Lost: ${bids.filter(b=>b.outcome==="lost").length}`,
        sample: jobs.slice(0, 3).map(j => `${j.job_name} — ${j.project_phase}`),
      };
    }
  },
  {
    id: "workflows",
    label: "Workflow Inventory",
    icon: Zap,
    color: "#f59e0b",
    description: "Count and categorize all defined workflows",
    fn: async (b44) => {
      const wfs = await b44.entities.Workflow.list("-created_date", 100).catch(() => []);
      const active = wfs.filter(w => w.status === "active" || w.is_active).length;
      const byCategory = {};
      wfs.forEach(w => { byCategory[w.category || "Custom"] = (byCategory[w.category || "Custom"] || 0) + 1; });
      return {
        success: true,
        metrics: [
          { label: "Total Workflows", value: wfs.length },
          { label: "Active", value: active },
          { label: "Categories", value: Object.keys(byCategory).length },
          { label: "Scheduled", value: wfs.filter(w => w.schedule && w.schedule !== "Manual").length },
        ],
        details: Object.entries(byCategory).map(([k,v]) => `${k}: ${v}`).join(" | "),
      };
    }
  },
  {
    id: "ai_score",
    label: "AI Pipeline Health Score",
    icon: Brain,
    color: "#8b5cf6",
    description: "LLM evaluates the overall system health and readiness",
    fn: async (b44, prevResults) => {
      const summary = prevResults.map(r => `${r.label}: ${r.metrics?.map(m => `${m.label}=${m.value}`).join(", ") || "no data"}`).join("\n");
      const res = await b44.integrations.Core.InvokeLLM({
        prompt: `You are an AI operations auditor for XPS (Xtreme Polishing Systems) flooring business.

Here is the current system pipeline state:
${summary}

Based on this data, evaluate the overall War Room health. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number", description: "0-100 overall health score" },
            status: { type: "string", enum: ["excellent", "good", "needs_attention", "critical"] },
            top_priorities: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            wins: { type: "array", items: { type: "string" } },
            next_actions: { type: "array", items: { type: "string" } },
            revenue_at_risk: { type: "string" },
            opportunity_summary: { type: "string" },
          }
        }
      });
      const d = res;
      return {
        success: true,
        score: d.overall_score || 0,
        status: d.status || "unknown",
        metrics: [
          { label: "Health Score", value: `${d.overall_score || 0}/100` },
          { label: "Status", value: d.status || "—" },
          { label: "Revenue at Risk", value: d.revenue_at_risk || "—" },
          { label: "Top Priority", value: (d.top_priorities || [])[0] || "—" },
        ],
        details: d.opportunity_summary || "",
        priorities: d.top_priorities || [],
        risks: d.risks || [],
        wins: d.wins || [],
        nextActions: d.next_actions || [],
      };
    }
  },
];

// ─── Step Result Card ────────────────────────────────────────────────────────
function StepCard({ step, result, running, index }) {
  const [open, setOpen] = useState(true);
  const Icon = step.icon;
  const statusIcon = running
    ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
    : result?.success
    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
    : <XCircle className="w-4 h-4 text-red-400" />;

  return (
    <div className="glass-card rounded-xl overflow-hidden border-l-4 transition-all" style={{ borderLeftColor: result || running ? step.color : "transparent" }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => result && setOpen(!open)}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ backgroundColor: `${step.color}20`, color: step.color }}>
          {index + 1}
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${step.color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: step.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-foreground">{step.label}</span>
          <p className="text-[9px] text-muted-foreground truncate">{step.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          {result && (open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />)}
        </div>
      </div>

      {/* Animated running state */}
      {running && (
        <div className="px-3 pb-3">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full metallic-gold-bg animate-pulse w-2/3" />
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">Running simulation...</p>
        </div>
      )}

      {/* Result details */}
      {result && open && (
        <div className="border-t border-border/20 p-3 space-y-3">
          {/* Metrics grid */}
          {result.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.metrics.map((m, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${step.color}08` }}>
                  <div className="text-sm font-black" style={{ color: step.color }}>{m.value}</div>
                  <div className="text-[8px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Risk breakdown (compile step) */}
          {result.breakdown && Object.keys(result.breakdown).length > 0 && (
            <div className="flex gap-2 flex-wrap text-[9px]">
              {Object.entries(result.breakdown).map(([k, v]) => (
                <span key={k} className={`px-2 py-0.5 rounded-full font-bold ${
                  k === "clean" ? "bg-green-500/15 text-green-400" :
                  k === "low" ? "bg-yellow-500/15 text-yellow-400" :
                  k === "medium" ? "bg-orange-500/15 text-orange-400" :
                  "bg-red-500/15 text-red-400"
                }`}>{k}: {v}</span>
              ))}
            </div>
          )}

          {/* Details */}
          {result.details && (
            <p className="text-[9px] text-muted-foreground bg-secondary/30 rounded-lg px-2.5 py-1.5">{result.details}</p>
          )}

          {/* Sample list */}
          {result.sample?.length > 0 && (
            <div className="space-y-0.5">
              {result.sample.map((s, i) => (
                <div key={i} className="text-[9px] text-foreground/70 flex items-center gap-1">
                  <span style={{ color: step.color }}>▸</span> {s}
                </div>
              ))}
            </div>
          )}

          {/* AI Score section */}
          {result.score !== undefined && (
            <div className="space-y-2">
              {/* Score bar */}
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className={`font-black ${result.score >= 80 ? "text-green-400" : result.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>{result.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${result.score}%`, backgroundColor: result.score >= 80 ? "#22c55e" : result.score >= 60 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>

              {/* Wins */}
              {result.wins?.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-green-400 mb-1">✅ Wins</div>
                  {result.wins.map((w, i) => <p key={i} className="text-[9px] text-foreground/70 ml-2">• {w}</p>)}
                </div>
              )}

              {/* Risks */}
              {result.risks?.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-red-400 mb-1">⚠️ Risks</div>
                  {result.risks.map((r, i) => <p key={i} className="text-[9px] text-foreground/70 ml-2">• {r}</p>)}
                </div>
              )}

              {/* Top priorities */}
              {result.priorities?.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-primary mb-1">🎯 Priorities</div>
                  {result.priorities.map((p, i) => <p key={i} className="text-[9px] text-foreground/70 ml-2">{i + 1}. {p}</p>)}
                </div>
              )}

              {/* Next actions */}
              {result.nextActions?.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-blue-400 mb-1">⚡ Next Actions</div>
                  {result.nextActions.map((a, i) => <p key={i} className="text-[9px] text-foreground/70 ml-2">• {a}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Sandbox Runner ──────────────────────────────────────────────────────
export default function SandboxRunner() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [results, setResults] = useState({});
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runAll = async () => {
    setRunning(true);
    setDone(false);
    setResults({});
    setCurrentStep(null);
    const start = Date.now();
    const stepResults = [];

    for (const step of PIPELINE_STEPS) {
      setCurrentStep(step.id);
      setElapsed(Math.round((Date.now() - start) / 1000));
      try {
        // For AI score step, pass previous results as context
        const res = step.id === "ai_score"
          ? await step.fn(base44, stepResults)
          : await step.fn(base44);
        const enriched = { ...res, label: step.label };
        stepResults.push(enriched);
        setResults(prev => ({ ...prev, [step.id]: enriched }));
      } catch (err) {
        const errResult = { success: false, error: err.message, label: step.label, metrics: [] };
        stepResults.push(errResult);
        setResults(prev => ({ ...prev, [step.id]: errResult }));
      }
    }

    setCurrentStep(null);
    setRunning(false);
    setDone(true);
    setElapsed(Math.round((Date.now() - start) / 1000));
  };

  const reset = () => { setResults({}); setDone(false); setCurrentStep(null); setElapsed(0); };

  const completedCount = Object.keys(results).length;
  const successCount = Object.values(results).filter(r => r.success).length;
  const aiResult = results["ai_score"];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black metallic-gold">War Room Sandbox</h2>
            <p className="text-[9px] text-muted-foreground">Live step-by-step pipeline test — all 8 stages with real data</p>
          </div>
        </div>
        <div className="flex gap-2">
          {done && <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[10px] text-muted-foreground hover:text-foreground"><RefreshCcw className="w-3 h-3" /> Reset</button>}
          <button
            onClick={runAll}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl metallic-gold-bg text-background text-xs font-black disabled:opacity-60 transition-all hover:brightness-110"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? `Running... (${elapsed}s)` : done ? "Re-Run Full Test" : "▶ Run Full Pipeline Test"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {(running || done) && (
        <div className="glass-card rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <span>{completedCount} / {PIPELINE_STEPS.length} steps complete</span>
            <span>{successCount} passed · {completedCount - successCount} failed</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full metallic-gold-bg transition-all duration-500" style={{ width: `${(completedCount / PIPELINE_STEPS.length) * 100}%` }} />
          </div>
          {done && aiResult?.score !== undefined && (
            <div className="flex items-center gap-2 pt-1">
              <div className={`text-lg font-black ${aiResult.score >= 80 ? "text-green-400" : aiResult.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {aiResult.score}/100
              </div>
              <div>
                <div className="text-[9px] font-bold text-foreground">{aiResult.status?.toUpperCase().replace(/_/g, " ")}</div>
                <div className="text-[8px] text-muted-foreground">Overall War Room Health</div>
              </div>
              <div className="ml-auto text-[9px] text-muted-foreground">{elapsed}s total</div>
            </div>
          )}
        </div>
      )}

      {/* Step cards */}
      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            result={results[step.id]}
            running={currentStep === step.id}
          />
        ))}
      </div>

      {/* Empty state */}
      {!running && !done && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Click "Run Full Pipeline Test" to simulate every War Room stage with live data</p>
        </div>
      )}
    </div>
  );
}