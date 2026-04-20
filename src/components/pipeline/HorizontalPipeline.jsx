import { ChevronRight } from "lucide-react";
import { PIPELINE_PHASES } from "./PipelineConfig";
import PipelineStageCard from "./PipelineStageCard";

export default function HorizontalPipeline({ onStageClick }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-2">
      <div className="flex items-start gap-2 min-w-max px-1">
        {PIPELINE_PHASES.map((phase, pi) => (
          <div key={phase.id} className="flex items-start gap-2">
            {/* Phase column */}
            <div className="flex flex-col gap-2 min-w-[210px] max-w-[210px]">
              {/* Phase header */}
              <div className="px-2 py-1.5 rounded-lg border-l-2" style={{ borderColor: phase.color }}>
                <div className="text-[9px] font-extrabold tracking-widest metallic-gold">PHASE {pi + 1}</div>
                <div className="text-[11px] font-bold text-white mt-0.5">{phase.name.split("—")[1]?.trim() || phase.name}</div>
                <div className="text-[8px] text-gray-400 mt-0.5">{phase.description}</div>
              </div>
              {/* Stage cards */}
              {phase.stages.map(stage => (
                <PipelineStageCard key={stage.id} stage={stage} onClick={onStageClick} />
              ))}
            </div>
            {/* Arrow between phases */}
            {pi < PIPELINE_PHASES.length - 1 && (
              <div className="flex items-center self-center pt-8">
                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}