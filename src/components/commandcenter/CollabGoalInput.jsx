import { useState } from "react";
import { Sparkles, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PRESETS = [
  "Research top 10 GC companies in Texas, profile them, and draft personalized outreach emails",
  "Analyze our entire lead pipeline, score every lead, and generate a strategy report with top recommendations",
  "Find 20 new commercial flooring projects, research each one, create bid packages, and schedule follow-ups",
  "Deep competitive analysis of top 5 epoxy competitors, extract pricing, and create a counter-strategy",
];

export default function CollabGoalInput({ onSubmit, loading }) {
  const [goal, setGoal] = useState("");

  const submit = () => {
    if (!goal.trim() || loading) return;
    onSubmit(goal.trim());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground">Collaborative Multi-Agent Goal</h3>
        <span className="text-[8px] text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded-full">agents coordinate in real-time</span>
      </div>
      <Textarea
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Describe a complex goal — multiple agents will collaborate, delegate, self-correct, and deliver a unified result..."
        rows={3}
        className="text-xs resize-none"
        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit(); }}
      />
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => setGoal(p)} className="text-[8px] px-2 py-1 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all truncate max-w-[200px]">
            {p.substring(0, 60)}...
          </button>
        ))}
      </div>
      <Button onClick={submit} disabled={loading || !goal.trim()} className="w-full metallic-gold-bg text-background font-bold text-xs">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {loading ? "Agents Collaborating..." : "Launch Multi-Agent Collaboration"}
      </Button>
    </div>
  );
}