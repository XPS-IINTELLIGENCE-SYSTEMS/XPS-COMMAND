import { useState, useCallback } from "react";
import { Sparkles, Loader2, ChevronUp, ChevronDown, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PromptEnhancer({ rawInput, onAccept, disabled }) {
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const enhance = useCallback(async () => {
    if (!rawInput?.trim() || enhancing) return;
    setEnhancing(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('promptOptimizer', { raw_input: rawInput });
      setResult(res.data);
      setExpanded(true);
    } catch {
      setResult(null);
    }
    setEnhancing(false);
  }, [rawInput, enhancing]);

  if (!rawInput?.trim() || rawInput.length < 8) return null;

  return (
    <div className="mb-1.5">
      {/* Enhance button */}
      {!result && (
        <button
          onClick={enhance}
          disabled={disabled || enhancing}
          className="flex items-center gap-1 text-[9px] text-primary/70 hover:text-primary transition-colors px-1.5 py-0.5 rounded"
        >
          {enhancing ? (
            <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Optimizing...</>
          ) : (
            <><Sparkles className="w-2.5 h-2.5" /> AI-Enhance Prompt</>
          )}
        </button>
      )}

      {/* Result panel */}
      {result && (
        <div className="glass-card rounded-lg p-2 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary">AI-Enhanced Prompt</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-secondary">
                {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {expanded && (
            <>
              <p className="text-[10px] text-foreground/90 bg-secondary/50 rounded-md p-2 leading-relaxed max-h-24 overflow-y-auto">
                {result.optimized}
              </p>
              <p className="text-[9px] text-muted-foreground italic">
                ✨ {result.improvements}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onAccept(result.optimized); setResult(null); setExpanded(false); }}
                  className="flex items-center gap-1 text-[10px] font-medium text-background bg-primary hover:bg-primary/90 rounded-md px-2.5 py-1 transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Use Enhanced
                </button>
                <button
                  onClick={() => { setResult(null); setExpanded(false); }}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  Keep Original
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}