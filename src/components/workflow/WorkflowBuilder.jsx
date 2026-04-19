import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import WorkflowToolbar from "./WorkflowToolbar";
import WorkflowNodePalette from "./WorkflowNodePalette";
import WorkflowBuilderCanvas from "./WorkflowBuilderCanvas";

export default function WorkflowBuilder({ workflow, onClose, onSaved }) {
  const isEditing = !!workflow;
  const [name, setName] = useState(workflow?.name || "New Workflow");
  const [description, setDescription] = useState(workflow?.description || "");
  const [trigger, setTrigger] = useState(workflow?.trigger || "Manual");
  const [status, setStatus] = useState(workflow?.status || "Draft");
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes] = useState(() => {
    try { return JSON.parse(workflow?.steps || "[]"); } catch { return []; }
  });

  // Listen for import events
  useEffect(() => {
    const handler = (e) => {
      const imported = e.detail || [];
      setNodes(imported.map((n, i) => ({ ...n, id: n.id || `node_${Date.now()}_${i}` })));
    };
    window.addEventListener("import-workflow-nodes", handler);
    return () => window.removeEventListener("import-workflow-nodes", handler);
  }, []);

  const addNode = useCallback((nodeDef) => {
    setNodes(prev => [...prev, {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: nodeDef.type,
      label: nodeDef.label,
      agent: "",
      config: {},
      on_error: "continue",
    }]);
  }, []);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const payload = {
      name,
      description,
      trigger,
      status,
      steps: JSON.stringify(nodes.map(n => ({
        id: n.id, type: n.type, label: n.label,
        agent: n.agent, config: n.config, on_error: n.on_error,
      }))),
      run_count: workflow?.run_count || 0,
    };
    if (isEditing) {
      await base44.entities.Workflow.update(workflow.id, payload);
    } else {
      await base44.entities.Workflow.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  // Scroll to palette (for mobile "add step" button)
  const scrollToPalette = () => {
    document.getElementById("workflow-palette")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -mx-4 -mt-4">
      <WorkflowToolbar
        workflow={workflow}
        name={name} setName={setName}
        description={description} setDescription={setDescription}
        trigger={trigger} setTrigger={setTrigger}
        status={status} setStatus={setStatus}
        nodes={nodes}
        onSave={handleSave}
        onBack={onClose}
        saving={saving}
      />

      <div className="flex flex-1 overflow-hidden">
        <div id="workflow-palette">
          <WorkflowNodePalette onAddNode={addNode} />
        </div>
        <WorkflowBuilderCanvas
          nodes={nodes}
          setNodes={setNodes}
          onAddNodeClick={scrollToPalette}
        />
      </div>
    </div>
  );
}