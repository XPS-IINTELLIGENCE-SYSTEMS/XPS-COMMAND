import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import ToolModuleCard from "./ToolModuleCard";

export default function ToolModuleWorkspace({ tools, onBack, onExecute }) {
  const [toolParams, setToolParams] = useState(() => {
    const map = {};
    tools.forEach((t) => { map[t.id] = { ...t.defaultParams }; });
    return map;
  });
  const [activeTools, setActiveTools] = useState(tools.map((t) => t.id));
  const [executing, setExecuting] = useState(false);

  const handleParamChange = (toolId, params) => {
    setToolParams((prev) => ({ ...prev, [toolId]: params }));
  };

  const handleRemove = (toolId) => {
    setActiveTools((prev) => prev.filter((id) => id !== toolId));
  };

  const handleExecute = async () => {
    setExecuting(true);
    const payload = activeTools.map((id) => {
      const tool = tools.find((t) => t.id === id);
      return { id, label: tool?.label, params: toolParams[id] || {} };
    });
    if (onExecute) await onExecute(payload);
    setExecuting(false);
  };

  const visibleTools = tools.filter((t) => activeTools.includes(t.id));

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-white/30">{visibleTools.length} module{visibleTools.length !== 1 ? "s" : ""} loaded</span>
      </div>

      {/* Module Cards */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {visibleTools.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-white/40">All modules removed.</p>
              <button onClick={onBack} className="mt-3 text-xs text-primary hover:underline">
                Go back to select tools
              </button>
            </div>
          ) : (
            visibleTools.map((tool) => (
              <ToolModuleCard
                key={tool.id}
                tool={tool}
                onRemove={handleRemove}
                onParamChange={handleParamChange}
              />
            ))
          )}
        </div>
      </div>

      {/* Execute Bar */}
      {visibleTools.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleExecute}
              disabled={executing}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-base transition-all duration-300",
                executing
                  ? "bg-white/10 text-white/50 cursor-wait"
                  : "metallic-gold-bg text-background hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              )}
            >
              {executing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agent executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Execute {visibleTools.length} Tool{visibleTools.length !== 1 ? "s" : ""}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}