import { ChevronDown } from "lucide-react";
import { PIPELINE_PHASES } from "./PipelineConfig";
import PipelineStageCard from "./PipelineStageCard";

export default function VerticalPipeline({ onStageClick }) {
  return (
    <div className="space-y-4 px-1">
      {PIPELINE_PHASES.map((phase, pi) => (
        <div key={phase.id}>
          {/* Phase header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black metallic-gold-bg text-background">
              {pi + 1}
            </div>
            <div>
              <div className="text-xs font-extrabold metallic-gold tracking-wide">{phase.name}</div>
              <div className="text-[10px] text-gray-400">{phase.description}</div>
            </div>
          </div>

          {/* Stages — vertical with connecting line */}
          <div className="ml-4 border-l border-border/50 pl-4 space-y-2">
            {phase.stages.map((stage, si) => (
              <div key={stage.id} className="relative">
                {/* Dot on line */}
                <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full border-2 border-background"
                  style={{ backgroundColor: stage.color }} />
                <PipelineStageCard stage={stage} compact onClick={onStageClick} />
              </div>
            ))}
          </div>

          {/* Arrow between phases */}
          {pi < PIPELINE_PHASES.length - 1 && (
            <div className="flex justify-center py-1">
              <ChevronDown className="w-5 h-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}