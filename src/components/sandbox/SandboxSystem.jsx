import { useState } from "react";
import SandboxOptimizer from "./SandboxOptimizer";
import SandboxRunner from "../simulation/SandboxRunner";
import RecommendationPanel from "../recommendations/RecommendationPanel";
import { BarChart3, Activity, Lightbulb } from "lucide-react";

export default function SandboxSystem({ autoRun = false, onScrollTo }) {
  const [activeTab, setActiveTab] = useState(autoRun ? "pipeline" : "optimizer");

  const tabs = [
    { id: "optimizer", label: "⚡ AI Optimizer", icon: BarChart3, color: "#a855f7" },
    { id: "pipeline", label: "Pipeline Tester", icon: Activity, color: "#06b6d4" },
    { id: "recommendations", label: "💡 Implement Recommendations", icon: Lightbulb, color: "#d4af37" },
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
        {activeTab === "recommendations" && (
          <RecommendationPanel 
            recommendations={[
              { id: '1', title: 'Route Hot Leads to Priority Queue', description: 'Move leads with score > 75 to Contacted stage with priority 10', type: 'route_hot_leads', priority: 'high', impact: '15-20% faster closing' },
              { id: '2', title: 'Generate Proposals for Pre-Bid Jobs', description: 'Auto-create proposals for jobs in pre_bid phase', type: 'generate_proposals', priority: 'high', impact: '30% more bids submitted' },
              { id: '3', title: 'Queue Outreach Emails', description: 'Automatically send follow-up emails to Qualified leads', type: 'auto_send_emails', priority: 'medium', impact: '25% more engagement' },
              { id: '4', title: 'Adjust Scoring Logic', description: 'Recalculate lead scores using improved algorithm', type: 'adjust_scoring_logic', priority: 'medium', impact: 'Better lead quality' },
              { id: '5', title: 'Cleanup Duplicate Leads', description: 'Identify and flag duplicate company/contact records', type: 'cleanup_duplicates', priority: 'low', impact: 'Cleaner database' },
            ]}
            onRefresh={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}