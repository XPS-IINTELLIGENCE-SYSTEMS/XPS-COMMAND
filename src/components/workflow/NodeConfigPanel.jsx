import { X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import nodeCategories from "./workflowNodes";

const allNodes = nodeCategories.flatMap(c => c.nodes.map(n => ({ ...n, color: c.color })));

export default function NodeConfigPanel({ node, agents, onUpdate, onClose }) {
  const nodeDef = allNodes.find(n => n.type === node.type) || {};

  return (
    <div className="w-64 border-l border-border bg-card/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-foreground">Configure Node</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Node type info */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-[10px] text-muted-foreground mb-1">Type</div>
          <div className="text-xs text-foreground font-medium">{nodeDef.label || node.type}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{nodeDef.desc}</div>
        </div>

        {/* Label */}
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Custom Label</label>
          <Input
            value={node.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder={nodeDef.label}
            className="h-8 text-xs"
          />
        </div>

        {/* Agent assignment */}
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <Bot className="w-3 h-3" /> Assign Agent
          </label>
          <select
            value={node.agent || ""}
            onChange={(e) => onUpdate({ agent: e.target.value })}
            className="w-full h-8 text-xs bg-secondary border border-border rounded-md px-2 text-white"
          >
            <option value="">Auto (Default Agent)</option>
            {agents.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Type-specific config */}
        {(node.type === "web_scrape" || node.type === "mass_ingest") && (
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Target URLs / Keywords</label>
            <textarea
              value={node.config?.targets || ""}
              onChange={(e) => onUpdate({ config: { ...node.config, targets: e.target.value } })}
              placeholder="Enter URLs or keywords, one per line"
              className="w-full h-20 text-xs bg-secondary border border-border rounded-md p-2 text-white resize-none"
            />
          </div>
        )}

        {(node.type === "condition") && (
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Condition Logic</label>
            <Input
              value={node.config?.condition || ""}
              onChange={(e) => onUpdate({ config: { ...node.config, condition: e.target.value } })}
              placeholder="e.g. score > 80"
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Priority</label>
          <select
            value={node.priority || "normal"}
            onChange={(e) => onUpdate({ priority: e.target.value })}
            className="w-full h-8 text-xs bg-secondary border border-border rounded-md px-2 text-white"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <Button variant="outline" size="sm" className="w-full text-[10px] h-7 metallic-silver-bg text-background border-0 hover:brightness-110" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}