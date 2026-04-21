import { useState } from "react";
import {
  Presentation, Globe, Monitor, Palette, Plus, ArrowUp
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Create slides", icon: Presentation },
  { label: "Build website", icon: Globe },
  { label: "Develop desktop apps", icon: Monitor },
  { label: "Design", icon: Palette },
  { label: "More", icon: null },
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
    <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
      {/* Heading — no logo, no subtitle, just like Manus */}
      <h1 className="text-[32px] md:text-[40px] font-normal text-[#1a1a1a] mb-8 text-center leading-tight"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        What can I do for you?
      </h1>

      {/* Prompt Box — white card, rounded, subtle shadow */}
      <div className="w-full max-w-[560px]">
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#e5e5e5]/60">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Assign a task or ask anything"
            rows={2}
            className="w-full resize-none border-0 bg-transparent px-5 pt-4 pb-1 text-[15px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none"
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] text-[#999] transition-colors">
              <Plus className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="h-8 w-8 flex items-center justify-center rounded-full transition-all disabled:opacity-20"
              style={{ backgroundColor: prompt.trim() ? "#1a1a1a" : "#e0e0e0" }}
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Action Chips — single row, no colored icons */}
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleChipClick(action.label)}
                className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] text-[13px] text-[#666] hover:text-[#333] transition-all"
              >
                {Icon && <Icon className="w-[14px] h-[14px]" />}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}