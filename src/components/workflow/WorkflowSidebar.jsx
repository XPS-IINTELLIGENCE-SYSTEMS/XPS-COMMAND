import { useState } from "react";
import { Plus, Bot, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import nodeCategories from "./workflowNodes";

export default function WorkflowSidebar({ onAddNode, agents, setAgents }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", specialty: "", model: "auto" });

  const addAgent = () => {
    if (!newAgent.name.trim()) return;
    setAgents(prev => [...prev, { id: `agent_${Date.now()}`, ...newAgent }]);
    setNewAgent({ name: "", specialty: "", model: "auto" });
    setShowAgentForm(false);
  };

  const removeAgent = (id) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="w-full md:w-56 md:min-w-[224px] border-b md:border-b-0 md:border-r border-border bg-card/50 flex flex-col max-h-[40vh] md:max-h-none md:h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="text-xs font-semibold text-foreground mb-0.5">Node Palette</div>
        <div className="text-[9px] text-muted-foreground">Click to add to workflow</div>
      </div>

      {/* Node categories */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {nodeCategories.map((cat) => (
          <div key={cat.label}>
            <button
              onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-semibold text-foreground/80 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full metallic-silver-bg" />
              {cat.label}
              <ChevronRight className={cn("w-3 h-3 ml-auto transition-transform", expandedCat === cat.label && "rotate-90")} />
            </button>
            {expandedCat === cat.label && (
              <div className="ml-2 space-y-0.5 mt-0.5 mb-1">
                {cat.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => onAddNode(node.type)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/70 transition-colors group"
                    >
                      <Icon className="w-3 h-3 flex-shrink-0 metallic-silver-icon" />
                      <div className="text-left min-w-0">
                        <div className="text-[10px] text-foreground/90 truncate">{node.label}</div>
                        <div className="text-[8px] text-muted-foreground truncate">{node.desc}</div>
                      </div>
                      <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agent Creator */}
      <div className="border-t border-border px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-semibold text-foreground flex items-center gap-1">
            <Bot className="w-3 h-3 metallic-silver-icon" /> Agents ({agents.length})
          </div>
          <button onClick={() => setShowAgentForm(!showAgentForm)} className="p-0.5 rounded hover:bg-secondary">
            <Plus className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {showAgentForm && (
          <div className="space-y-1.5 mb-2 p-2 rounded-lg bg-secondary/50 border border-border">
            <Input
              value={newAgent.name}
              onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
              placeholder="Agent name"
              className="h-7 text-[10px]"
            />
            <Input
              value={newAgent.specialty}
              onChange={(e) => setNewAgent({ ...newAgent, specialty: e.target.value })}
              placeholder="Specialty (e.g. Data Analyst)"
              className="h-7 text-[10px]"
            />
            <select
              value={newAgent.model}
              onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
              className="w-full h-7 text-[10px] bg-secondary border border-border rounded-md px-2 text-white"
            >
              <option value="auto">Auto (Best Available)</option>
              <option value="fast">Fast (Groq)</option>
              <option value="smart">Smart (GPT-4o)</option>
              <option value="deep">Deep Analysis (Claude)</option>
            </select>
            <Button size="sm" className="w-full h-6 text-[9px] metallic-silver-bg text-background border-0 hover:brightness-110" onClick={addAgent}>
              Create Agent
            </Button>
          </div>
        )}

        <div className="space-y-1 max-h-28 overflow-y-auto">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary/30 border border-border">
              <Bot className="w-3 h-3 metallic-silver-icon flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-foreground truncate">{agent.name}</div>
                <div className="text-[8px] text-muted-foreground truncate">{agent.specialty || agent.model}</div>
              </div>
              <button onClick={() => removeAgent(agent.id)} className="p-0.5 rounded hover:bg-destructive/20">
                <Trash2 className="w-2.5 h-2.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}