import { useState } from "react";
import { Zap, Loader2, Play, Eye, Check, ChevronDown, ChevronUp, AlertCircle, Sparkles, Clock, GitBranch } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SYSTEM_SCAN_ENTITIES = [
  { name: "Lead", key: "leads", fields: ["stage", "score", "priority", "last_contacted", "lead_type", "bid_stage"] },
  { name: "CommercialJob", key: "jobs", fields: ["project_phase", "bid_status", "urgency_score", "bid_due_date"] },
  { name: "Workflow", key: "workflows", fields: ["status", "category", "run_count"] },
  { name: "AgentTask", key: "tasks", fields: ["status", "task_type", "priority"] },
  { name: "BidDocument", key: "bids", fields: ["send_status", "outcome", "follow_up_count"] },
  { name: "KnowledgeBase", key: "knowledge", fields: ["status", "quality_score"] },
];

function WorkflowCard({ wf, index, onExecute, executing }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = executing === wf.id;

  return (
    <div className={`rounded-xl border transition-all ${wf.executed ? "border-green-500/30 bg-green-500/5" : "border-border/50 bg-secondary/20"}`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg metallic-gold-bg flex items-center justify-center text-[10px] font-black text-background flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground truncate">{wf.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${wf.color || '#d4af37'}18`, color: wf.color || '#d4af37' }}>
              {wf.category}
            </span>
            {wf.priority === "urgent" && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{wf.reason}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {wf.executed ? (
            <span className="flex items-center gap-1 text-[9px] text-green-400"><Check className="w-3 h-3" /> Done</span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onExecute(wf); }}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg metallic-gold-bg text-background text-[10px] font-bold hover:brightness-110 disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {isRunning ? "Running" : "Execute"}
            </button>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {wf.schedule || "On demand"}</span>
            <span className="flex items-center gap-1"><GitBranch className="w-2.5 h-2.5" /> {wf.steps?.length || 0} steps</span>
            {wf.projected_result && <span className="text-green-400">💰 {wf.projected_result}</span>}
          </div>
          <div className="space-y-1">
            {(wf.steps || []).map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[8px] font-bold flex-shrink-0">{i + 1}</div>
                <span className="text-foreground/80">{step}</span>
              </div>
            ))}
          </div>
          {wf.data_basis && (
            <p className="text-[9px] text-muted-foreground italic border-t border-border/20 pt-1">Data basis: {wf.data_basis}</p>
          )}
          {wf.executionResult && (
            <div className={`text-[10px] p-2 rounded-lg ${wf.executionResult.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {wf.executionResult.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AutoWorkflowEngine({ onOpenTool }) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [systemData, setSystemData] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [executeAll, setExecuteAll] = useState(false);
  const [scanSummary, setScanSummary] = useState("");

  const scanSystem = async () => {
    setScanning(true);
    setScanSummary("");
    const data = {};

    const promises = SYSTEM_SCAN_ENTITIES.map(async (entity) => {
      try {
        const records = await base44.entities[entity.name].list("-created_date", 100);
        data[entity.key] = { count: records.length, records: records.slice(0, 50) };
      } catch {
        data[entity.key] = { count: 0, records: [] };
      }
    });
    await Promise.all(promises);
    setSystemData(data);

    // Build summary
    const parts = [];
    if (data.leads?.count > 0) parts.push(`${data.leads.count} leads`);
    if (data.jobs?.count > 0) parts.push(`${data.jobs.count} jobs`);
    if (data.workflows?.count > 0) parts.push(`${data.workflows.count} workflows`);
    if (data.tasks?.count > 0) parts.push(`${data.tasks.count} tasks`);
    if (data.bids?.count > 0) parts.push(`${data.bids.count} bids`);
    if (data.knowledge?.count > 0) parts.push(`${data.knowledge.count} knowledge entries`);
    setScanSummary(parts.join(" · ") || "No data found");

    setScanned(true);
    setScanning(false);
  };

  const generateWorkflows = async () => {
    if (!systemData) return;
    setGenerating(true);

    // Build a context string from system data
    const contextParts = [];
    const leads = systemData.leads?.records || [];
    const staleLeads = leads.filter(l => l.stage === "Incoming" || l.stage === "Validated").length;
    const hotLeads = leads.filter(l => (l.score || 0) > 70).length;
    const coldLeads = leads.filter(l => {
      if (!l.last_contacted) return true;
      return (Date.now() - new Date(l.last_contacted).getTime()) > 14 * 86400000;
    }).length;
    contextParts.push(`Leads: ${leads.length} total, ${staleLeads} in early stages, ${hotLeads} high-score (>70), ${coldLeads} not contacted in 14+ days`);

    const jobs = systemData.jobs?.records || [];
    const activeJobs = jobs.filter(j => !["complete", "lost"].includes(j.project_phase)).length;
    const bidsDue = jobs.filter(j => j.bid_due_date && new Date(j.bid_due_date) > new Date() && new Date(j.bid_due_date) < new Date(Date.now() + 7 * 86400000)).length;
    contextParts.push(`Jobs: ${jobs.length} total, ${activeJobs} active, ${bidsDue} bids due this week`);

    const bids = systemData.bids?.records || [];
    const pendingBids = bids.filter(b => b.outcome === "pending").length;
    const unfollowed = bids.filter(b => b.send_status === "sent" && (b.follow_up_count || 0) === 0).length;
    contextParts.push(`Bids: ${bids.length} total, ${pendingBids} pending response, ${unfollowed} sent with no follow-up`);

    const tasks = systemData.tasks?.records || [];
    const queuedTasks = tasks.filter(t => t.status === "Queued").length;
    contextParts.push(`Tasks: ${tasks.length} total, ${queuedTasks} queued`);

    const knowledge = systemData.knowledge?.records || [];
    const rawKB = knowledge.filter(k => k.status === "Raw").length;
    contextParts.push(`Knowledge: ${knowledge.length} entries, ${rawKB} raw/unprocessed`);

    const prompt = `You are an intelligent workflow automation engine for a flooring contractor business (XPS). Based on the current system data, generate 5-8 high-impact automated workflows that should be created and executed NOW.

CURRENT SYSTEM STATE:
${contextParts.join("\n")}

For each workflow, provide:
- name: Short workflow name
- category: One of Lead Gen, Sales, Bidding, Marketing, Operations, Research
- reason: Why this workflow is needed RIGHT NOW based on the data
- priority: "urgent" or "normal"
- steps: Array of 3-6 step descriptions (what each step does)
- schedule: When it should run (e.g. "Now", "Daily 8am", "Weekly Mon")
- projected_result: Expected outcome
- data_basis: What data triggered this recommendation
- color: Hex color for the category

Focus on actionable workflows that address the SPECIFIC data issues found. Prioritize revenue-generating and time-sensitive workflows first.

Return JSON with key "workflows" containing the array.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" },
                  steps: { type: "array", items: { type: "string" } },
                  schedule: { type: "string" },
                  projected_result: { type: "string" },
                  data_basis: { type: "string" },
                  color: { type: "string" },
                },
              },
            },
          },
        },
      });
      const wfs = (res.workflows || []).map((wf, i) => ({ ...wf, id: `auto_wf_${Date.now()}_${i}`, executed: false }));
      setWorkflows(wfs);
    } catch (err) {
      console.error("Generate workflows error:", err);
    }
    setGenerating(false);
  };

  const executeWorkflow = async (wf) => {
    setExecuting(wf.id);
    try {
      // Save as a Workflow entity
      await base44.entities.Workflow.create({
        name: wf.name,
        description: `${wf.reason}\n\nSteps:\n${wf.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
        status: "Active",
        category: wf.category === "Lead Gen" ? "Lead Gen" :
                  wf.category === "Sales" ? "Sales" :
                  wf.category === "Bidding" ? "Bidding" :
                  wf.category === "Marketing" ? "Marketing" :
                  wf.category === "Research" ? "Research" :
                  wf.category === "Operations" ? "Operations" : "Custom",
        trigger: wf.schedule === "Now" ? "manual" : "schedule",
        schedule: wf.schedule !== "Now" ? wf.schedule : "",
        projected_result: wf.projected_result,
        steps: JSON.stringify(wf.steps.map((s, i) => ({ type: "action", label: s, order: i }))),
      });

      // Mark as executed
      setWorkflows(prev => prev.map(w =>
        w.id === wf.id ? { ...w, executed: true, executionResult: { success: true, summary: `Workflow "${wf.name}" saved & activated.` } } : w
      ));
    } catch (err) {
      setWorkflows(prev => prev.map(w =>
        w.id === wf.id ? { ...w, executionResult: { success: false, summary: `Error: ${err.message}` } } : w
      ));
    }
    setExecuting(null);
  };

  const executeAllWorkflows = async () => {
    setExecuteAll(true);
    for (const wf of workflows) {
      if (!wf.executed) await executeWorkflow(wf);
    }
    setExecuteAll(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Auto Workflow Engine</h2>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Scans your entire system, intelligently generates workflows based on real data, previews them, then executes.</p>

      {/* Step 1: Scan */}
      <div className="flex items-center gap-2">
        <button
          onClick={scanSystem}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold hover:brightness-110 disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
          {scanning ? "Scanning System..." : scanned ? "Re-Scan System" : "1. Scan System Data"}
        </button>
        {scanSummary && <span className="text-[10px] text-muted-foreground">{scanSummary}</span>}
      </div>

      {/* Step 2: Generate */}
      {scanned && (
        <button
          onClick={generateWorkflows}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-primary/30 text-foreground text-xs font-bold hover:bg-secondary/80 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
          {generating ? "AI Analyzing & Generating..." : workflows.length > 0 ? "Re-Generate Workflows" : "2. Generate Smart Workflows"}
        </button>
      )}

      {/* Step 3: Preview & Execute */}
      {workflows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{workflows.length} Workflows Generated</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground">{workflows.filter(w => w.executed).length}/{workflows.length} executed</span>
              <button
                onClick={executeAllWorkflows}
                disabled={executeAll || workflows.every(w => w.executed)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg metallic-gold-bg text-background text-[10px] font-bold disabled:opacity-50"
              >
                {executeAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Execute All
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {workflows.map((wf, i) => (
              <WorkflowCard key={wf.id} wf={wf} index={i} onExecute={executeWorkflow} executing={executing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}