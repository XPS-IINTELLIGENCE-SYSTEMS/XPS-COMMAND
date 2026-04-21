import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  GitBranch, Play, Save, Clock, ChevronDown, X, Plus,
  Loader2, Zap, Search, Users, Send, FileText, Bot,
  Database, Briefcase, BarChart3, Shield, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WORKFLOW_ACTIONS = [
  { id: "scrape_leads", label: "Scrape Leads", icon: Search, color: "#d4af37", category: "Discovery" },
  { id: "scrape_jobs", label: "Scrape Jobs", icon: Briefcase, color: "#22c55e", category: "Discovery" },
  { id: "scrape_gc", label: "Scrape GCs", icon: Users, color: "#06b6d4", category: "Discovery" },
  { id: "enrich_leads", label: "Enrich Leads", icon: Database, color: "#8b5cf6", category: "Processing" },
  { id: "score_leads", label: "Score Leads", icon: BarChart3, color: "#f59e0b", category: "Processing" },
  { id: "ai_takeoff", label: "AI Takeoff", icon: Zap, color: "#ef4444", category: "Processing" },
  { id: "send_outreach", label: "Send Outreach", icon: Send, color: "#ec4899", category: "Outreach" },
  { id: "gc_outreach", label: "GC Outreach", icon: Users, color: "#14b8a6", category: "Outreach" },
  { id: "generate_proposal", label: "Generate Proposal", icon: FileText, color: "#6366f1", category: "Outreach" },
  { id: "agent_audit", label: "Agent Audit", icon: Shield, color: "#a855f7", category: "System" },
  { id: "hyper_evolve", label: "Hyper-Evolve", icon: Bot, color: "#d4af37", category: "System" },
  { id: "web_research", label: "Web Research", icon: Globe, color: "#0ea5e9", category: "Research" },
];

const CATEGORIES = ["Discovery", "Processing", "Outreach", "Research", "System"];

export default function QuickWorkflowBar({ onOpenTool }) {
  const [steps, setSteps] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [filterCat, setFilterCat] = useState(null);
  const [workflowName, setWorkflowName] = useState("");

  const addStep = (action) => {
    setSteps((prev) => [...prev, { ...action, stepId: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }]);
    setShowPicker(false);
  };

  const removeStep = (stepId) => {
    setSteps((prev) => prev.filter((s) => s.stepId !== stepId));
  };

  const saveWorkflow = async () => {
    if (steps.length === 0) return;
    setSaving(true);
    await base44.entities.AgentTask.create({
      task_description: `Workflow: ${workflowName || "Quick Workflow"} — Steps: ${steps.map((s) => s.label).join(" → ")}`,
      task_type: "Workflow",
      status: "Queued",
      priority: "Medium",
      result: JSON.stringify({ name: workflowName, steps: steps.map((s) => ({ id: s.id, label: s.label })) }),
    });
    setSaving(false);
    setWorkflowName("");
  };

  const runWorkflow = async () => {
    if (steps.length === 0) return;
    setRunning(true);
    for (const step of steps) {
      try {
        const fnMap = {
          scrape_leads: "dailyLeadScraper",
          scrape_jobs: "aggressiveJobScraper",
          scrape_gc: "aggressiveGCScraper",
          enrich_leads: "validateAndEnrichLead",
          score_leads: "leadScorer",
          ai_takeoff: "batchAITakeoff",
          send_outreach: "massGCOutreach",
          gc_outreach: "gcBidListOutreach",
          generate_proposal: "generateBidPackage",
          agent_audit: "nightlyAutoHeal",
          hyper_evolve: "hyperEvolver",
          web_research: "deepResearch",
        };
        const fnName = fnMap[step.id];
        if (fnName) {
          await base44.functions.invoke(fnName, {}).catch(() => {});
        }
      } catch {}
    }
    setRunning(false);
  };

  const filtered = filterCat
    ? WORKFLOW_ACTIONS.filter((a) => a.category === filterCat)
    : WORKFLOW_ACTIONS;

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 metallic-gold-icon" />
        <span className="text-[13px] font-bold metallic-gold">Quick Workflow Builder</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{steps.length} steps</span>
      </div>

      {/* Steps row */}
      <div className="flex items-center gap-2 flex-wrap min-h-[40px] p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] border-dashed">
        {steps.length === 0 && (
          <span className="text-[10px] text-muted-foreground/50">Click + to add workflow steps</span>
        )}
        {steps.map((step, i) => (
          <div key={step.stepId} className="flex items-center gap-1">
            {i > 0 && <span className="text-[10px] text-muted-foreground">→</span>}
            <Badge
              className="text-[9px] px-2 py-0.5 cursor-pointer hover:opacity-80 group/step"
              style={{ backgroundColor: `${step.color}20`, color: step.color, borderColor: `${step.color}40` }}
            >
              {step.label}
              <button
                onClick={() => removeStep(step.stepId)}
                className="ml-1 opacity-0 group-hover/step:opacity-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          </div>
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-7 h-7 rounded-lg border border-dashed border-primary/30 flex items-center justify-center hover:border-primary/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-primary/60" />
        </button>
      </div>

      {/* Action picker */}
      {showPicker && (
        <div className="border border-border rounded-xl bg-card p-3 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCat(null)}
              className={`text-[9px] px-2 py-1 rounded-lg font-medium transition-colors ${!filterCat ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`text-[9px] px-2 py-1 rounded-lg font-medium transition-colors ${filterCat === c ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => addStep(action)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/30 hover:bg-white/[0.03] transition-all text-left"
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: action.color }} />
                  <span className="text-[10px] font-medium text-foreground truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      {steps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow name..."
            className="flex-1 min-w-[120px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-foreground outline-none focus:border-primary/40"
          />
          <Button size="sm" variant="outline" onClick={saveWorkflow} disabled={saving} className="h-8 text-[10px] gap-1">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
          <Button size="sm" onClick={runWorkflow} disabled={running} className="h-8 text-[10px] gap-1 metallic-gold-bg text-background">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSteps([])}
            className="h-8 text-[10px] text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}