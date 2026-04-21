import { useState } from "react";
import {
  Search, Globe, FileText, BarChart3, Code2, Presentation,
  Paintbrush, Briefcase, Database, Plus, ArrowUp, Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AgentZeroLogo from "./AgentZeroLogo";

const QUICK_ACTIONS = [
  { label: "Research companies", icon: Search, color: "#d4af37" },
  { label: "Build a website", icon: Globe, color: "#6366f1" },
  { label: "Create slides", icon: Presentation, color: "#06b6d4" },
  { label: "Analyze data", icon: BarChart3, color: "#22c55e" },
  { label: "Write code", icon: Code2, color: "#f59e0b" },
  { label: "Design assets", icon: Paintbrush, color: "#ec4899" },
  { label: "Generate reports", icon: FileText, color: "#8b5cf6" },
  { label: "More", icon: Plus, color: "#64748b" },
];

export default function AgentZeroHome({ onSubmit }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
    setPrompt("");
  };

  const handleChipClick = (label) => {
    if (label === "More") return;
    setPrompt(label);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
      {/* Logo + Headline */}
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-6">
          <AgentZeroLogo size="xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          What can I do for you?
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md">
          Assign a task or ask anything — Agent Zero handles the rest autonomously.
        </p>
      </div>

      {/* Prompt Box */}
      <div className="w-full max-w-2xl">
        <div className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Assign a task or ask anything..."
            className="min-h-[100px] max-h-[200px] resize-none border-0 bg-transparent p-4 pr-14 text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              size="icon"
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-30"
            >
              <ArrowUp className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleChipClick(action.label)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-card/80 hover:bg-secondary/80 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <Icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}