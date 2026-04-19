import { X, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import NODE_REGISTRY, { AGENT_REGISTRY, AI_RECOMMENDATIONS } from "./workflowNodeRegistry";

const allNodeDefs = NODE_REGISTRY.flatMap(c => c.nodes);

export default function WorkflowNodeConfigPanel({ node, onUpdate, onClose }) {
  const def = allNodeDefs.find(n => n.type === node.type) || {};
  const params = def.params || [];
  const rec = AI_RECOMMENDATIONS[node.type];
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const askAI = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an XPS workflow optimization AI. For this workflow node: "${def.label}" (${def.desc}), with current config: ${JSON.stringify(node.config || {})}, suggest the optimal configuration parameters and values. Be specific with actual values that work for a flooring/epoxy contractor business. Return a JSON object with suggested_config (key/value pairs) and explanation (short string).`,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_config: { type: "object" },
          explanation: { type: "string" },
        },
      },
    });
    setAiSuggestion(result);
    setAiLoading(false);
  };

  const applyAISuggestion = () => {
    if (aiSuggestion?.suggested_config) {
      onUpdate({ config: { ...node.config, ...aiSuggestion.suggested_config } });
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Configure Step</h3>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type info */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-[11px] text-muted-foreground mb-0.5">Type</div>
          <div className="text-sm font-bold text-foreground">{def.label || node.type}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{def.desc}</div>
          {def.fn && <div className="text-[11px] text-primary mt-1.5 font-mono">fn: {def.fn}</div>}
        </div>

        {/* Custom label */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Custom Label</label>
          <Input
            value={node.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder={def.label}
            className="h-9 text-sm"
          />
        </div>

        {/* Agent assignment */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5 font-medium">
            <Bot className="w-3.5 h-3.5" /> Assign Agent
          </label>
          <select
            value={node.agent || ""}
            onChange={(e) => onUpdate({ agent: e.target.value })}
            className="w-full h-9 text-sm bg-secondary border border-border rounded-md px-2.5 text-foreground"
          >
            <option value="">Auto (System Default)</option>
            {AGENT_REGISTRY.map(a => (
              <option key={a.id} value={a.name}>{a.name} — {a.desc}</option>
            ))}
          </select>
        </div>

        {/* Dynamic parameters */}
        {params.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-bold uppercase tracking-wider">Parameters</label>
            <div className="space-y-3">
              {params.map(p => (
                <div key={p}>
                  <label className="text-xs text-muted-foreground mb-1 block capitalize font-medium">{p.replace(/_/g, " ")}</label>
                  <Input
                    value={node.config?.[p] || ""}
                    onChange={(e) => onUpdate({ config: { ...node.config, [p]: e.target.value } })}
                    placeholder={`Enter ${p.replace(/_/g, " ")}`}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error handling */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">On Error</label>
          <select
            value={node.on_error || "continue"}
            onChange={(e) => onUpdate({ on_error: e.target.value })}
            className="w-full h-9 text-sm bg-secondary border border-border rounded-md px-2.5 text-foreground"
          >
            <option value="continue">Continue to next step</option>
            <option value="stop">Stop workflow</option>
            <option value="retry">Retry (3x)</option>
            <option value="skip">Skip this step</option>
          </select>
        </div>

        {/* AI recommendation */}
        {rec && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase">Recommendation</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">{rec}</p>
          </div>
        )}

        {/* AI auto-config */}
        <Button
          variant="outline"
          size="sm"
          onClick={askAI}
          disabled={aiLoading}
          className="w-full text-xs gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {aiLoading ? "Thinking..." : "AI Suggest Config"}
        </Button>

        {aiSuggestion && (
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-foreground/80 mb-2">{aiSuggestion.explanation}</p>
            {aiSuggestion.suggested_config && (
              <div className="space-y-1 mb-2">
                {Object.entries(aiSuggestion.suggested_config).map(([k, v]) => (
                  <div key={k} className="text-[11px] font-mono text-muted-foreground">
                    <span className="text-foreground">{k}:</span> {String(v)}
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" onClick={applyAISuggestion} className="w-full h-7 text-xs">
              Apply Suggestion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}