import { useState } from "react";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEFAULT_STAGES = [
  "Surface Prep & Grinding",
  "Crack / Joint Repair",
  "Prime Coat",
  "Base Coat Application",
  "Broadcast / Flake Layer",
  "Top Coat / Seal",
  "Final Inspection",
  "Cleanup & Demob"
];

export default function WorkStageChecklist({ stages, onStagesChange }) {
  const [newStage, setNewStage] = useState("");

  const initDefaults = () => {
    onStagesChange(DEFAULT_STAGES.map(name => ({ name, done: false, completed_at: null })));
  };

  const toggle = (idx) => {
    const updated = stages.map((s, i) =>
      i === idx ? { ...s, done: !s.done, completed_at: !s.done ? new Date().toISOString() : null } : s
    );
    onStagesChange(updated);
  };

  const addStage = () => {
    if (!newStage.trim()) return;
    onStagesChange([...stages, { name: newStage.trim(), done: false, completed_at: null }]);
    setNewStage("");
  };

  const removeStage = (idx) => {
    onStagesChange(stages.filter((_, i) => i !== idx));
  };

  const doneCount = stages.filter(s => s.done).length;
  const pct = stages.length > 0 ? Math.round((doneCount / stages.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> Work Stages
        </h3>
        <span className="text-xs text-white/40">{doneCount}/{stages.length} · {pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {stages.length === 0 ? (
        <Button variant="outline" size="sm" onClick={initDefaults} className="w-full text-xs">
          Load Default Work Stages
        </Button>
      ) : (
        <div className="space-y-1">
          {stages.map((stage, i) => (
            <div key={i}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                stage.done ? "bg-green-500/5 border-green-500/15" : "bg-white/[0.02] border-white/8"
              }`}
            >
              <button onClick={() => toggle(i)} className="flex-shrink-0">
                {stage.done
                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                  : <Circle className="w-5 h-5 text-white/20" />
                }
              </button>
              <span className={`flex-1 text-sm ${stage.done ? "text-white/40 line-through" : "text-white"}`}>
                {stage.name}
              </span>
              {stage.completed_at && (
                <span className="text-[9px] text-white/20">{new Date(stage.completed_at).toLocaleDateString()}</span>
              )}
              <button onClick={() => removeStage(i)} className="p-0.5 rounded hover:bg-white/10 text-white/20 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom stage */}
      <div className="flex gap-2">
        <Input
          value={newStage}
          onChange={e => setNewStage(e.target.value)}
          placeholder="Add custom stage..."
          className="h-8 text-xs bg-white/5 border-white/10"
          onKeyDown={e => e.key === 'Enter' && addStage()}
        />
        <Button size="sm" variant="outline" onClick={addStage} disabled={!newStage.trim()} className="h-8 px-2">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}