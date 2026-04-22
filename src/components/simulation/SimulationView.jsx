import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Loader2, RefreshCcw, CheckCircle2, AlertCircle, Shield, Zap, TrendingUp, Brain, Wrench, Activity } from "lucide-react";
import SimulationCard from "./SimulationCard";

export default function SimulationView() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(null);
  const [simResults, setSimResults] = useState({});

  useEffect(() => { loadWorkflows(); }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    const wfs = await base44.entities.Workflow.list("-created_date", 100).catch(() => []);
    setWorkflows(wfs);
    setLoading(false);
  };

  const simulateWorkflow = async (wf) => {
    setSimulating(wf.id);
    let steps = [];
    try { steps = JSON.parse(wf.steps || "[]"); } catch {}
    const stepDescs = steps.map((s, i) => `Step ${i + 1}: ${s.label || s.type || s}`).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow simulation engine and quality assurance judge for XPS flooring business automation.

WORKFLOW: "${wf.name}"
DESCRIPTION: ${wf.description || "None"}
TRIGGER: ${wf.trigger || "Manual"}
SCHEDULE: ${wf.schedule || "None"}
CATEGORY: ${wf.category || "Custom"}
STEPS:
${stepDescs || "No steps defined"}

Simulate this workflow end-to-end. For each step, determine:
1. Would it succeed or fail in production?
2. What data does it need?
3. What could go wrong?

Then provide an overall assessment:
- score: 0-100 quality score
- status: "pass", "warning", or "fail"
- issues: array of specific issues found
- fixes: array of specific fixes to apply
- enhancements: array of improvements
- missing_steps: any steps that should be added
- estimated_roi: expected business impact
- risk_level: "low", "medium", "high"
- step_results: array of {step, status, notes} for each step`,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          status: { type: "string" },
          issues: { type: "array", items: { type: "string" } },
          fixes: { type: "array", items: { type: "string" } },
          enhancements: { type: "array", items: { type: "string" } },
          missing_steps: { type: "array", items: { type: "string" } },
          estimated_roi: { type: "string" },
          risk_level: { type: "string" },
          step_results: { type: "array", items: { type: "object", properties: { step: { type: "string" }, status: { type: "string" }, notes: { type: "string" } } } },
        },
      },
    });

    setSimResults(prev => ({ ...prev, [wf.id]: res }));
    setSimulating(null);
  };

  const autoFixWorkflow = async (wf) => {
    const result = simResults[wf.id];
    if (!result || !result.fixes?.length) return;

    setSimulating(wf.id);
    let steps = [];
    try { steps = JSON.parse(wf.steps || "[]"); } catch {}

    // Add missing steps
    if (result.missing_steps?.length) {
      result.missing_steps.forEach(ms => {
        steps.push({ type: "action", label: ms, order: steps.length });
      });
    }

    // Update workflow with fixes applied
    const fixNotes = `[AUTO-FIX ${new Date().toLocaleDateString()}]\nFixes applied:\n${result.fixes.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\nEnhancements:\n${(result.enhancements || []).map((e, i) => `${i + 1}. ${e}`).join("\n")}`;

    await base44.entities.Workflow.update(wf.id, {
      steps: JSON.stringify(steps),
      notes: `${wf.notes || ""}\n\n${fixNotes}`.trim(),
      projected_result: result.estimated_roi || wf.projected_result,
    });

    // Re-simulate to verify fix
    await loadWorkflows();
    const updated = (await base44.entities.Workflow.filter({ id: wf.id }).catch(() => []))[0];
    if (updated) await simulateWorkflow(updated);
    else setSimulating(null);
  };

  const simulateAll = async () => {
    for (const wf of workflows) {
      await simulateWorkflow(wf);
    }
  };

  const overallScore = Object.values(simResults).length > 0
    ? Math.round(Object.values(simResults).reduce((s, r) => s + (r.score || 0), 0) / Object.values(simResults).length)
    : null;

  const passCount = Object.values(simResults).filter(r => r.status === "pass").length;
  const warnCount = Object.values(simResults).filter(r => r.status === "warning").length;
  const failCount = Object.values(simResults).filter(r => r.status === "fail").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-black metallic-gold">Workflow Simulator</h1>
            <p className="text-[11px] text-muted-foreground">Test, score, validate, auto-fix, and harden every workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadWorkflows} disabled={loading} className="p-2 rounded-lg glass-card">
            <RefreshCcw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={simulateAll} disabled={!!simulating || workflows.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold disabled:opacity-50">
            {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Simulate All ({workflows.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      {overallScore !== null && (
        <div className="grid grid-cols-4 gap-2">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className={`text-2xl font-black ${overallScore >= 80 ? "text-green-400" : overallScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{overallScore}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Overall Score</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-green-400">{passCount}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Passed</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-yellow-400">{warnCount}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Warnings</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-red-400">{failCount}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Failed</div>
          </div>
        </div>
      )}

      {/* Workflow list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No workflows to simulate. Create workflows first.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map(wf => (
            <SimulationCard
              key={wf.id}
              workflow={wf}
              result={simResults[wf.id]}
              simulating={simulating === wf.id}
              onSimulate={() => simulateWorkflow(wf)}
              onAutoFix={() => autoFixWorkflow(wf)}
            />
          ))}
        </div>
      )}
    </div>
  );
}