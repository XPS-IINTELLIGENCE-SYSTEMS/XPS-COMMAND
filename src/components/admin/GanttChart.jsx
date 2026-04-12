import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw } from "lucide-react";
import moment from "moment";

const AGENT_COLORS = {
  lead_gen: "#3b82f6", sales_director: "#22c55e", seo_marketing: "#a855f7",
  social_media: "#ec4899", billing_controller: "#10b981", prediction: "#06b6d4",
  simulation: "#6366f1", validation: "#f59e0b", recommendation: "#f97316",
  code_agent: "#64748b", security: "#ef4444", security_ops: "#f87171",
  logging: "#14b8a6", maintenance: "#6b7280", reputation: "#eab308",
  xps_assistant: "#d4af37", ceo_orchestrator: "#fbbf24", operations: "#8b5cf6",
  hr_ai: "#0ea5e9", unknown: "#94a3b8",
};

function getAgentFromTask(task) {
  const result = task.result || "";
  const match = result.match(/Assigned to:\s*(\w+)/i);
  return match ? match[1] : "unknown";
}

export default function GanttChart() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    const data = await base44.entities.AgentTask.list("-created_date", 100);
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const { timelineStart, timelineEnd, totalHours, rows } = useMemo(() => {
    if (!tasks.length) return { timelineStart: moment(), timelineEnd: moment(), totalHours: 24, rows: [] };
    
    const dates = tasks.map(t => moment(t.created_date));
    const start = moment.min(dates).subtract(1, "hour").startOf("hour");
    const end = moment.max(dates).add(4, "hours").endOf("hour");
    const hours = Math.max(end.diff(start, "hours"), 12);

    // Group by agent
    const agentMap = {};
    tasks.forEach(t => {
      const agent = getAgentFromTask(t);
      if (!agentMap[agent]) agentMap[agent] = [];
      agentMap[agent].push(t);
    });

    const rowData = Object.entries(agentMap).map(([agent, agentTasks]) => ({
      agent,
      tasks: agentTasks.map(t => {
        const created = moment(t.created_date);
        const completed = t.completed_at ? moment(t.completed_at) : created.clone().add(1, "hour");
        const leftPct = (created.diff(start, "minutes") / (hours * 60)) * 100;
        const widthPct = Math.max((completed.diff(created, "minutes") / (hours * 60)) * 100, 1);
        return { ...t, leftPct: Math.max(leftPct, 0), widthPct: Math.min(widthPct, 100 - leftPct), agent };
      }),
    }));

    return { timelineStart: start, timelineEnd: end, totalHours: hours, rows: rowData };
  }, [tasks]);

  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i <= totalHours; i += Math.max(1, Math.floor(totalHours / 12))) {
      markers.push({
        label: timelineStart.clone().add(i, "hours").format("HH:mm"),
        pct: (i / totalHours) * 100,
      });
    }
    return markers;
  }, [timelineStart, totalHours]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Agent Task Timeline</h3>
        <button onClick={loadTasks} className="p-1.5 rounded-lg hover:bg-secondary/50"><RefreshCw className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No tasks yet. Run a swarm command to see the timeline.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card/30">
          {/* Time axis */}
          <div className="relative h-8 border-b border-border bg-secondary/30">
            {hourMarkers.map((m, i) => (
              <div key={i} className="absolute top-0 h-full flex items-center" style={{ left: `${m.pct}%` }}>
                <div className="w-px h-full bg-border" />
                <span className="text-[9px] text-muted-foreground ml-1 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div key={row.agent} className="flex border-b border-border/50 last:border-0">
              <div className="w-32 min-w-[128px] flex items-center gap-2 px-3 py-2 border-r border-border/50 bg-card/50">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AGENT_COLORS[row.agent] || AGENT_COLORS.unknown }} />
                <span className="text-[11px] font-semibold text-foreground truncate">{row.agent}</span>
              </div>
              <div className="flex-1 relative min-h-[36px]">
                {row.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="absolute top-1 h-[28px] rounded-md flex items-center px-2 overflow-hidden cursor-pointer hover:brightness-125 transition-all group"
                    style={{
                      left: `${task.leftPct}%`,
                      width: `${Math.max(task.widthPct, 2)}%`,
                      backgroundColor: AGENT_COLORS[task.agent] || AGENT_COLORS.unknown,
                      opacity: task.status === "Completed" ? 0.6 : task.status === "Failed" ? 0.4 : 0.9,
                    }}
                    title={`${task.task_description}\nStatus: ${task.status}\nPriority: ${task.priority}`}
                  >
                    <span className="text-[9px] font-bold text-white truncate">{task.task_description?.replace("[SWARM] ", "").slice(0, 30)}</span>
                    {/* Dependency arrow hint */}
                    {task.task_description?.includes("[SWARM]") && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r border-white/40" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-3 bg-secondary/20 border-t border-border">
            {rows.map((row) => (
              <div key={row.agent} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: AGENT_COLORS[row.agent] || AGENT_COLORS.unknown }} />
                <span className="text-[9px] text-muted-foreground">{row.agent} ({row.tasks.length})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}