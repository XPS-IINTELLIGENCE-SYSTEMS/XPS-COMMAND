import { useState, useEffect } from "react";
import { Activity, Sparkles, Play, Target, Brain, Zap, BarChart3, Shield } from "lucide-react";
import SandboxRunner from "../simulation/SandboxRunner";
import SandboxOptimizer from "./SandboxOptimizer";

const TABS = [
  { id: "optimizer", label: "AI Optimizer", icon: Sparkles, color: "#d4af37", desc: "Scan system → ranked recs → auto-fix" },
  { id: "pipeline", label: "Pipeline Test", icon: Activity, color: "#8b5cf6", desc: "8-step live data simulation" },
];

export default function SandboxSystem({ autoRun = false, onScrollTo }) {
  const [tab, setTab] = useState("optimizer");

  // Auto-start the optimizer tab if requested
  useEffect(() => {
    if (autoRun) setTab("optimizer");
  }, [autoRun]);

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${
                tab === t.id ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className="text-[8px] opacity-60 hidden sm:inline">— {t.desc}</span>
            </button>
          );
        })}
      </div>

      {tab === "optimizer" && <SandboxOptimizer onScrollTo={onScrollTo} />}
      {tab === "pipeline" && <SandboxRunner />}
    </div>
  );
}