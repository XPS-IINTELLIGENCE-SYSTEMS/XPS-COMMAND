import { useState } from "react";
import { Sparkles, Loader2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import NODE_REGISTRY from "../workflow/workflowNodeRegistry";

const allNodeDefs = NODE_REGISTRY.flatMap(c =>
  c.nodes.map(n => ({ ...n, catColor: c.color, category: c.category }))
);

const NODE_TYPE_LIST = allNodeDefs.map(n => `${n.type}: ${n.label} — ${n.desc}`).join("\n");

export default function WorkflowAutoBuilder({ onResult, onCancel }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildWorkflow = async () => {
    if (!goal.trim() || loading) return;
    setLoading(true);
    setError(null);

    const prompt = `You are an AI workflow architect. The user wants to achieve this end result:

"${goal.trim()}"

Build a step-by-step automation workflow using ONLY the following available node types:

${NODE_TYPE_LIST}

Return a JSON array of steps. Each step is an object with:
- "type": the exact node type string from the list above
- "label": a short custom label for this step

Return ONLY the JSON array, no explanation. Pick 3-8 steps that logically achieve the user's goal. Order them in the correct execution sequence.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                label: { type: "string" },
              },
              required: ["type", "label"],
            },
          },
        },
        required: ["steps"],
      },
    });

    const steps = res?.steps || [];
    if (steps.length === 0) {
      setError("Couldn't generate a workflow. Try a more specific goal.");
      setLoading(false);
      return;
    }

    // Map to node objects
    const builtNodes = steps
      .filter(s => allNodeDefs.some(n => n.type === s.type))
      .map(s => ({
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: s.type,
        label: s.label || allNodeDefs.find(n => n.type === s.type)?.label || s.type,
        agent: "",
        config: {},
        on_error: "continue",
      }));

    if (builtNodes.length === 0) {
      setError("No valid steps generated. Try a different goal.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onResult(builtNodes);
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">AI Auto Builder</span>
        <span className="text-[9px] text-muted-foreground">— describe your end result</span>
      </div>

      <div className="flex gap-2">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") buildWorkflow(); }}
          placeholder="e.g. Find 20 leads in Florida, score them, and email the top ones..."
          className="flex-1 glass-input rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          disabled={loading}
        />
        <Button
          size="sm"
          className="h-auto px-4 metallic-gold-bg text-background gap-1.5"
          onClick={buildWorkflow}
          disabled={loading || !goal.trim()}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          Build
        </Button>
      </div>

      {/* Quick goal buttons */}
      {!loading && (
        <div className="flex flex-wrap gap-1.5">
          {[
            "Scrape 25 leads in FL, score & email top ones",
            "Find commercial bids, generate takeoff & send proposal",
            "Research competitors and build SEO content strategy",
            "Bulk enrich all new leads and sync to HubSpot",
            "Morning brief → score leads → auto follow-up stale ones",
            "Scrape contractors in 3 states, profile & send intro packages",
          ].map((g) => (
            <button key={g} onClick={() => { setGoal(g); }} className="px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-[9px] text-muted-foreground hover:text-foreground transition-colors text-left">
              {g}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-[11px] text-muted-foreground">Assembling your workflow...</span>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onCancel} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  );
}