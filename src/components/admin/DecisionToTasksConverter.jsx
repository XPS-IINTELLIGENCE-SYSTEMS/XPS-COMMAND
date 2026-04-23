import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileSelect from "@/components/mobile/MobileSelect";
import { Zap, CheckCircle2 } from "lucide-react";

export default function DecisionToTasksConverter() {
  const [decision, setDecision] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [tasks, setTasks] = useState([]);

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" }
  ];

  const assigneeOptions = [
    { value: "me", label: "Assign to Me" },
    { value: "team", label: "Team Lead" },
    { value: "auto", label: "Auto-Assign" }
  ];

  const convertToTasks = () => {
    if (!decision.trim()) return;
    const newTask = { id: Date.now(), decision, priority, assignee, created: new Date() };
    setTasks([...tasks, newTask]);
    setDecision("");
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold">Decision to Tasks</h3>
      </div>

      <div className="space-y-3 bg-card border rounded-lg p-4">
        <Input
          value={decision}
          onChange={e => setDecision(e.target.value)}
          placeholder="Enter a business decision..."
          className="text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <MobileSelect
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
            placeholder="Priority"
          />
          <MobileSelect
            value={assignee}
            onChange={setAssignee}
            options={assigneeOptions}
            placeholder="Assignee"
          />
        </div>

        <Button onClick={convertToTasks} className="w-full gap-2">
          <Zap className="w-4 h-4" />
          Convert to Task
        </Button>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Tasks ({tasks.length})</h4>
          {tasks.map(task => (
            <div key={task.id} className="flex items-start gap-2 p-3 bg-card border rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{task.decision}</p>
                <p className="text-[10px] text-muted-foreground">
                  {task.priority} • {task.assignee}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}