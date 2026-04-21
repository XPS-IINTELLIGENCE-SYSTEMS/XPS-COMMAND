import { Brain, Target, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StrategicDecisions({ decisions, improvements, scheduled, risks }) {
  return (
    <div className="space-y-3">
      {/* Strategic Decisions */}
      {decisions && decisions.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" />Strategic Decisions</h3>
          <div className="space-y-2">
            {decisions.map((d, i) => (
              <div key={i} className="border border-purple-500/20 bg-purple-500/5 rounded-lg p-3 text-[10px]">
                <div className="font-bold text-foreground">{d.decision}</div>
                <div className="text-muted-foreground mt-1">{d.reasoning}</div>
                {d.impact && <div className="text-purple-400 mt-1">{d.impact}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-green-400" />Improvements Identified</h3>
          <div className="space-y-2">
            {improvements.map((imp, i) => (
              <div key={i} className="border border-green-500/20 bg-green-500/5 rounded-lg p-3 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{imp.area}</span>
                  <Badge variant="secondary" className="text-[7px]">Improvement</Badge>
                </div>
                <div className="text-muted-foreground mt-1">Current: {imp.current_state}</div>
                <div className="text-green-400 mt-0.5">→ {imp.improvement}</div>
                <div className="text-muted-foreground/70 mt-0.5">Expected: {imp.expected_result}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Self-Scheduled */}
      {scheduled && scheduled.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" />Self-Scheduled Tasks</h3>
          <div className="space-y-1.5">
            {scheduled.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5">
                <Calendar className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{s.task}</div>
                  <div className="text-muted-foreground">{s.agent} · {s.scheduled_time || 'ASAP'}</div>
                  <div className="text-muted-foreground/70">{s.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {risks && risks.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" />Risk Alerts</h3>
          <div className="space-y-1.5">
            {risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}