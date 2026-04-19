import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GitBranch, Plus, Trash2, Play, RefreshCcw, Copy, Clock, Pause, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPageHeader, DataLoading, StatusBadge, EmptyState } from "../shared/DataPageLayout";
import WorkflowBuilder from "./WorkflowBuilder";
import WORKFLOW_TEMPLATES from "./WorkflowTemplates";

const STATUS_COLORS = {
  Draft: "bg-secondary text-muted-foreground",
  Active: "bg-green-500/10 text-green-400",
  Paused: "bg-yellow-500/10 text-yellow-400",
  Completed: "bg-blue-500/10 text-blue-400",
  Failed: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function WorkflowCreatorView() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Workflow.list("-created_date", 100);
    setWorkflows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteWorkflow = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this workflow?")) return;
    await base44.entities.Workflow.delete(id);
    load();
  };

  const duplicateWorkflow = async (e, wf) => {
    e.stopPropagation();
    await base44.entities.Workflow.create({
      name: `${wf.name} (Copy)`,
      description: wf.description,
      trigger: wf.trigger,
      steps: wf.steps,
      status: "Draft",
    });
    load();
  };

  const toggleStatus = async (e, wf) => {
    e.stopPropagation();
    const newStatus = wf.status === "Active" ? "Paused" : "Active";
    await base44.entities.Workflow.update(wf.id, { status: newStatus });
    load();
  };

  const createFromTemplate = async (template) => {
    await base44.entities.Workflow.create({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      steps: JSON.stringify(template.steps),
      status: "Draft",
    });
    load();
  };

  // If editing or creating → show builder
  if (editing || creating) {
    return (
      <WorkflowBuilder
        workflow={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => { setEditing(null); setCreating(false); load(); }}
      />
    );
  }

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <DataPageHeader title="Workflow Builder" subtitle="Drag & drop automation — Zapier-style" count={workflows.length} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Pre-made Templates */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Quick Start Templates</h3>
          <span className="text-xs text-muted-foreground">— click to create</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {WORKFLOW_TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button
                key={i}
                onClick={() => createFromTemplate(tpl)}
                className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-left hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tpl.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: tpl.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{tpl.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tpl.trigger} · {tpl.steps.length} steps
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{tpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing Workflows */}
      {workflows.length === 0 ? (
        <EmptyState icon={GitBranch} message="No workflows yet. Use a template above or create from scratch." />
      ) : (
        <>
          <h3 className="text-sm font-bold text-foreground mb-3">Your Workflows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workflows.map(wf => {
              let stepCount = 0;
              try { stepCount = JSON.parse(wf.steps || "[]").length; } catch {}
              return (
                <div
                  key={wf.id}
                  onClick={() => setEditing(wf)}
                  className="group rounded-xl border border-border bg-card/80 p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{wf.name}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{wf.description || "No description"}</div>
                    </div>
                    <StatusBadge status={wf.status} colorMap={STATUS_COLORS} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> {stepCount} steps</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {wf.trigger || "Manual"}</span>
                    <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> {wf.run_count || 0} runs</span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => toggleStatus(e, wf)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title={wf.status === "Active" ? "Pause" : "Activate"}>
                      {wf.status === "Active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={(e) => duplicateWorkflow(e, wf)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => deleteWorkflow(e, wf.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-red-400" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}