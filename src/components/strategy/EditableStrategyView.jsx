import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Loader2, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const PHASES = ["Foundation", "Activation", "Scale", "Optimize"];

export default function EditableStrategyView({ data, onUpdate, orchestratorRecs, guardianRecs }) {
  const [strategy, setStrategy] = useState(JSON.parse(localStorage.getItem("systemStrategy") || "{}"));
  const [editingDay, setEditingDay] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", category: "", automation: false });
  const [implementing, setImplementing] = useState(false);
  const [completed, setCompleted] = useState(new Set(JSON.parse(localStorage.getItem("strategyCompleted") || "[]")));

  const allRecommendations = [...(orchestratorRecs || []), ...(guardianRecs || [])];

  const saveStrategy = (updated) => {
    setStrategy(updated);
    localStorage.setItem("systemStrategy", JSON.stringify(updated));
  };

  const addTask = (dayKey, phase) => {
    if (!newTask.title.trim()) return;
    const updated = {
      ...strategy,
      [dayKey]: {
        ...(strategy[dayKey] || {}),
        tasks: [...(strategy[dayKey]?.tasks || []), { ...newTask, id: Date.now() }],
      },
    };
    saveStrategy(updated);
    setNewTask({ title: "", category: "", automation: false });
    setEditingDay(null);
  };

  const deleteTask = (dayKey, taskId) => {
    const updated = {
      ...strategy,
      [dayKey]: {
        ...strategy[dayKey],
        tasks: strategy[dayKey].tasks.filter(t => t.id !== taskId),
      },
    };
    saveStrategy(updated);
  };

  const modifyTask = (dayKey, taskId, updates) => {
    const updated = {
      ...strategy,
      [dayKey]: {
        ...strategy[dayKey],
        tasks: strategy[dayKey].tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      },
    };
    saveStrategy(updated);
  };

  const toggleTaskComplete = (taskId) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompleted(newCompleted);
    localStorage.setItem("strategyCompleted", JSON.stringify([...newCompleted]));
  };

  const autoImplementAll = async () => {
    setImplementing(true);
    try {
      const allTasks = Object.values(strategy).flatMap(p => p.tasks || []);
      for (const task of allTasks.filter(t => t.automation)) {
        await base44.functions.invoke("implementStrategyTask", { task });
      }
      alert("✅ All automations queued for implementation");
    } catch (e) {
      alert("Implementation error: " + e.message);
    }
    setImplementing(false);
  };

  const addRecommendationToStrategy = (rec) => {
    const dayKey = `day_${Math.ceil(Math.random() * 30)}`;
    const updated = {
      ...strategy,
      [dayKey]: {
        ...(strategy[dayKey] || {}),
        tasks: [
          ...(strategy[dayKey]?.tasks || []),
          {
            id: Date.now(),
            title: rec.title || rec.area || "Unknown",
            category: rec.urgency || "medium",
            automation: true,
            source: "recommendation",
            fromGuardian: rec.pipeline_health !== undefined,
          },
        ],
      },
    };
    saveStrategy(updated);
  };

  const completion = useMemo(() => {
    const allTasks = Object.values(strategy).flatMap(p => p.tasks || []);
    if (!allTasks.length) return 0;
    return Math.round((completed.size / allTasks.length) * 100);
  }, [strategy, completed]);

  const allTasks = Object.entries(strategy).flatMap(([dayKey, dayData]) =>
    (dayData.tasks || []).map(t => ({ ...t, dayKey }))
  );

  const pendingAutomations = allTasks.filter(t => t.automation && !completed.has(t.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 space-y-3 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black metallic-gold">30-Day Launch Strategy System</h2>
            <p className="text-[9px] text-muted-foreground">Integrated with Guardian & Orchestrator</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{completion}%</div>
            <p className="text-[9px] text-muted-foreground">Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-primary/5 rounded-lg p-2 text-center">
            <div className="text-lg font-black">{allTasks.length}</div>
            <div className="text-[8px] text-muted-foreground">Total Tasks</div>
          </div>
          <div className="bg-green-500/5 rounded-lg p-2 text-center">
            <div className="text-lg font-black text-green-500">{completed.size}</div>
            <div className="text-[8px] text-muted-foreground">Completed</div>
          </div>
          <div className="bg-yellow-500/5 rounded-lg p-2 text-center">
            <div className="text-lg font-black text-yellow-500">{pendingAutomations.length}</div>
            <div className="text-[8px] text-muted-foreground">Automations</div>
          </div>
          <Button
            size="sm"
            onClick={autoImplementAll}
            disabled={implementing || !pendingAutomations.length}
            className="text-[10px] font-bold metallic-gold-bg text-background h-12"
          >
            {implementing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
            Auto-Implement
          </Button>
        </div>
      </div>

      {/* Recommendations Integration */}
      {allRecommendations.length > 0 && (
        <div className="glass-card rounded-xl p-3 space-y-2 bg-blue-500/5 border border-blue-500/20">
          <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1">
            <Brain className="w-3 h-3" /> AI Recommendations ({allRecommendations.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {allRecommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => addRecommendationToStrategy(rec)}
                className="text-[9px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
              >
                <Plus className="w-2.5 h-2.5 inline mr-1" />
                {(rec.title || rec.area || "Task").substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phases */}
      {PHASES.map((phase, phaseIdx) => {
        const phaseTasks = allTasks.filter((_, i) => {
          const dayNum = parseInt(Object.keys(strategy).find(k => strategy[k].tasks?.some(t => t.id === _.id)) || "0").replace("day_", "");
          const daysPerPhase = 7.5;
          return Math.floor(dayNum / daysPerPhase) === phaseIdx;
        });

        return (
          <div key={phase} className="glass-card rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-black metallic-gold">Phase {phaseIdx + 1}: {phase}</h3>
            <div className="space-y-1.5">
              {phaseTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    completed.has(task.id)
                      ? "bg-green-500/10 border-green-500/30 line-through text-muted-foreground"
                      : "bg-secondary/60 border-border hover:border-primary/50"
                  }`}
                >
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    {completed.has(task.id) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 border border-muted-foreground rounded-full" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold text-foreground">{task.title}</div>
                    <div className="text-[8px] text-muted-foreground">{task.category}</div>
                  </div>
                  {task.automation && <Zap className="w-3 h-3 text-yellow-500" />}
                  {task.source === "recommendation" && <Brain className="w-3 h-3 text-blue-400" />}
                  <button
                    onClick={() => deleteTask(task.dayKey, task.id)}
                    className="p-1 rounded hover:bg-destructive/20"
                  >
                    <Trash2 className="w-3 h-3 text-destructive/60" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setEditingPhase(phase)}
              className="w-full text-[9px] py-2 rounded-lg border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Task
            </button>

            {/* Add Task Form */}
            {editingPhase === phase && (
              <div className="border-t border-border pt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-secondary/40 rounded px-2 py-1.5 text-[9px] text-foreground outline-none focus:bg-secondary/60"
                />
                <div className="flex gap-2">
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="flex-1 bg-secondary/40 rounded px-2 py-1 text-[9px] text-foreground outline-none"
                  >
                    <option value="">Category</option>
                    <option value="setup">Setup</option>
                    <option value="training">Training</option>
                    <option value="outreach">Outreach</option>
                    <option value="automation">Automation</option>
                  </select>
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTask.automation}
                      onChange={(e) => setNewTask({ ...newTask, automation: e.target.checked })}
                    />
                    Automate
                  </label>
                  <Button
                    size="sm"
                    onClick={() => addTask(`day_${Math.ceil(Math.random() * 30)}`, phase)}
                    className="text-[9px] h-7"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}