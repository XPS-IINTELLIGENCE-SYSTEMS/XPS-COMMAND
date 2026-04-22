import { useState } from "react";
import SandboxOptimizer from "./SandboxOptimizer";
import SandboxRunner from "../simulation/SandboxRunner";
import { BarChart3, Activity } from "lucide-react";

export default function SandboxSystem({ autoRun = false, onScrollTo }) {
  const [activeTab, setActiveTab] = useState(autoRun ? "pipeline" : "optimizer");

  const tabs = [
    { id: "optimizer", label: "⚡ AI Optimizer", icon: BarChart3, color: "#a855f7" },
    { id: "pipeline", label: "Pipeline Tester", icon: Activity, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab nav */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "optimizer" && <SandboxOptimizer />}
        {activeTab === "pipeline" && <SandboxRunner />}
      </div>
    </div>
  );
}