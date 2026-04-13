import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

/**
 * A generic AI tool that takes a prompt and shows the result.
 * Used for tools that don't have a specialized UI yet.
 */
export default function GenericAITool({ toolName, prompt: defaultPrompt, onChatCommand, workflowColor }) {
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt || defaultPrompt || `Run the ${toolName} tool`,
    });
    setResult(res || "");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">INSTRUCTIONS (optional)</label>
        <Textarea value={userPrompt} onChange={e => setUserPrompt(e.target.value)} placeholder={defaultPrompt} rows={3} className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>

      <Button onClick={run} disabled={loading} className="gap-2 w-full" style={{ backgroundColor: workflowColor }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? `Running ${toolName}...` : `Run ${toolName}`}
      </Button>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white font-semibold">RESULT</label>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-xs text-white/40 hover:text-white flex items-center gap-1">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.1] text-sm text-white/80 whitespace-pre-wrap max-h-64 overflow-y-auto">{result}</div>
        </div>
      )}
    </div>
  );
}