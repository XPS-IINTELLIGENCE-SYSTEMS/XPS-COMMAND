import { useState } from "react";
import { Briefcase, Search, Users, HardHat, GitBranch } from "lucide-react";
import BidPipelineTab from "./BidPipelineTab";
import JobDiscoveryTab from "./JobDiscoveryTab";
import ContractorDatabaseTab from "./ContractorDatabaseTab";
import ActiveJobsTab from "./ActiveJobsTab";
import BidWorkflowTab from "./BidWorkflowTab";

const TABS = [
  { id: "pipeline", label: "Bid Pipeline", icon: Briefcase },
  { id: "discover", label: "Discover Jobs", icon: Search },
  { id: "contractors", label: "Contractor DB", icon: Users },
  { id: "active", label: "Active Jobs", icon: HardHat },
  { id: "workflow", label: "Workflow", icon: GitBranch },
];

export default function BidCommandCenter() {
  const [tab, setTab] = useState("pipeline");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Briefcase className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Bid Command Center</h1>
          <p className="text-xs text-muted-foreground">Autonomous government & commercial bidding system</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "pipeline" && <BidPipelineTab key={refreshKey} />}
      {tab === "discover" && <JobDiscoveryTab onRefreshPipeline={() => { setRefreshKey(k => k + 1); setTab("pipeline"); }} />}
      {tab === "contractors" && <ContractorDatabaseTab />}
      {tab === "active" && <ActiveJobsTab />}
      {tab === "workflow" && <BidWorkflowTab />}
    </div>
  );
}