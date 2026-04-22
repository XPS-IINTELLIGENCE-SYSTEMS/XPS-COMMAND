import { CheckCircle2, Circle, Zap, Clock, Wrench, Play } from "lucide-react";

const CAT_COLORS = { Fix: "#ef4444", Launch: "#22c55e", Optimize: "#3b82f6", Review: "#8b5cf6" };
const PRIORITY_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#6b7280" };

export default function StrategyDayCard({ day, completed, onToggle, phaseColor }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${completed ? "bg-green-500/5 border border-green-500/20" : "bg-secondary/20 border border-transparent hover:border-border"}`}>
      <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-background flex-shrink-0" style={{ backgroundColor: phaseColor }}>
            {day.day}
          </span>
          <span className={`text-xs font-bold ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{day.title}</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${CAT_COLORS[day.category]}15`, color: CAT_COLORS[day.category] }}>
            {day.category}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${PRIORITY_COLORS[day.priority]}15`, color: PRIORITY_COLORS[day.priority] }}>
            {day.priority}
          </span>
          {day.automatable && <Zap className="w-3 h-3 text-primary" title="Automatable" />}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{day.desc}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {day.tools.map((t, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-[8px] text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}