import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileSelect from "@/components/mobile/MobileSelect";
import { Workflow, Plus } from "lucide-react";

export default function WorkflowEnginePanel() {
  const [workflowName, setWorkflowName] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [actionType, setActionType] = useState("email");
  const [workflows, setWorkflows] = useState([]);

  const triggerOptions = [
    { value: "manual", label: "Manual Trigger" },
    { value: "schedule", label: "Scheduled" },
    { value: "event", label: "Event-Based" }
  ];

  const actionOptions = [
    { value: "email", label: "Send Email" },
    { value: "slack", label: "Slack Notification" },
    { value: "task", label: "Create Task" },
    { value: "webhook", label: "Call Webhook" }
  ];

  const createWorkflow = () => {
    if (!workflowName.trim()) return;
    const newWorkflow = {
      id: Date.now(),
      name: workflowName,
      trigger: triggerType,
      action: actionType,
      created: new Date()
    };
    setWorkflows([...workflows, newWorkflow]);
    setWorkflowName("");
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold">Workflow Engine</h3>
      </div>

      <div className="space-y-3 bg-card border rounded-lg p-4">
        <Input
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
          placeholder="Workflow name..."
          className="text-sm"
        />

        <MobileSelect
          value={triggerType}
          onChange={setTriggerType}
          options={triggerOptions}
          placeholder="Trigger Type"
        />

        <MobileSelect
          value={actionType}
          onChange={setActionType}
          options={actionOptions}
          placeholder="Action Type"
        />

        <Button onClick={createWorkflow} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {workflows.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Workflows ({workflows.length})</h4>
          {workflows.map(wf => (
            <div key={wf.id} className="p-3 bg-card border rounded-lg">
              <p className="text-xs font-semibold text-foreground">{wf.name}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-1 rounded">
                  {wf.trigger}
                </span>
                <span className="text-[9px] bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                  {wf.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}