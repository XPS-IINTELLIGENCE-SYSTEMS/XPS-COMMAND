import { useState } from "react";
import { cn } from "@/lib/utils";
import { Globe, Wand2, Radar, Terminal, Activity } from "lucide-react";
import AgentToolbar, { AGENTS } from "./AgentToolbar";
import AgentWorkspace from "./AgentWorkspace";
import BrowserPanel from "./BrowserPanel";
import ToolsPanel from "./ToolsPanel";
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "../admin/CommandScraper";
import AdminChat from "../admin/AdminChat";
import AgentCommandCenter from "./AgentCommandCenter";

const TABS = [
  { id: "command", label: "Command Center", icon: Activity },
  { id: "agents", label: "Agent Workspace", icon: Globe },
];

export default function AgentCommandPage() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [activeTab, setActiveTab] = useState("command");

  const handleSelectAgent = (agent) => {
    setActiveAgent(prev => prev?.id === agent.id ? null : agent);
    setActiveTab("agents");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-white/[0.06] bg-card/50 px-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-[1px]",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "command" ? (
        <div className="flex-1 overflow-hidden">
          <AgentCommandCenter />
        </div>
      ) : (
        <>
          {/* Agent toolbar */}
          <AgentToolbar activeAgentId={activeAgent?.id} onSelect={handleSelectAgent} />

          {/* Workspace */}
          <div className="flex-1 overflow-hidden flex">
            {activeAgent ? (
              <AgentWorkspace agent={activeAgent} />
            ) : (
              <EmptyState />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-3">
        <div className="w-16 h-16 rounded-2xl glass-card-active flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 metallic-gold-icon" />
        </div>
        <h2 className="text-lg font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          SELECT AN AGENT
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Click any agent in the toolbar above to open a full workspace with browser, tools, and AI chat — all in one view.
        </p>
      </div>
    </div>
  );
}