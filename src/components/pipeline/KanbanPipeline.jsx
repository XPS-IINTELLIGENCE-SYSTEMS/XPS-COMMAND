import { PIPELINE_PHASES } from "./PipelineConfig";
import PipelineStageCard from "./PipelineStageCard";

export default function KanbanPipeline({ onStageClick }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-2">
      <div className="flex gap-3 min-w-max px-1">
        {PIPELINE_PHASES.map((phase, pi) => (
          <div key={phase.id} className="w-[260px] flex-shrink-0">
            {/* Column header — GitHub Projects style */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
              <span className="text-[11px] font-bold text-white truncate">{phase.name.split("—")[1]?.trim() || phase.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{phase.stages.length}</span>
            </div>
            {/* Cards */}
            <div className="space-y-2 bg-white/[0.02] rounded-xl p-2 border border-white/[0.04] min-h-[120px]">
              {phase.stages.map(stage => (
                <PipelineStageCard key={stage.id} stage={stage} onClick={onStageClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}