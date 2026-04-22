import { useState } from "react";
import { ChevronDown, CheckCircle2, Clock, Users, AlertCircle } from "lucide-react";

export default function RefactorRoadmapViewer({ roadmap }) {
  const [expandedPhase, setExpandedPhase] = useState(1);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Timeline Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-black/20 border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Total Duration</div>
          <div className="text-2xl font-bold text-primary mt-2">{roadmap.totalDuration}</div>
        </div>
        <div className="bg-black/20 border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Total Effort</div>
          <div className="text-lg font-bold text-foreground mt-2">{roadmap.totalEffort}</div>
        </div>
        <div className="bg-black/20 border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Team Size</div>
          <div className="text-2xl font-bold text-foreground mt-2">{roadmap.teamSize}</div>
        </div>
        <div className="bg-black/20 border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Phases</div>
          <div className="text-2xl font-bold text-foreground mt-2">{roadmap.phases.length}</div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {roadmap.phases.map(phase => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhase === phase.id}
            onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
          />
        ))}
      </div>

      {/* Risk Mitigation */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Risk Mitigation Strategy
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {roadmap.riskMitigation.map((risk, i) => (
            <div key={i} className="bg-black/20 border border-border rounded-lg p-3">
              <div className="text-sm text-muted-foreground">• {risk}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback Strategy */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Rollback Strategy</h3>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-2">
          {roadmap.rollbackStrategy.map((step, i) => (
            <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-orange-400 font-bold">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ phase, isExpanded, onToggle }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full bg-black/20 hover:bg-black/30 transition-colors p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {phase.id}
          </div>
          <div className="flex-1">
            <div className="font-bold text-foreground">{phase.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{phase.duration} • {phase.startDate}</div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-primary/20 text-primary px-2 py-1 rounded">{phase.tasks?.length || 0} tasks</span>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{phase.successMetrics?.length || 0} metrics</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-border bg-black/10">
          {/* Objectives */}
          <div>
            <h4 className="font-bold text-foreground mb-3">Objectives</h4>
            <ul className="space-y-2">
              {phase.objectives.map((obj, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tasks */}
          {phase.tasks && phase.tasks.length > 0 && (
            <div>
              <h4 className="font-bold text-foreground mb-3">Tasks</h4>
              <div className="space-y-3">
                {phase.tasks.map((task, i) => (
                  <div key={i} className="bg-black/20 rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{task.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">Lead: {task.lead}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">{task.effort}</div>
                        <div className="text-xs text-muted-foreground mt-1">Due: {task.deadline}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {phase.successMetrics && phase.successMetrics.length > 0 && (
            <div>
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Success Criteria
              </h4>
              <ul className="space-y-2">
                {phase.successMetrics.map((metric, i) => (
                  <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                    <span>✓</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies */}
          {phase.dependencies && phase.dependencies.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="text-xs font-bold text-orange-400 mb-2">Dependencies</div>
              <div className="text-sm text-muted-foreground">
                Depends on Phase {phase.dependencies.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}