import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPhaseById } from "../../lib/phaseTools";
import ToolIcon from "./ToolIcon";
import { ArrowRight, Check } from "lucide-react";

export default function PhaseToolPicker({ phaseId, onLaunch }) {
  const phase = getPhaseById(phaseId);
  const [selected, setSelected] = useState(new Set());

  if (!phase) return null;

  const toggle = (toolId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const handleLaunch = () => {
    const tools = phase.categories
      .flatMap((c) => c.tools)
      .filter((t) => selected.has(t.id));
    if (tools.length > 0 && onLaunch) onLaunch(tools);
  };

  const totalSelected = selected.size;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Phase Header */}
        <div className="pb-4 md:pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">PHASE {phase.num}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{phase.label}</h1>
          <p className="text-xs text-muted-foreground">Select tools and launch to configure & run them</p>
        </div>

        {/* Categories & Tool Grid */}
        <div className="space-y-8">
          {phase.categories.map((cat) => (
            <div key={cat.title}>
              <div className="mb-3 px-1">
                <h2
                  className="text-sm md:text-base font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {cat.title}
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5">{cat.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {cat.tools.map((tool) => {
                  const isSelected = selected.has(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggle(tool.id)}
                      className={cn(
                        "shimmer-card group relative rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.12)]"
                          : "border-white/10 bg-card/40 hover:border-white/25 hover:bg-card/60"
                      )}
                    >
                      {/* Selection indicator */}
                      <div
                        className={cn(
                          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                          isSelected
                            ? "bg-primary text-background scale-100"
                            : "bg-white/5 border border-white/15 scale-90"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>

                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors",
                          isSelected
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-white/5 border border-white/10 group-hover:border-white/20"
                        )}
                      >
                        <ToolIcon
                          name={tool.icon}
                          className={cn(
                            "w-5 h-5 transition-colors",
                            isSelected ? "text-primary" : "metallic-silver-icon group-hover:text-white/80"
                          )}
                        />
                      </div>

                      <div className="text-xs font-semibold text-white mb-0.5 pr-5">{tool.label}</div>
                      <div className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{tool.description}</div>

                      {tool.badge && (
                        <span
                          className={cn(
                            "inline-block mt-2 text-[8px] font-bold px-2 py-0.5 rounded-full",
                            isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40"
                          )}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Launch Bar */}
        <div
          className={cn(
            "sticky bottom-4 mt-6 transition-all duration-300",
            totalSelected > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <button
            onClick={handleLaunch}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            <span>Launch {totalSelected} Tool{totalSelected !== 1 ? "s" : ""}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}