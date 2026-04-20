import { useState } from "react";
import { ChevronRight, Zap, Maximize2, Minimize2 } from "lucide-react";
import { PIPELINE_PHASES } from "../pipeline/PipelineConfig";
import PipelineStageCard from "../pipeline/PipelineStageCard";

export default function PipelineBanner({ onOpenFull }) {
  const [expanded, setExpanded] = useState(false);

  // Compact: show phase dots with stage counts
  if (!expanded) {
    return (
      <div className="glass-card rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 metallic-gold-icon" />
            <span className="text-xs font-bold metallic-gold">Pipeline</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(true)} className="p-1 rounded hover:bg-secondary" title="Expand">
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={onOpenFull} className="text-[9px] text-primary hover:text-primary/80 font-medium px-2">
              Full View →
            </button>
          </div>
        </div>
        {/* Compact horizontal phases */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {PIPELINE_PHASES.map((phase, i) => {
            const activeStages = phase.stages.filter(s => s.status === "active").length;
            return (
              <div key={phase.id} className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setExpanded(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color, opacity: activeStages > 0 ? 1 : 0.3 }} />
                  <span className="text-[9px] font-bold text-white whitespace-nowrap">
                    {phase.name.split("—")[1]?.trim() || `Phase ${i + 1}`}
                  </span>
                  <span className="text-[8px] text-muted-foreground">{phase.stages.length}</span>
                </button>
                {i < PIPELINE_PHASES.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/20 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Expanded: show full horizontal pipeline inline
  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">XPS Master Pipeline</span>
          <span className="text-[9px] text-gray-400">{PIPELINE_PHASES.length} phases · {PIPELINE_PHASES.flatMap(p => p.stages).length} stages</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(false)} className="p-1 rounded hover:bg-secondary" title="Collapse">
            <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={onOpenFull} className="text-[9px] text-primary hover:text-primary/80 font-medium px-2">
            Full Page →
          </button>
        </div>
      </div>
      {/* Scrollable horizontal pipeline */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-start gap-2 min-w-max">
          {PIPELINE_PHASES.map((phase, pi) => (
            <div key={phase.id} className="flex items-start gap-1.5">
              <div className="flex flex-col gap-1.5 min-w-[180px] max-w-[180px]">
                <div className="px-2 py-1 rounded border-l-2" style={{ borderColor: phase.color }}>
                  <div className="text-[8px] font-extrabold tracking-widest metallic-gold">STEP {pi + 1}</div>
                  <div className="text-[10px] font-bold text-white">{phase.name.split("—")[1]?.trim()}</div>
                </div>
                {phase.stages.map(stage => (
                  <PipelineStageCard key={stage.id} stage={stage} compact onClick={() => onOpenFull?.()} />
                ))}
              </div>
              {pi < PIPELINE_PHASES.length - 1 && (
                <div className="flex items-center self-center pt-6">
                  <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}