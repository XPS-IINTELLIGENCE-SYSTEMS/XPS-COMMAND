import { CheckCircle2, AlertTriangle, Users, Clock, Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CollabResultPanel({ result }) {
  if (!result) return null;
  
  if (result.error) {
    return (
      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-xs text-red-400">{typeof result.error === 'string' ? result.error : 'Collaboration failed'}</p>
      </div>
    );
  }

  const { plan_summary, phases, synthesis, duration_ms } = result;
  const totalCorrections = (phases || []).reduce((s, p) => s + (p.corrections_made || 0), 0);

  return (
    <div className="space-y-3">
      {/* Success banner */}
      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-green-400">Multi-Agent Collaboration Complete</span>
        </div>
        <p className="text-[10px] text-green-300/80">{plan_summary}</p>
        <div className="flex gap-3 mt-2">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {(phases || []).flatMap(p => p.agents).length} agent runs</span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> {totalCorrections} self-corrections</span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {((duration_ms || 0) / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Phase breakdown */}
      {(phases || []).map((phase, i) => (
        <div key={i} className="glass-card rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-foreground">Phase {i + 1}: {phase.phase}</span>
            {phase.corrections_made > 0 && (
              <Badge className="text-[7px] px-1 py-0 bg-yellow-500/10 text-yellow-400">
                <AlertTriangle className="w-2 h-2 mr-0.5" /> {phase.corrections_made} corrections
              </Badge>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground mb-1">{phase.objective}</p>
          <div className="flex flex-wrap gap-1">
            {(phase.agents || []).map((a, j) => (
              <div key={j} className={`text-[8px] px-1.5 py-0.5 rounded-md border ${a.confidence >= 80 ? 'border-green-500/30 text-green-400' : a.confidence >= 50 ? 'border-primary/30 text-primary' : 'border-red-500/30 text-red-400'}`}>
                {a.agent} {a.confidence}%{a.self_corrected ? ' ↻' : ''}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Synthesis */}
      {synthesis && (
        <div className="glass-card rounded-lg p-3 border-l-2 border-primary/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground">Final Synthesis</span>
            <Badge className="text-[7px] px-1.5 py-0 bg-primary/10 text-primary ml-auto">
              Quality: {synthesis.overall_quality_score}/100
            </Badge>
          </div>
          <p className="text-[10px] text-foreground/90 whitespace-pre-line">{synthesis.final_output?.substring(0, 800)}</p>
          {synthesis.key_insights?.length > 0 && (
            <div className="mt-2 space-y-0.5">
              <span className="text-[8px] font-bold text-muted-foreground uppercase">Key Insights</span>
              {synthesis.key_insights.map((insight, i) => (
                <p key={i} className="text-[9px] text-muted-foreground">• {insight}</p>
              ))}
            </div>
          )}
          {synthesis.agent_grades?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {synthesis.agent_grades.map((g, i) => (
                <div key={i} className={`text-[8px] px-1.5 py-0.5 rounded-md border ${g.grade >= 80 ? 'border-green-500/30 text-green-400' : g.grade >= 60 ? 'border-primary/30 text-primary' : 'border-red-500/30 text-red-400'}`}>
                  {g.agent}: {g.grade}/100
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}