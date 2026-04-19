import { Bot, Play, Pause, Pencil, Trash2, Zap, Brain } from "lucide-react";
import { BRAIN_MODELS } from "./agentBuilderConfig";

export default function AgentFleetCard({ agent, onEdit, onToggle, onDelete }) {
  const caps = safeJson(agent.capabilities);
  const tools = safeJson(agent.tool_access);
  const model = BRAIN_MODELS.find(m => m.id === agent.brain_model);
  const isActive = agent.status === "active";

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isActive ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            <Bot className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground truncate">{agent.name}</h4>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
              isActive ? "bg-green-500/20 text-green-400" :
              agent.status === "paused" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-muted text-muted-foreground"
            }`}>{agent.status}</span>
          </div>
          {agent.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{agent.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground">
              <Brain className="w-2.5 h-2.5" /> {model?.label || agent.brain_model}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground">
              {caps.length} skills
            </span>
            <span className="px-1.5 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground">
              {tools.length} tools
            </span>
            {agent.parallel_enabled && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[9px] text-primary">
                <Zap className="w-2.5 h-2.5" /> Parallel
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground">
              P{agent.fleet_priority || 5}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onToggle(agent)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            title={isActive ? "Pause" : "Activate"}
          >
            {isActive ? <Pause className="w-3.5 h-3.5 text-yellow-400" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
          </button>
          <button onClick={() => onEdit(agent)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(agent)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}

function safeJson(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || "[]"); } catch { return []; }
}