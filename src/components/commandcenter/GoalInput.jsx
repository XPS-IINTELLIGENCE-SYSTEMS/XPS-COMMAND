import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";

export default function GoalInput({ onSubmit, loading }) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal.trim() || loading) return;
    onSubmit(goal.trim());
    setGoal("");
  };

  const presets = [
    "Find 20 new epoxy companies in Texas and profile them",
    "Score all unscored leads and email the top 10",
    "Research top 5 competitors and generate a comparison report",
    "Find commercial permits in Miami-Dade County this month",
  ];

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter a goal — the AI will plan and execute it autonomously..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            disabled={loading}
            inputMode="text"
            enterKeyHint="send"
          />
        </div>
        <button
          type="submit"
          disabled={!goal.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Launch
        </button>
      </form>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => setGoal(p)}
            className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            {p.length > 45 ? p.substring(0, 45) + '...' : p}
          </button>
        ))}
      </div>
    </div>
  );
}