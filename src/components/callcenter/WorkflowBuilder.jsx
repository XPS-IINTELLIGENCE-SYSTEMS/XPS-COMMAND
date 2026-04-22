import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Copy, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkflowCanvas from "./WorkflowCanvas";
import WorkflowTrigger from "./WorkflowTrigger";

export default function WorkflowBuilder({ onClose }) {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const flows = await base44.entities.Workflow.list();
      setWorkflows(flows);
      if (flows.length === 0) createNewWorkflow();
    } catch (error) {
      console.error("Failed to load workflows:", error);
    }
    setLoading(false);
  };

  const createNewWorkflow = () => {
    const newFlow = {
      id: `wf_${Date.now()}`,
      name: "New Workflow",
      nodes: [],
      connections: [],
      trigger: { type: "manual" },
    };
    setActiveWorkflow(newFlow);
  };

  const saveWorkflow = async (config) => {
    if (!activeWorkflow) return;
    setSaving(true);
    try {
      if (activeWorkflow.id?.startsWith("wf_")) {
        // New workflow
        const created = await base44.entities.Workflow.create({
          name: activeWorkflow.name,
          nodes: JSON.stringify(activeWorkflow.nodes),
          connections: JSON.stringify(activeWorkflow.connections),
          trigger_config: JSON.stringify(config.trigger),
        });
        setActiveWorkflow({ ...activeWorkflow, id: created.id });
        setWorkflows([...workflows, created]);
      } else {
        // Update existing
        await base44.entities.Workflow.update(activeWorkflow.id, {
          nodes: JSON.stringify(activeWorkflow.nodes),
          connections: JSON.stringify(activeWorkflow.connections),
          trigger_config: JSON.stringify(config.trigger),
        });
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
    }
    setSaving(false);
  };

  const testWorkflow = async () => {
    if (!activeWorkflow?.nodes?.length) {
      alert("Add nodes to workflow first");
      return;
    }
    setSaving(true);
    try {
      const result = await base44.functions.invoke("executeWorkflow", {
        workflow: activeWorkflow,
        testMode: true,
      });
      alert(`Test passed: ${result.data?.message || "Workflow executed successfully"}`);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    }
    setSaving(false);
  };

  const deleteWorkflow = async (id) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      await base44.entities.Workflow.delete(id);
      setWorkflows(workflows.filter(w => w.id !== id));
      if (activeWorkflow?.id === id) setActiveWorkflow(null);
    } catch (error) {
      console.error("Failed to delete workflow:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 max-h-[90vh] overflow-y-auto">
      {/* Workflow list */}
      <div className="flex gap-2 flex-wrap">
        {workflows.map(wf => (
          <button
            key={wf.id}
            onClick={() => setActiveWorkflow(wf)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
              activeWorkflow?.id === wf.id
                ? "metallic-gold-bg text-background"
                : "glass-card text-foreground hover:bg-secondary"
            }`}
          >
            {wf.name}
          </button>
        ))}
        <button
          onClick={createNewWorkflow}
          className="px-3 py-1.5 text-xs rounded-lg font-medium glass-card text-primary hover:bg-primary/10"
        >
          + New
        </button>
      </div>

      {activeWorkflow && (
        <div className="space-y-4">
          {/* Name editor */}
          <input
            type="text"
            value={activeWorkflow.name}
            onChange={(e) => setActiveWorkflow({ ...activeWorkflow, name: e.target.value })}
            className="w-full text-sm font-bold px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Workflow name"
          />

          {/* Canvas */}
          <WorkflowCanvas
            workflow={activeWorkflow}
            onUpdate={setActiveWorkflow}
            onDelete={deleteWorkflow}
          />

          {/* Trigger config */}
          <WorkflowTrigger
            workflow={activeWorkflow}
            onSave={saveWorkflow}
            onTest={testWorkflow}
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveWorkflow(null)}
              className="text-xs"
            >
              Close
            </Button>
            {activeWorkflow.id && !activeWorkflow.id.startsWith("wf_") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteWorkflow(activeWorkflow.id)}
                className="ml-auto text-destructive text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}