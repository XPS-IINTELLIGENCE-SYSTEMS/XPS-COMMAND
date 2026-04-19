import { Sparkles } from "lucide-react";

export default function WorkflowAITooltip({ recommendation }) {
  if (!recommendation) return null;
  
  return (
    <div className="absolute left-full top-0 ml-2 z-50 w-64 p-3.5 rounded-lg border border-primary/30 bg-card shadow-xl shadow-primary/10 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-200">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Recommendation</span>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed">{recommendation}</p>
    </div>
  );
}