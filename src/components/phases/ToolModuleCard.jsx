import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import ToolIcon from "./ToolIcon";

export default function ToolModuleCard({ tool, onRemove, onParamChange }) {
  const [expanded, setExpanded] = useState(true);
  const [params, setParams] = useState(tool.defaultParams || {});

  const updateParam = (key, value) => {
    const next = { ...params, [key]: value };
    setParams(next);
    if (onParamChange) onParamChange(tool.id, next);
  };

  const paramEntries = Object.entries(params);

  return (
    <div className="rounded-2xl border border-white/15 bg-card/60 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-primary/25 group">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-white/[0.04] to-transparent">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <ToolIcon name={tool.icon} className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">{tool.label}</div>
          <div className="text-[10px] text-white/40">{tool.description}</div>
        </div>
        <div className="flex items-center gap-1">
          {tool.badge && (
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary mr-1">
              {tool.badge}
            </span>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onRemove?.(tool.id)} className="p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Params */}
      {expanded && paramEntries.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {paramEntries.map(([key, value]) => (
              <div key={key}>
                <label className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1 block">
                  {key.replace(/_/g, " ")}
                </label>
                <Input
                  value={value}
                  onChange={(e) => updateParam(key, e.target.value)}
                  placeholder={key.replace(/_/g, " ")}
                  className="h-8 text-xs bg-secondary/30 border-white/10 rounded-lg focus:border-primary/50 text-white placeholder:text-white/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed: mini param preview */}
      {!expanded && paramEntries.length > 0 && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
          {paramEntries.filter(([_, v]) => v).map(([key, value]) => (
            <span key={key} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
              {key.replace(/_/g, " ")}: {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}