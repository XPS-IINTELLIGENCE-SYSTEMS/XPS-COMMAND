import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Globe, Wand2, Radar, Terminal } from "lucide-react";
import AgentFleet from "./AgentFleet";
import AgentWorkspace from "./AgentWorkspace";
import BrowserPanel from "./BrowserPanel";
import ToolsPanel from "./ToolsPanel";

const TABS = [
  { id: "agents", label: "Agent Fleet", icon: Bot },
  { id: "browser", label: "Web Browser", icon: Globe },
  { id: "tools", label: "Creator Tools", icon: Wand2 },
  { id: "scraper", label: "Scraper", icon: Radar },
  { id: "terminal", label: "Command", icon: Terminal },
];

export default function AgentCommandPage() {
  const [tab, setTab] = useState("agents");
  const [activeAgent, setActiveAgent] = useState(null);

  const handleLaunchAgent = (agent) => {
    setActiveAgent(agent);
  };

  const handleCloseAgent = () => {
    setActiveAgent(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/30 flex-shrink-0 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setActiveAgent(null); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", tab === t.id ? "metallic-gold-icon" : "metallic-silver-icon")} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeAgent ? (
          <AgentWorkspace agent={activeAgent} onClose={handleCloseAgent} />
        ) : (
          <div className="flex-1 overflow-hidden">
            {tab === "agents" && <AgentFleet onLaunch={handleLaunchAgent} />}
            {tab === "browser" && <BrowserPanel />}
            {tab === "tools" && <ToolsPanel />}
            {tab === "scraper" && <ScraperPanel />}
            {tab === "terminal" && <TerminalPanel />}
          </div>
        )}
      </div>
    </div>
  );
}

// Lazy inline — loads existing components
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "../admin/CommandScraper";
import AdminChat from "../admin/AdminChat";

function ScraperPanel() {
  const [sub, setSub] = useState("shadow");
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border flex-shrink-0">
        <button onClick={() => setSub("shadow")} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold", sub === "shadow" ? "bg-primary/15 text-primary" : "text-muted-foreground")}>Shadow Scraper</button>
        <button onClick={() => setSub("command")} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold", sub === "command" ? "bg-primary/15 text-primary" : "text-muted-foreground")}>Command Scraper</button>
      </div>
      <div className="flex-1 overflow-hidden">
        {sub === "shadow" ? <ShadowScraper /> : <CommandScraper />}
      </div>
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="h-full overflow-hidden">
      <AdminChat />
    </div>
  );
}