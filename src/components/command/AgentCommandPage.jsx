import { useState } from "react";
import { cn } from "@/lib/utils";
import { Globe, Wand2, Radar, Terminal } from "lucide-react";
import AgentToolbar, { AGENTS } from "./AgentToolbar";
import AgentWorkspace from "./AgentWorkspace";
import BrowserPanel from "./BrowserPanel";
import ToolsPanel from "./ToolsPanel";
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "../admin/CommandScraper";
import AdminChat from "../admin/AdminChat";

export default function AgentCommandPage() {
  const [activeAgent, setActiveAgent] = useState(null);

  const handleSelectAgent = (agent) => {
    setActiveAgent(prev => prev?.id === agent.id ? null : agent);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Thin agent bar */}
      <AgentToolbar activeAgentId={activeAgent?.id} onSelect={handleSelectAgent} />

      {/* Workspace */}
      <div className="flex-1 overflow-hidden flex">
        {activeAgent ? (
          <AgentWorkspace agent={activeAgent} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
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