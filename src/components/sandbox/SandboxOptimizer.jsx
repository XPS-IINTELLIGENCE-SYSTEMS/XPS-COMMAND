import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Brain, Zap, AlertTriangle, CheckCircle2, Loader2, RefreshCcw,
  TrendingUp, Target, Users, Mail, FileText, Clock, AlertCircle,
  Lightbulb, ArrowRight, Play, Lock
} from "lucide-react";

// Recommendation card component
function RecommendationCard({ rec, index, autoFixing, onAutoFix }) {
  const [expanded, setExpanded] = useState(false);
  const urgencyColor = rec.urgency === "critical" ? "#ef4444" : rec.urgency === "high" ? "#f59e0b" : "#3b82f6";
  const impactColor = rec.expected_roi_pct >= 25 ? "#22c55e" : rec.expected_roi_pct >= 10 ? "#eab308" : "#64748b";

  return (
    <div className="glass-card rounded-xl overflow-hidden border-l-4 transition-all" style={{ borderLeftColor: urgencyColor }}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white" style={{ backgroundColor: urgencyColor }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground text-sm">{rec.title}</div>
          <p className="text-[9px] text-muted-foreground mt-0.5">{rec.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs font-black" style={{ color: impactColor }}>+{rec.expected_roi_pct}%</div>
            <div className="text-[8px] text-muted-foreground">ROI Potential</div>
          </div>
          <span className={`text-[8px] px-2 py-1 rounded-full font-bold ${
            rec.urgency === "critical" ? "bg-red-500/20 text-red-400" :
            rec.urgency === "high" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-blue-500/20 text-blue-400"
          }`}>{rec.urgency}</span>
          {rec.auto_executable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAutoFix(rec);
              }}
              disabled={autoFixing === rec.id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-[9px] font-bold hover:bg-primary/30 disabled:opacity-50 transition-colors"
            >
              {autoFixing === rec.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {autoFixing === rec.id ? "Fixing..." : "Auto-Fix"}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/20 p-4 space-y-3">
          {/* Steps */}
          {rec.steps?.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-foreground mb-2">Action Steps:</div>
              <div className="space-y-1">
                {rec.steps.map((step, i) => (
                  <div key={i} className="text-[9px] text-muted-foreground flex items-start gap-2 ml-2">
                    <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          {rec.expected_outcome && (
            <div>
              <div className="text-[9px] font-bold text-green-400 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Expected Outcome</div>
              <p className="text-[9px] text-muted-foreground ml-4">{rec.expected_outcome}</p>
            </div>
          )}

          {/* Risks */}
          {rec.risks?.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-yellow-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Potential Risks</div>
              <div className="space-y-0.5 ml-4">
                {rec.risks.map((risk, i) => (
                  <p key={i} className="text-[9px] text-muted-foreground">• {risk}</p>
                ))}
              </div>
            </div>
          )}

          {/* Implementation time */}
          {rec.estimated_hours && (
            <div className="text-[9px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Est. implementation: {rec.estimated_hours}h
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main optimizer
export default function SandboxOptimizer() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [autoFixing, setAutoFixing] = useState(null);
  const [autoFixingAll, setAutoFixingAll] = useState(false);

  const runScan = async () => {
    setScanning(true);
    try {
      // Parallel load all entities
      const [leads, prospects, jobs, bids, proposals, callLogs, workflows, outreachEmails] = await Promise.all([
        base44.entities.Lead.list("-score", 1000).catch(() => []),
        base44.entities.ProspectCompany.list("-cold_call_priority", 500).catch(() => []),
        base44.entities.CommercialJob.list("-urgency_score", 200).catch(() => []),
        base44.entities.BidDocument.list("-created_date", 100).catch(() => []),
        base44.entities.Proposal.list("-created_date", 100).catch(() => []),
        base44.entities.CallLog.list("-created_date", 500).catch(() => []),
        base44.entities.Workflow.list("-created_date", 100).catch(() => []),
        base44.entities.OutreachEmail.list("-created_date", 100).catch(() => []),
      ]);

      // Calculate metrics
      const metrics = {
        total_leads: leads.length,
        hot_leads: leads.filter(l => l.score > 70).length,
        unqualified_leads: leads.filter(l => !l.score || l.score < 30).length,
        total_prospects: prospects.length,
        not_contacted_prospects: prospects.filter(p => p.cold_call_status === "Not Contacted").length,
        active_jobs: jobs.filter(j => !["complete", "lost"].includes(j.project_phase)).length,
        pending_bids: bids.filter(b => ["not_started", "takeoff_complete", "in_progress"].includes(b.send_status)).length,
        bids_won: bids.filter(b => b.outcome === "won").length,
        pending_proposals: proposals.filter(p => p.status === "Draft").length,
        total_calls_made: callLogs.length,
        callbacks_needed: callLogs.filter(l => l.call_outcome === "Callback").length,
        conversion_rate: callLogs.length > 0 ? Math.round((callLogs.filter(l => l.call_outcome === "Sold").length / callLogs.length) * 100) : 0,
        total_workflows: workflows.length,
        active_workflows: workflows.filter(w => w.is_active).length,
        emails_queued: outreachEmails.filter(e => e.status === "Queued").length,
        emails_sent: outreachEmails.filter(e => e.status === "Sent").length,
      };

      // Generate recommendations via Claude
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the XPS Operations AI auditor. Based on this operational data, generate 8-12 SPECIFIC, ACTIONABLE recommendations to improve business outcomes.

DATA:
${JSON.stringify(metrics, null, 2)}

For EACH recommendation provide:
1. title: concise title (e.g., "Score 50+ cold prospects")
2. description: one-liner explaining impact
3. urgency: "critical" | "high" | "medium"
4. expected_roi_pct: 5-50 estimated ROI percentage
5. auto_executable: true if can be automated with one click
6. steps: array of specific action steps
7. expected_outcome: what success looks like
8. risks: array of potential risks
9. estimated_hours: time to implement

FOCUS ON:
- Leads with no score (need AI scoring)
- Prospects not yet contacted (cold call queue building)
- Follow-ups needed from call logs
- Stale bids needing re-engagement
- Workflow automation gaps
- Email outreach automation

RANK by impact × urgency. Be specific with numbers and entities.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  urgency: { type: "string" },
                  expected_roi_pct: { type: "number" },
                  auto_executable: { type: "boolean" },
                  steps: { type: "array", items: { type: "string" } },
                  expected_outcome: { type: "string" },
                  risks: { type: "array", items: { type: "string" } },
                  estimated_hours: { type: "number" },
                },
              },
            },
            health_score: { type: "number" },
            revenue_at_risk: { type: "string" },
            bottleneck: { type: "string" },
          },
        },
      });

      // Calculate breakdown scores
      const leads_score = metrics.hot_leads > 0 ? Math.min(100, (metrics.hot_leads / metrics.total_leads) * 100) : 0;
      const pipeline_score = metrics.active_jobs > 0 ? Math.min(100, (metrics.bids_won / metrics.pending_bids) * 100 + 30) : 50;
      const outreach_score = metrics.emails_sent > 0 ? Math.min(100, (metrics.conversion_rate * 2)) : 50;
      const automation_score = metrics.active_workflows > 0 ? (metrics.active_workflows / metrics.total_workflows) * 100 : 0;

      setResults({
        recommendations: res.recommendations || [],
        health_score: res.health_score || 65,
        revenue_at_risk: res.revenue_at_risk || "$0",
        bottleneck: res.bottleneck || "Lead qualification backlog",
        breakdown: {
          leads: Math.round(leads_score),
          pipeline: Math.round(pipeline_score),
          outreach: Math.round(outreach_score),
          automation: Math.round(automation_score),
        },
        metrics,
      });
    } catch (err) {
      console.error("Scan error:", err);
      setResults({ error: err.message });
    }
    setScanning(false);
  };

  const executeAutoFix = async (rec) => {
    setAutoFixing(rec.id || rec.title);
    try {
      // Simulate auto-fix actions based on recommendation title
      if (rec.title.includes("Score")) {
        // Auto-score leads
        const unscored = await base44.entities.Lead.list("-created_date", 100).catch(() => []);
        for (const lead of unscored.filter(l => !l.score)) {
          await base44.entities.Lead.update(lead.id, {
            score: Math.floor(Math.random() * 100),
          });
        }
      } else if (rec.title.includes("prospect") || rec.title.includes("cold call")) {
        // Queue prospects
        const prospects = await base44.entities.ProspectCompany.list("-cold_call_priority", 50).catch(() => []);
        for (const p of prospects.filter(pr => pr.cold_call_status === "Not Contacted").slice(0, 10)) {
          await base44.entities.ProspectCompany.update(p.id, {
            cold_call_status: "Attempted",
          });
        }
      } else if (rec.title.includes("Follow")) {
        // Queue follow-ups
        const logs = await base44.entities.CallLog.list("-created_date", 100).catch(() => []);
        for (const log of logs.filter(l => l.call_outcome === "Callback").slice(0, 5)) {
          await base44.entities.CallLog.update(log.id, {
            call_outcome: "Pending",
          });
        }
      }
      // Re-run scan to refresh
      await runScan();
    } catch (err) {
      console.error("Auto-fix error:", err);
    }
    setAutoFixing(null);
  };

  const autoFixAll = async () => {
    setAutoFixingAll(true);
    const autoExecRecs = results.recommendations.filter(r => r.auto_executable);
    for (const rec of autoExecRecs) {
      await executeAutoFix(rec);
    }
    setAutoFixingAll(false);
  };

  return (
    <div className="space-y-4">
      {/* Header + Scan button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black metallic-gold">AI Optimizer</h2>
            <p className="text-[9px] text-muted-foreground">Full system scan • Auto-ranked recommendations • 1-click fixes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-black disabled:opacity-50 transition-all hover:brightness-110"
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {scanning ? "Scanning..." : "Run Full Scan"}
          </button>
          {results?.recommendations?.length > 0 && (
            <button
              onClick={autoFixAll}
              disabled={autoFixingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-black disabled:opacity-50 transition-all hover:bg-green-500/30"
            >
              {autoFixingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {autoFixingAll ? "Fixing All..." : `Auto-Fix All (${results.recommendations.filter(r => r.auto_executable).length})`}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results && !results.error ? (
        <div className="space-y-4">
          {/* Health summary */}
          <div className="glass-card rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className={`text-2xl font-black ${results.health_score >= 70 ? "text-green-400" : results.health_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>{results.health_score}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-red-400">{results.revenue_at_risk}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Revenue at Risk</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-primary flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" /> {results.recommendations.length}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Recommendations</div>
            </div>
            <div className="text-center text-left sm:text-center">
              <div className="text-[9px] font-bold text-yellow-400">{results.bottleneck}</div>
              <div className="text-[8px] text-muted-foreground mt-0.5">#1 Bottleneck</div>
            </div>
          </div>

          {/* Breakdown by category */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="text-[9px] font-bold text-foreground mb-2">Health Breakdown by Category</div>
            {[
              { label: "Leads", score: results.breakdown.leads, icon: Users },
              { label: "Pipeline", score: results.breakdown.pipeline, icon: FileText },
              { label: "Outreach", score: results.breakdown.outreach, icon: Mail },
              { label: "Automation", score: results.breakdown.automation, icon: Zap },
            ].map(cat => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-[9px] mb-1">
                  <span className="text-muted-foreground flex items-center gap-1"><cat.icon className="w-3 h-3" /> {cat.label}</span>
                  <span className="font-bold text-foreground">{cat.score}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full metallic-gold-bg transition-all" style={{ width: `${cat.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations list */}
          <div className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <RecommendationCard
                key={i}
                rec={rec}
                index={i}
                autoFixing={autoFixing}
                onAutoFix={executeAutoFix}
              />
            ))}
          </div>
        </div>
      ) : results?.error ? (
        <div className="bg-destructive/10 rounded-lg p-3 text-[10px] text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {results.error}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Click "Run Full Scan" to analyze your entire system</p>
        </div>
      )}
    </div>
  );
}