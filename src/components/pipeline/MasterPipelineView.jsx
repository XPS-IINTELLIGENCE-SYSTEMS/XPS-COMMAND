import { useState } from "react";
import { GitBranch, Rows3, Columns3, LayoutGrid, X, Zap, User, ChevronRight } from "lucide-react";
import { PIPELINE_PHASES, ALL_STAGES, TOTAL_STAGES } from "./PipelineConfig";
import HorizontalPipeline from "./HorizontalPipeline";
import VerticalPipeline from "./VerticalPipeline";
import KanbanPipeline from "./KanbanPipeline";
import PipelineStageDetail from "./PipelineStageDetail";

const VIEW_MODES = [
  { id: "horizontal", label: "Horizontal", icon: Columns3 },
  { id: "vertical", label: "Vertical", icon: Rows3 },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
];

export default function MasterPipelineView() {
  const [viewMode, setViewMode] = useState("horizontal");
  const [selectedStage, setSelectedStage] = useState(null);

  const activeCount = ALL_STAGES.filter(s => s.status === "active").length;
  const automatedCount = ALL_STAGES.filter(s => s.type === "automated").length;
  const manualCount = ALL_STAGES.filter(s => s.type === "manual").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold metallic-gold tracking-tight">XPS Master Pipeline</h1>
          <p className="text-xs text-gray-400 mt-1">Contractor Acquisition → Bid → Close → Operations → Retention</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="flex gap-3 mr-3">
            <div className="text-center">
              <div className="text-sm font-bold text-white">{PIPELINE_PHASES.length}</div>
              <div className="text-[9px] text-gray-400">Phases</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{TOTAL_STAGES}</div>
              <div className="text-[9px] text-gray-400">Stages</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-400">{activeCount}</div>
              <div className="text-[9px] text-gray-400">Active</div>
            </div>
            <div className="flex items-center gap-1 text-center">
              <Zap className="w-3 h-3 text-yellow-400" />
              <div>
                <div className="text-sm font-bold text-yellow-400">{automatedCount}</div>
                <div className="text-[9px] text-gray-400">Auto</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-center">
              <User className="w-3 h-3 text-blue-400" />
              <div>
                <div className="text-sm font-bold text-blue-400">{manualCount}</div>
                <div className="text-[9px] text-gray-400">Manual</div>
              </div>
            </div>
          </div>
          {/* View toggle */}
          <div className="flex bg-secondary/50 rounded-lg p-0.5">
            {VIEW_MODES.map(v => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md font-medium transition-all ${viewMode === v.id ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-white"}`}>
                  <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="flex gap-1">
        {PIPELINE_PHASES.map((phase, i) => (
          <div key={phase.id} className="flex-1 group relative">
            <div className="h-1.5 rounded-full transition-all" style={{
              backgroundColor: phase.stages.some(s => s.status === "active") ? phase.color : "rgba(255,255,255,0.06)",
              opacity: phase.stages.some(s => s.status === "active") ? 1 : 0.4,
            }} />
            <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-background border border-border rounded px-2 py-0.5 text-[8px] text-white whitespace-nowrap z-10 transition-opacity">
              Phase {i + 1}: {phase.name.split("—")[1]?.trim()}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline view */}
      <div className="glass-card rounded-xl p-4">
        {viewMode === "horizontal" && <HorizontalPipeline onStageClick={setSelectedStage} />}
        {viewMode === "vertical" && <VerticalPipeline onStageClick={setSelectedStage} />}
        {viewMode === "kanban" && <KanbanPipeline onStageClick={setSelectedStage} />}
      </div>

      {/* Stage detail modal */}
      {selectedStage && (
        <PipelineStageDetail stage={selectedStage} onClose={() => setSelectedStage(null)} />
      )}
    </div>
  );
}