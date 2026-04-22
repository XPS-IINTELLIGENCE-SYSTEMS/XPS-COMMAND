import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Zap } from "lucide-react";

export default function WorkflowTrigger({ workflow, onSave, onTest }) {
  const [triggerType, setTriggerType] = useState("manual");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [eventTrigger, setEventTrigger] = useState("call_logged");

  const handleSave = async () => {
    const config = {
      trigger: {
        type: triggerType,
        ...(triggerType === "scheduled" && { time: scheduleTime, frequency: scheduleFreq }),
        ...(triggerType === "event" && { event: eventTrigger }),
      },
      workflow,
    };
    onSave(config);
  };

  return (
    <div className="space-y-3 p-3 bg-secondary/20 rounded-lg border border-border">
      <div className="text-sm font-bold text-foreground">Trigger Type</div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="manual"
            checked={triggerType === "manual"}
            onChange={(e) => setTriggerType(e.target.value)}
            className="w-3 h-3"
          />
          <span className="text-xs text-foreground">Manual</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="scheduled"
            checked={triggerType === "scheduled"}
            onChange={(e) => setTriggerType(e.target.value)}
            className="w-3 h-3"
          />
          <span className="text-xs text-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        </label>

        {triggerType === "scheduled" && (
          <div className="ml-5 space-y-2">
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full text-xs px-2 py-1 rounded bg-background border border-border"
            />
            <select
              value={scheduleFreq}
              onChange={(e) => setScheduleFreq(e.target.value)}
              className="w-full text-xs px-2 py-1 rounded bg-background border border-border"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="event"
            checked={triggerType === "event"}
            onChange={(e) => setTriggerType(e.target.value)}
            className="w-3 h-3"
          />
          <span className="text-xs text-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" /> On Event
          </span>
        </label>

        {triggerType === "event" && (
          <div className="ml-5">
            <select
              value={eventTrigger}
              onChange={(e) => setEventTrigger(e.target.value)}
              className="w-full text-xs px-2 py-1 rounded bg-background border border-border"
            >
              <option value="call_logged">Call Logged</option>
              <option value="deal_won">Deal Won</option>
              <option value="follow_up_due">Follow-up Due</option>
              <option value="lead_created">Lead Created</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="flex-1 metallic-gold-bg text-background text-xs font-bold h-8"
        >
          Save Workflow
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onTest}
          className="flex-1 text-xs h-8"
        >
          Test
        </Button>
      </div>
    </div>
  );
}