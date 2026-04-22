import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCw, Plus, Trash2, Eye, Zap, ChevronDown, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AgenticWorkflowVisualizer() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedWorkflow, setExpandedWorkflow] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: "",
    description: "",
    nodes: [],
    connections: [],
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const result = await base44.entities.Workflow.list();
      setWorkflows(result || []);
    } catch (e) {
      console.error("Failed to load workflows:", e);
    }
    setLoading(false);
  };

  const executeWorkflow = async (workflowId) => {
    setExecuting(workflowId);
    try {
      const result = await base44.functions.invoke("executeWorkflow", {
        workflowId,
        parallelMode: true,
      });
      
      // Update workflow with execution result
      await base44.entities.Workflow.update(workflowId, {
        last_executed: new Date().toISOString(),
        execution_count: (workflows.find(w => w.id === workflowId)?.execution_count || 0) + 1,
      });
      
      setSelectedWorkflow({
        ...selectedWorkflow,
        result,
      });
      
      await loadWorkflows();
    } catch (e) {
      console.error("Workflow execution failed:", e);
    }
    setExecuting(null);
  };

  const createWorkflow = async () => {
    if (!workflowForm.name.trim()) return;
    try {
      const workflow = await base44.entities.Workflow.create({
        name: workflowForm.name,
        nodes: JSON.stringify(workflowForm.nodes),
        connections: JSON.stringify(workflowForm.connections),
        trigger_config: JSON.stringify({ type: "manual" }),
        is_active: true,
        notes: workflowForm.description,
      });
      
      setWorkflowForm({ name: "", description: "", nodes: [], connections: [] });
      setShowCreate(false);
      await loadWorkflows();
    } catch (e) {
      console.error("Failed to create workflow:", e);
    }
  };

  const deleteWorkflow = async (workflowId) => {
    try {
      await base44.entities.Workflow.delete(workflowId);
      await loadWorkflows();
      setSelectedWorkflow(null);
    } catch (e) {
      console.error("Failed to delete workflow:", e);
    }
  };

  const toggleWorkflowStatus = async (workflow) => {
    try {
      await base44.entities.Workflow.update(workflow.id, {
        is_active: !workflow.is_active,
      });
      await loadWorkflows();
    } catch (e) {
      console.error("Failed to update workflow:", e);
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Agentic Workflows</h2>
          <p className="text-xs text-muted-foreground">Visualize, create, and orchestrate agent workflows</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="w-4 h-4" /> New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Workflow name"
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                className="h-20"
              />
              <Button onClick={createWorkflow} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No workflows yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedWorkflow?.id === workflow.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card hover:bg-secondary"
              }`}
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate">{workflow.name}</h3>
                    {workflow.is_active ? (
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  {workflow.notes && (
                    <p className="text-xs text-muted-foreground truncate">{workflow.notes}</p>
                  )}
                  <div className="flex gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span>{workflow.execution_count || 0} executions</span>
                    {workflow.last_executed && (
                      <span>• Last: {new Date(workflow.last_executed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWorkflow(workflow.id);
                    }}
                    disabled={executing === workflow.id}
                  >
                    {executing === workflow.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkflowStatus(workflow);
                    }}
                  >
                    <Pause className="w-3 h-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkflow(workflow.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id);
                    }}
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedWorkflow === workflow.id ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedWorkflow === workflow.id && (
                <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                  <WorkflowVisualization workflow={workflow} />
                  {selectedWorkflow?.id === workflow.id && selectedWorkflow?.result && (
                    <ExecutionResult result={selectedWorkflow.result} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Right Panel: Detailed View */}
      {selectedWorkflow && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base">{selectedWorkflow.name}</h3>
              {selectedWorkflow.notes && (
                <p className="text-xs text-muted-foreground mt-1">{selectedWorkflow.notes}</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => executeWorkflow(selectedWorkflow.id)}
              disabled={executing === selectedWorkflow.id}
            >
              {executing === selectedWorkflow.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Zap className="w-3.5 h-3.5 mr-1.5" />
              )}
              Execute
            </Button>
          </div>

          {/* Workflow Canvas */}
          <div className="border rounded bg-secondary/30 p-3 min-h-[200px]">
            <WorkflowVisualization workflow={selectedWorkflow} />
          </div>

          {/* Execution History */}
          {selectedWorkflow?.result && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-semibold mb-2">Last Execution</h4>
              <ExecutionResult result={selectedWorkflow.result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkflowVisualization({ workflow }) {
  const nodes = workflow.nodes ? JSON.parse(workflow.nodes) : [];
  const connections = workflow.connections ? JSON.parse(workflow.connections) : [];

  return (
    <div className="space-y-2">
      {nodes.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No nodes configured</p>
      ) : (
        <div className="space-y-1">
          {nodes.map((node, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="px-2 py-1 bg-primary/20 rounded text-primary font-medium truncate">
                {node.label || `Node ${idx + 1}`}
              </div>
              {idx < nodes.length - 1 && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      )}
      {connections.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2">
          {connections.length} connections
        </div>
      )}
    </div>
  );
}

function ExecutionResult({ result }) {
  return (
    <div className="bg-secondary/40 rounded p-2 space-y-1 text-xs">
      <div className="flex items-center gap-2">
        {result.success ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-destructive" />
        )}
        <span>{result.message || (result.success ? "Execution successful" : "Execution failed")}</span>
      </div>
      {result.metrics && (
        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <div>Duration: {result.metrics.duration}ms</div>
          {result.metrics.agents_involved && <div>Agents: {result.metrics.agents_involved}</div>}
          {result.metrics.tasks_completed && <div>Tasks: {result.metrics.tasks_completed}</div>}
        </div>
      )}
    </div>
  );
}