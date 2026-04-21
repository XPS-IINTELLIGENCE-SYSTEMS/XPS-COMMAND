import { MessageSquare } from "lucide-react";

export default function CeoBriefing({ summary }) {
  if (!summary) return null;
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 metallic-gold-icon" />
        <h2 className="text-sm font-bold text-foreground">Operations Summary</h2>
      </div>
      <div className="text-[11px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}